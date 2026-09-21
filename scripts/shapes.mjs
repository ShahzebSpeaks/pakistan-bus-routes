// Build road-following route shapes into data/shapes/<system-id>/<route-id>.json.
//
// Bus and BRT routes are routed along OpenStreetMap roads through their ordered stops using the public
// OSRM demo server (https://router.project-osrm.org, max 1 request/second). Metro rail uses straight
// segments between stations.
//
// Pakistani arterial roads are often dual carriageways, and a stop snapped to the wrong side makes the
// router add a U-turn loop. To avoid that, every waypoint carries the travel bearing, and each
// stop-to-stop leg is checked: a leg much longer than the straight distance is routed again on its own,
// and if it is still implausible that single leg becomes a straight segment.
// Results are cached by a hash of the stop coordinates, so only changed routes are re-fetched.
//   node scripts/shapes.mjs [--refresh] [system-id ...]
import crypto from 'node:crypto';
import path from 'node:path';
import { SHAPES_DIR, USER_AGENT, cumulative, decodePolyline, encodePolyline, haversine, loadSystems, readJSON, simplify, sleep, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const only = new Set(args.filter((a) => !a.startsWith('--')));
const OSRM = process.env.OSRM_URL || 'https://router.project-osrm.org';
const CHUNK = 50;
const VERSION = 2; // bump to invalidate cached shapes when the algorithm changes

const toRad = (d) => (d * Math.PI) / 180;
function bearing(a, b) {
  const y = Math.sin(toRad(b[1] - a[1])) * Math.cos(toRad(b[0]));
  const x = Math.cos(toRad(a[0])) * Math.sin(toRad(b[0])) - Math.sin(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.cos(toRad(b[1] - a[1]));
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

const plausibleLeg = (metres, a, b) => metres <= haversine(a[0], a[1], b[0], b[1]) * 1.8 + 600;

async function request(url) {
  for (let attempt = 0; attempt < 4; attempt++) {
    await sleep(1100 + attempt * 4000);
    try {
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT }, signal: AbortSignal.timeout(60_000) });
      if (res.status === 429) continue;
      const json = await res.json();
      if (json.code !== 'Ok') throw new Error(json.code || `HTTP ${res.status}`);
      return json;
    } catch (err) {
      if (attempt === 3) throw err;
    }
  }
  throw new Error('OSRM rate limited');
}

/** Route through all points; returns per-leg geometry [[lat,lon]...] and distance. */
async function routeLegs(points, { withBearings }) {
  const coords = points.map(([lat, lon]) => `${lon.toFixed(6)},${lat.toFixed(6)}`).join(';');
  let url = `${OSRM}/route/v1/driving/${coords}?overview=false&steps=true&geometries=polyline6`;
  if (withBearings) {
    const bears = points.map((p, i) => bearing(points[Math.max(0, i - 1)], points[Math.min(points.length - 1, i + 1)]));
    url += `&bearings=${bears.map((b) => `${b},60`).join(';')}&radiuses=${points.map(() => 200).join(';')}`;
  }
  const json = await request(url);
  return json.routes[0].legs.map((leg) => {
    const line = [];
    for (const step of leg.steps) {
      const g = decodePolyline(step.geometry, 6);
      line.push(...(line.length ? g.slice(1) : g));
    }
    return { line, metres: leg.distance };
  });
}

let built = 0, cached = 0, straightLegsTotal = 0;
for (const { system } of loadSystems().filter(({ system }) => !only.size || only.has(system.id))) {
  for (const route of system.routes) {
    const mode = route.mode || system.mode;
    const pts = route.stops.filter((s) => s.lat != null && s.lon != null).map((s) => [s.lat, s.lon]);
    const file = path.join(SHAPES_DIR, system.id, `${route.id.replace(/[^A-Za-z0-9_-]+/g, '_')}.json`);
    if (pts.length < 2) continue;
    const hash = crypto.createHash('sha1').update(JSON.stringify([VERSION, mode, route.shape ?? null, pts])).digest('hex').slice(0, 16);
    const prev = readJSON(file, null);
    if (prev && prev.hash === hash && !refresh) {
      cached++;
      continue;
    }

    let line = pts;
    let source = 'straight';
    let note = '';
    let straightLegs = 0;
    if (mode !== 'metro_rail' && mode !== 'rail' && route.shape !== 'straight') {
      try {
        const legs = [];
        for (let i = 0; i < pts.length - 1; i += CHUNK - 1) {
          const chunk = pts.slice(i, i + CHUNK);
          if (chunk.length < 2) break;
          // Bearings can make a waypoint unsnappable (NoSegment); then route that chunk without them.
          legs.push(...(await routeLegs(chunk, { withBearings: true }).catch(() => routeLegs(chunk, { withBearings: false }))));
        }
        // re-route implausible legs on their own, without bearings; fall back to a straight segment
        for (let i = 0; i < legs.length; i++) {
          const a = pts[i];
          const b = pts[i + 1];
          if (plausibleLeg(legs[i].metres, a, b)) continue;
          let fixed = null;
          try {
            const [alone] = await routeLegs([a, b], { withBearings: false });
            if (plausibleLeg(alone.metres, a, b)) fixed = alone;
          } catch {
            /* keep straight */
          }
          legs[i] = fixed ?? { line: [a, b], metres: haversine(a[0], a[1], b[0], b[1]) };
          if (!fixed) straightLegs++;
        }
        line = [];
        for (const leg of legs) {
          // join each leg to the exact stop positions so the line passes through the stops
          const seg = leg.line.length ? leg.line : [];
          line.push(...(line.length ? seg.slice(1) : seg));
        }
        source = straightLegs === legs.length ? 'straight' : 'osrm';
        if (straightLegs) note = `${straightLegs} of ${legs.length} legs drawn straight`;
      } catch (err) {
        note = `routing failed: ${err.message}`;
        line = pts;
      }
    }
    straightLegsTotal += straightLegs;
    // Long-distance lines need far fewer points to look right.
    const simplified = simplify(line, mode === 'intercity_bus' ? 60 : 5);
    const km = cumulative(simplified).at(-1) / 1000;
    writeJSON(file, {
      system: system.id,
      route: route.id,
      hash,
      source,
      note,
      length_km: +km.toFixed(2),
      polyline: encodePolyline(simplified),
      generated_at: new Date().toISOString(),
      license: source === 'osrm' ? 'Derived from OpenStreetMap data (ODbL) via OSRM' : 'Derived from stop coordinates',
    });
    built++;
    const ref = route.length_km ? ` (published ${route.length_km} km)` : '';
    console.log(`${system.id}/${route.id}: ${source} ${km.toFixed(1)} km${ref} ${note}`);
  }
}
console.log(`\nshapes built ${built}, cached ${cached}, straight legs ${straightLegsTotal}`);
