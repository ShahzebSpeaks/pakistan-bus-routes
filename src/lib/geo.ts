export type LatLon = [number, number];

const R = 6371008.8;
const rad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversine(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Decode a Google encoded polyline (precision 5). */
export function decodePolyline(str: string, precision = 5): LatLon[] {
  const factor = 10 ** precision;
  const out: LatLon[] = [];
  let index = 0;
  let lat = 0;
  let lon = 0;
  while (index < str.length) {
    for (let which = 0; which < 2; which++) {
      let result = 0;
      let shift = 0;
      let byte: number;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < str.length);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += delta;
      else lon += delta;
    }
    out.push([lat / factor, lon / factor]);
  }
  return out;
}

export function encodePolyline(points: LatLon[], precision = 5): string {
  const factor = 10 ** precision;
  let prevLat = 0;
  let prevLon = 0;
  let out = '';
  const enc = (v: number) => {
    let n = v < 0 ? ~(v << 1) : v << 1;
    let s = '';
    while (n >= 0x20) {
      s += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
      n >>= 5;
    }
    return s + String.fromCharCode(n + 63);
  };
  for (const [la, lo] of points) {
    const lat = Math.round(la * factor);
    const lon = Math.round(lo * factor);
    out += enc(lat - prevLat) + enc(lon - prevLon);
    prevLat = lat;
    prevLon = lon;
  }
  return out;
}

/**
 * Uniform grid spatial index for "items near a point" queries.
 * A ~500 m cell suits walking-radius lookups.
 */
export class GridIndex<T extends { lat: number; lon: number }> {
  private cells = new Map<string, number[]>();
  private readonly cellDeg: number;

  constructor(private items: T[], cellMetres = 500) {
    this.cellDeg = cellMetres / 111_320;
    items.forEach((it, i) => {
      const k = this.key(it.lat, it.lon);
      const list = this.cells.get(k);
      if (list) list.push(i);
      else this.cells.set(k, [i]);
    });
  }

  private key(lat: number, lon: number) {
    return `${Math.floor(lat / this.cellDeg)}:${Math.floor(lon / this.cellDeg)}`;
  }

  /** Items within `radius` metres, sorted by distance. */
  near(lat: number, lon: number, radius: number): { index: number; item: T; dist: number }[] {
    const latSpan = Math.ceil(radius / 111_320 / this.cellDeg);
    const lonSpan = Math.ceil(radius / (111_320 * Math.max(0.2, Math.cos(rad(lat)))) / this.cellDeg);
    const cy = Math.floor(lat / this.cellDeg);
    const cx = Math.floor(lon / this.cellDeg);
    const res: { index: number; item: T; dist: number }[] = [];
    for (let y = cy - latSpan; y <= cy + latSpan; y++) {
      for (let x = cx - lonSpan; x <= cx + lonSpan; x++) {
        const list = this.cells.get(`${y}:${x}`);
        if (!list) continue;
        for (const i of list) {
          const it = this.items[i];
          const d = haversine(lat, lon, it.lat, it.lon);
          if (d <= radius) res.push({ index: i, item: it, dist: d });
        }
      }
    }
    return res.sort((a, b) => a.dist - b.dist);
  }
}

export function formatDistance(m: number): string {
  if (m < 950) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10_000 ? 1 : 0)} km`;
}

export function formatMinutes(min: number): string {
  const m = Math.max(1, Math.round(min));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
