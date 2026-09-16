import { asset } from '../config';
import type { CityData, DatasetIndex, Route, Stop } from '../types';
import { decodePolyline, haversine, type LatLon } from './geo';

const cityCache = new Map<string, Promise<CityData>>();

export async function loadIndex(): Promise<DatasetIndex> {
  const res = await fetch(asset('data/index.json'));
  if (!res.ok) throw new Error(`index ${res.status}`);
  return res.json();
}

export function loadCity(id: string): Promise<CityData> {
  let p = cityCache.get(id);
  if (!p) {
    p = fetch(asset(`data/cities/${id}.json`)).then((r) => {
      if (!r.ok) throw new Error(`city ${r.status}`);
      return r.json() as Promise<CityData>;
    });
    p.catch(() => cityCache.delete(id));
    cityCache.set(id, p);
  }
  return p;
}

const shapeCache = new WeakMap<Route, LatLon[]>();
export function routeShape(route: Route): LatLon[] {
  let s = shapeCache.get(route);
  if (!s) {
    s = decodePolyline(route.shape);
    shapeCache.set(route, s);
  }
  return s;
}

/** Part of a route's shape between two stops, in travel order. */
export function shapeBetween(route: Route, stops: Map<string, Stop>, fromId: string, toId: string): LatLon[] {
  const line = routeShape(route);
  const a = stops.get(fromId);
  const b = stops.get(toId);
  if (!a || !b || line.length < 2) return a && b ? [[a.lat, a.lon], [b.lat, b.lon]] : [];
  const nearest = (s: Stop) => {
    let best = 0;
    let bestD = Infinity;
    line.forEach(([la, lo], i) => {
      const d = haversine(s.lat, s.lon, la, lo);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    return best;
  };
  const ia = nearest(a);
  const ib = nearest(b);
  const part = ia <= ib ? line.slice(ia, ib + 1) : line.slice(ib, ia + 1).reverse();
  return [[a.lat, a.lon], ...part, [b.lat, b.lon]];
}

export function normalizeSearch(s: string) {
  return s
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[-_/.,'()]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every query token must prefix-match some word of the name (English or Urdu). */
export function matches(query: string, ...names: (string | undefined)[]) {
  const q = normalizeSearch(query).split(' ').filter(Boolean);
  if (!q.length) return true;
  const words = names.filter(Boolean).map((n) => normalizeSearch(n!)).join(' ').split(' ');
  return q.every((t) => words.some((w) => w.startsWith(t)));
}

export interface Place {
  lat: number;
  lon: number;
  label: string;
  stopId?: string;
}

export async function searchPlaces(query: string, bbox: [number, number, number, number], signal?: AbortSignal): Promise<Place[]> {
  const [s, w, n, e] = bbox;
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=pk&bounded=1&viewbox=${w},${n},${e},${s}&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { 'Accept-Language': 'en,ur' } });
  if (!res.ok) return [];
  const json: { lat: string; lon: string; display_name: string; name?: string }[] = await res.json();
  return json.map((r) => ({
    lat: +r.lat,
    lon: +r.lon,
    label: r.name || r.display_name.split(',').slice(0, 2).join(','),
  }));
}
