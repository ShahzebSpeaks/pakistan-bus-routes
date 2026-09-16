import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { TILE_ATTRIBUTION, TILE_URL } from '../config';
import { routeShape, shapeBetween, type Place } from '../lib/data';
import type { Dict, Lang } from '../lib/i18n';
import { localName } from '../lib/i18n';
import type { Itinerary } from '../lib/planner';
import type { CityData, CitySummary, Stop } from '../types';

export interface MapViewProps {
  city: CitySummary;
  data: CityData | null;
  lang: Lang;
  t: Dict;
  /** routes drawn faintly in the background */
  backgroundRoutes: number[];
  /** routes drawn prominently with their stops */
  highlightRoutes: number[];
  selectedStopId: string | null;
  itinerary: Itinerary | null;
  from: Place | null;
  to: Place | null;
  userLocation: { lat: number; lon: number; accuracy: number } | null;
  /** change this string to re-fit the view to the current content */
  fitKey: string;
  onStopClick: (id: string) => void;
  onRouteClick: (index: number) => void;
  onPick: (which: 'from' | 'to', lat: number, lon: number) => void;
}

const pinIcon = (cls: string, label: string) =>
  L.divIcon({ className: `pin ${cls}`, html: `<span>${label}</span>`, iconSize: [30, 30], iconAnchor: [15, 30] });

export default function MapView(props: MapViewProps) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<{ bg: L.LayerGroup; hl: L.LayerGroup; stops: L.LayerGroup; plan: L.LayerGroup; me: L.LayerGroup } | null>(null);
  const renderer = useRef<L.Canvas | null>(null);
  const pendingFit = useRef<L.LatLngBounds | null>(null);
  const propsRef = useRef(props);
  propsRef.current = props;

  /** Fit the remembered bounds once the map actually has a size on screen. */
  function applyFit() {
    const m = map.current;
    const bounds = pendingFit.current;
    if (!m || !bounds) return;
    const size = m.getSize();
    if (size.x < 80 || size.y < 80) return; // laid out later; the resize observer retries
    const narrow = size.x < 520;
    m.fitBounds(bounds, { padding: narrow ? [25, 25] : [60, 60], maxZoom: 16, animate: false });
    pendingFit.current = null;
  }

  // create map once
  useEffect(() => {
    if (!el.current || map.current) return;
    const m = L.map(el.current, { zoomControl: false, preferCanvas: true, attributionControl: true });
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer(TILE_URL, { maxZoom: 19, attribution: TILE_ATTRIBUTION, className: 'basemap' }).addTo(m);
    renderer.current = L.canvas({ padding: 0.5, tolerance: 6 });
    layers.current = {
      bg: L.layerGroup().addTo(m),
      hl: L.layerGroup().addTo(m),
      stops: L.layerGroup().addTo(m),
      plan: L.layerGroup().addTo(m),
      me: L.layerGroup().addTo(m),
    };
    m.on('click', (e: L.LeafletMouseEvent) => {
      const { t } = propsRef.current;
      const box = document.createElement('div');
      box.className = 'pick-popup';
      const mk = (label: string, which: 'from' | 'to') => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.className = which === 'from' ? 'btn btn-from' : 'btn btn-to';
        b.onclick = () => {
          propsRef.current.onPick(which, e.latlng.lat, e.latlng.lng);
          m.closePopup();
        };
        box.appendChild(b);
      };
      mk(t.fromHere, 'from');
      mk(t.toHere, 'to');
      L.popup({ closeButton: false, className: 'pick' }).setLatLng(e.latlng).setContent(box).openOn(m);
    });
    m.on('zoomend', () => drawStops());
    map.current = m;
    if (import.meta.env.DEV) (window as unknown as { __map?: L.Map }).__map = m;
    const c = propsRef.current.city;
    m.setView(c.center, c.zoom);
    const ro = new ResizeObserver(() => {
      m.invalidateSize();
      applyFit();
    });
    ro.observe(el.current);
    return () => {
      ro.disconnect();
      m.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopMap = () => new Map((propsRef.current.data?.stops ?? []).map((s) => [s.id, s]));

  function drawStops() {
    const m = map.current;
    const lg = layers.current;
    const p = propsRef.current;
    if (!m || !lg || !p.data) return;
    lg.stops.clearLayers();
    const zoom = m.getZoom();
    const stops = stopMap();
    const shown = new Set<string>();
    const add = (s: Stop, strong: boolean) => {
      if (shown.has(s.id)) return;
      shown.add(s.id);
      const selected = s.id === p.selectedStopId;
      const estimated = s.quality === 'estimated' || s.quality === 'geocoded';
      const marker = L.circleMarker([s.lat, s.lon], {
        renderer: renderer.current!,
        radius: selected ? 9 : strong ? (s.is_station ? 6 : 5) : 3.5,
        weight: selected ? 3 : strong ? 2 : 1,
        color: selected ? '#111' : strong ? '#1b1f1d' : '#5f6b66',
        fillColor: selected ? '#ffd54f' : '#ffffff',
        fillOpacity: 1,
        dashArray: estimated && strong ? '2 2' : undefined,
      });
      marker.bindTooltip(localName(p.lang, s), { direction: 'top', offset: [0, -6], className: 'stop-tip' });
      marker.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        propsRef.current.onStopClick(s.id);
      });
      marker.addTo(lg.stops);
    };
    for (const ri of p.highlightRoutes) {
      const r = p.data.routes[ri];
      r?.stops.forEach((id) => {
        const s = stops.get(id);
        if (s) add(s, true);
      });
    }
    if (p.selectedStopId) {
      const s = stops.get(p.selectedStopId);
      if (s) add(s, true);
    }
    if (zoom >= 14 && !p.itinerary) {
      const b = m.getBounds().pad(0.2);
      for (const s of p.data.stops) if (b.contains([s.lat, s.lon])) add(s, false);
    }
  }

  // routes, stops, itinerary
  useEffect(() => {
    const m = map.current;
    const lg = layers.current;
    if (!m || !lg) return;
    const { data, backgroundRoutes, highlightRoutes, itinerary } = props;
    lg.bg.clearLayers();
    lg.hl.clearLayers();
    lg.plan.clearLayers();
    if (!data) return;
    const faded = highlightRoutes.length > 0 || Boolean(itinerary);
    for (const ri of backgroundRoutes) {
      const r = data.routes[ri];
      if (!r) continue;
      const line = L.polyline(routeShape(r), {
        renderer: renderer.current!,
        color: r.color,
        weight: faded ? 2.5 : 3.5,
        opacity: faded ? 0.22 : r.status === 'operational' ? 0.75 : 0.4,
        dashArray: r.status === 'operational' || r.status === 'unverified' ? undefined : '6 6',
      });
      line.bindTooltip(`${r.id}${props.t.sep}${localName(props.lang, r)}`, { sticky: true, className: 'stop-tip' });
      line.on('click', (ev) => {
        L.DomEvent.stopPropagation(ev);
        propsRef.current.onRouteClick(ri);
      });
      line.addTo(lg.bg);
    }
    for (const ri of highlightRoutes) {
      const r = data.routes[ri];
      if (!r) continue;
      const shape = routeShape(r);
      L.polyline(shape, { renderer: renderer.current!, color: '#ffffff', weight: 9, opacity: 0.9 }).addTo(lg.hl);
      L.polyline(shape, { renderer: renderer.current!, color: r.color, weight: 5.5, opacity: 1, dashArray: r.status === 'operational' || r.status === 'unverified' ? undefined : '8 8' }).addTo(lg.hl);
    }
    if (itinerary) {
      const stops = stopMap();
      for (const leg of itinerary.legs) {
        if (leg.kind === 'walk') {
          L.polyline([[leg.from.lat, leg.from.lon], [leg.to.lat, leg.to.lon]], { renderer: renderer.current!, color: '#455a64', weight: 4, dashArray: '2 8', lineCap: 'round' }).addTo(lg.plan);
        } else {
          const r = data.routes[leg.routeIndex];
          const part = shapeBetween(r, stops, leg.stopIds[0], leg.stopIds[leg.stopIds.length - 1]);
          L.polyline(part, { renderer: renderer.current!, color: '#ffffff', weight: 10, opacity: 0.95 }).addTo(lg.plan);
          L.polyline(part, { renderer: renderer.current!, color: r.color, weight: 6 }).addTo(lg.plan);
          for (const id of [leg.stopIds[0], leg.stopIds[leg.stopIds.length - 1]]) {
            const s = stops.get(id);
            if (s) {
              L.circleMarker([s.lat, s.lon], { renderer: renderer.current!, radius: 7, weight: 3, color: r.color, fillColor: '#fff', fillOpacity: 1 })
                .bindTooltip(localName(props.lang, s), { permanent: true, direction: 'right', offset: [8, 0], className: 'stop-tip permanent' })
                .addTo(lg.plan);
            }
          }
        }
      }
    }
    drawStops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.data, props.backgroundRoutes, props.highlightRoutes, props.itinerary, props.selectedStopId, props.lang]);

  // from/to pins and user location
  useEffect(() => {
    const lg = layers.current;
    if (!lg) return;
    lg.me.clearLayers();
    const { from, to, userLocation, t } = props;
    const addPin = (p: Place, which: 'from' | 'to') => {
      const mk = L.marker([p.lat, p.lon], { icon: pinIcon(which, which === 'from' ? 'A' : 'B'), draggable: true, keyboard: false, title: which === 'from' ? t.from : t.to });
      mk.on('dragend', () => {
        const ll = mk.getLatLng();
        propsRef.current.onPick(which, ll.lat, ll.lng);
      });
      mk.addTo(lg.me);
    };
    if (from) addPin(from, 'from');
    if (to) addPin(to, 'to');
    if (userLocation) {
      L.circle([userLocation.lat, userLocation.lon], { radius: Math.min(userLocation.accuracy, 400), color: '#1e88e5', weight: 1, fillOpacity: 0.12 }).addTo(lg.me);
      L.circleMarker([userLocation.lat, userLocation.lon], { radius: 7, color: '#fff', weight: 3, fillColor: '#1e88e5', fillOpacity: 1 }).addTo(lg.me);
    }
  }, [props.from, props.to, props.userLocation, props.t]);

  // fit view
  useEffect(() => {
    const m = map.current;
    if (!m) return;
    const { data, highlightRoutes, itinerary, city, selectedStopId, from, to } = props;
    const pts: L.LatLngExpression[] = [];
    if (itinerary && data) {
      if (from) pts.push([from.lat, from.lon]);
      if (to) pts.push([to.lat, to.lon]);
      const stops = stopMap();
      for (const leg of itinerary.legs) if (leg.kind === 'ride') for (const id of leg.stopIds) {
        const s = stops.get(id);
        if (s) pts.push([s.lat, s.lon]);
      }
    } else if (highlightRoutes.length && data) {
      for (const ri of highlightRoutes) if (data.routes[ri]) pts.push(...routeShape(data.routes[ri]));
    } else if (selectedStopId && data) {
      const s = data.stops.find((x) => x.id === selectedStopId);
      if (s) {
        pendingFit.current = null;
        m.setView([s.lat, s.lon], Math.max(m.getZoom(), 15), { animate: false });
        return;
      }
    } else if (from && to) {
      pts.push([from.lat, from.lon], [to.lat, to.lon]);
    }
    if (pts.length >= 2) {
      // Fitting before the map has its real size gives a wrong zoom, and animating a fit can be cut
      // short by a resize. So remember the target, fit without animation, and fit again on resize.
      pendingFit.current = L.latLngBounds(pts);
      applyFit();
    } else if (!pts.length) {
      pendingFit.current = null;
      const [s, w, n, e] = city.bbox;
      if (!m.getBounds().intersects(L.latLngBounds([s, w], [n, e]))) m.setView(city.center, city.zoom, { animate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.fitKey]);

  // city change: recenter
  useEffect(() => {
    map.current?.setView(props.city.center, props.city.zoom, { animate: false });
  }, [props.city.id]);

  return <div ref={el} className="map" role="application" aria-label="Map" />;
}
