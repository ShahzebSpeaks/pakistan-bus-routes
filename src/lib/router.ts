import type { Place } from './data';

export type Tab = 'plan' | 'routes' | 'nearby' | 'about';

export interface AppLocation {
  city: string | null;
  tab: Tab;
  routeKey: string | null;
  stopId: string | null;
  from: Place | null;
  to: Place | null;
}

const TABS: Tab[] = ['plan', 'routes', 'nearby', 'about'];

function parsePlace(v: string | null): Place | null {
  if (!v) return null;
  const [lat, lon, ...rest] = v.split(',');
  const la = Number(lat);
  const lo = Number(lon);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  const label = decodeURIComponent(rest.join(',')) || `${la.toFixed(4)}, ${lo.toFixed(4)}`;
  return { lat: la, lon: lo, label };
}

const placeParam = (p: Place) => `${p.lat.toFixed(5)},${p.lon.toFixed(5)},${encodeURIComponent(p.label)}`;

/**
 * Hash routes:
 *   #/karachi/plan?from=lat,lon,label&to=lat,lon,label
 *   #/karachi/routes
 *   #/karachi/route/karachi-pbs:R1
 *   #/karachi/stop/tower
 *   #/karachi/nearby   #/karachi/about
 */
export function parseHash(hash: string): AppLocation {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(query);
  const loc: AppLocation = { city: parts[0] || null, tab: 'plan', routeKey: null, stopId: null, from: null, to: null };
  const section = parts[1];
  if (section === 'route' && parts[2]) {
    loc.tab = 'routes';
    loc.routeKey = parts[2];
  } else if (section === 'stop' && parts[2]) {
    loc.tab = 'routes';
    loc.stopId = parts[2];
  } else if (TABS.includes(section as Tab)) {
    loc.tab = section as Tab;
  }
  loc.from = parsePlace(params.get('from'));
  loc.to = parsePlace(params.get('to'));
  return loc;
}

export function buildHash(loc: AppLocation): string {
  if (!loc.city) return '#/';
  const c = encodeURIComponent(loc.city);
  if (loc.routeKey) return `#/${c}/route/${encodeURIComponent(loc.routeKey)}`;
  if (loc.stopId) return `#/${c}/stop/${encodeURIComponent(loc.stopId)}`;
  if (loc.tab === 'plan') {
    const q: string[] = [];
    if (loc.from) q.push(`from=${placeParam(loc.from)}`);
    if (loc.to) q.push(`to=${placeParam(loc.to)}`);
    return `#/${c}/plan${q.length ? `?${q.join('&')}` : ''}`;
  }
  return `#/${c}/${loc.tab}`;
}
