// Fill missing stop coordinates in data/systems/*.json.
//
// Coordinates written by this script always have coord_source starting with "auto:" so humans can
// tell them apart from verified ones. It never touches coordinates whose source is not "auto:".
//
// Strategy, per route (stops are ordered, so neighbours constrain where a stop can be):
//   1. Anchors: stops that already have verified coordinates.
//   2. OpenStreetMap name matches (data/cache/osm/<city>.json from fetch-osm.mjs). A name like
//      "Board Office (AO Chowk)" is matched on both parts, and the bracketed part is also used as
//      an area hint. A candidate is accepted when it is unambiguous or fits between known neighbours.
//   3. Outliers (stops that force a long detour between their neighbours) are removed again.
//   4. Nominatim search (cached in data/cache/nominatim.json, 1 request/second) for the rest.
//   5. Interpolation between known neighbours, marked "auto:interpolated" (shown as estimated).
// Optional private reference polylines in research/reference/<system-id>.geojson (feature
// property route_id) are used only to reject candidates far from the known alignment.
//
//   node scripts/geocode.mjs [--refresh] [--no-nominatim] [system-id ...]
import fs from 'node:fs';
import path from 'node:path';
import {
  CACHE_DIR, ROOT, USER_AGENT, cumulative, haversine, loadCities, loadSystems, nameKey,
  pointAlong, pointLineDistance, readJSON, sleep, tokenSimilarity, writeJSON,
} from './lib.mjs';

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const useNominatim = !args.includes('--no-nominatim');
const only = new Set(args.filter((a) => !a.startsWith('--')));

const cities = new Map(loadCities().map((c) => [c.id, c]));
const nominatimFile = path.join(CACHE_DIR, 'nominatim.json');
const nominatimCache = readJSON(nominatimFile, {});
const report = {};

const isAuto = (s) => typeof s.coord_source === 'string' && s.coord_source.startsWith('auto:');
const isVerified = (s) => hasCoord(s) && !isAuto(s);
const hasCoord = (s) => s.lat != null && s.lon != null;
const isInterpolated = (s) => String(s.coord_source).startsWith('auto:interpolated');

function kindBonus(kind, stationMode) {
  if (/^(public_transport|railway)=/.test(kind) || kind === 'highway=bus_stop' || kind === 'amenity=bus_station') return stationMode ? 0.25 : 0.15;
  if (/^junction=|^highway=(traffic_signals|motorway_junction|turning_circle)/.test(kind)) return 0.12;
  if (/^(place|boundary|landuse)=/.test(kind)) return 0.06;
  return 0;
}

const osmIndexes = new Map();
function osmIndex(city) {
  if (osmIndexes.has(city)) return osmIndexes.get(city);
  const file = path.join(CACHE_DIR, 'osm', `${city}.json`);
  let index = { byKey: new Map(), byToken: new Map(), features: [] };
  if (!fs.existsSync(file)) {
    console.warn(`! no OSM cache for ${city}; run npm run data:osm`);
  } else {
    const { features } = readJSON(file);
    index = { byKey: new Map(), byToken: new Map(), features };
    features.forEach((f, i) => {
      const keys = new Set(Object.entries(f.names).filter(([k]) => k !== 'name:ur').map(([, v]) => nameKey(v)).filter(Boolean));
      f.keys = [...keys];
      for (const k of keys) {
        if (!index.byKey.has(k)) index.byKey.set(k, []);
        index.byKey.get(k).push(i);
        for (const t of k.split(' ')) {
          if (t.length < 3) continue;
          if (!index.byToken.has(t)) index.byToken.set(t, new Set());
          index.byToken.get(t).add(i);
        }
      }
    });
  }
  osmIndexes.set(city, index);
  return index;
}

/** "Board Office (AO Chowk) interchange" -> ["Board Office interchange", "AO Chowk"] */
function nameParts(name) {
  const inner = [...String(name).matchAll(/\(([^)]+)\)/g)].map((m) => m[1]);
  const outer = String(name).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const splitSlash = (s) => s.split(/\s*\/\s*/).filter(Boolean);
  return { main: splitSlash(outer), hints: inner.flatMap(splitSlash) };
}

function matchKey(index, key) {
  const out = new Map();
  if (!key) return out;
  for (const i of index.byKey.get(key) || []) out.set(i, 1);
  const pool = new Set();
  for (const t of key.split(' ')) for (const i of index.byToken.get(t) || []) pool.add(i);
  if (pool.size < 4000) {
    for (const i of pool) {
      if (out.has(i)) continue;
      const f = index.features[i];
      const sim = Math.max(...f.keys.map((k) => tokenSimilarity(key, k)));
      // The OSM name containing the whole stop name ("Nursery" in "Nursery Bus Stop") is a strong signal.
      // The reverse ("Gulshan Ravi" area for stop "Gulshan Ravi Double Sarka") is not; similarity decides.
      const contains = f.keys.some((k) => ` ${k} `.includes(` ${key} `) && key.length >= 5);
      const score = Math.max(sim, contains ? 0.8 : 0);
      if (score >= 0.67) out.set(i, score);
    }
  }
  return out;
}

function osmCandidates(index, stopName, stationMode) {
  const { main, hints } = nameParts(stopName);
  const scored = new Map();
  for (const part of main) for (const [i, s] of matchKey(index, nameKey(part))) scored.set(i, Math.max(scored.get(i) ?? 0, s));
  // the bracketed text is often an alias ("Annu Bhai Park (Baqai)") or an area ("Dawood Chowrangi (Landhi)")
  const hintFeatures = [];
  for (const h of hints) {
    for (const [i, s] of matchKey(index, nameKey(h))) {
      scored.set(i, Math.max(scored.get(i) ?? 0, s * 0.95));
      if (s >= 0.8) hintFeatures.push(index.features[i]);
    }
  }
  return [...scored.entries()].map(([i, score]) => {
    const f = index.features[i];
    let bonus = kindBonus(f.kind, stationMode);
    // the centre of a large area (relation) is a poor stop position
    if (f.id.startsWith('relation/')) bonus -= 0.12;
    if (hintFeatures.length) {
      const near = hintFeatures.some((h) => h !== f && haversine(h.lat, h.lon, f.lat, f.lon) <= 3000);
      bonus += near ? 0.2 : -0.25;
    }
    return { lat: f.lat, lon: f.lon, score: score + bonus, source: `auto:osm:${f.id}`, kind: f.kind };
  });
}

async function nominatimCandidates(stopName, city) {
  const clean = String(stopName).replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
  const q = `${clean}, ${city.name.replace(/\s*\(.*\)/, '')}, Pakistan`;
  if (!(q in nominatimCache)) {
    const [s, w, n, e] = city.bbox;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=pk&bounded=1&viewbox=${w},${n},${e},${s}&q=${encodeURIComponent(q)}`;
    try {
      await sleep(1100);
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'en' } });
      if (!res.ok) return [];
      nominatimCache[q] = (await res.json()).map((r) => ({ lat: +r.lat, lon: +r.lon, name: r.name || r.display_name, id: `${r.osm_type}/${r.osm_id}`, type: `${r.category}=${r.type}` }));
    } catch {
      return [];
    }
    writeJSON(nominatimFile, nominatimCache);
  }
  const key = nameKey(clean);
  return nominatimCache[q]
    .map((r) => ({ lat: r.lat, lon: r.lon, score: 0.55 + 0.3 * tokenSimilarity(key, nameKey(r.name)), source: `auto:nominatim:${r.id}`, kind: r.type }))
    .filter((c) => c.score >= 0.7);
}

/** Nearest located stops before and after i. */
function neighbours(stops, i) {
  let p = i - 1;
  while (p >= 0 && !hasCoord(stops[p])) p--;
  let q = i + 1;
  while (q < stops.length && !hasCoord(stops[q])) q++;
  return { prev: p >= 0 ? p : null, next: q < stops.length ? q : null };
}

/** Max plausible straight-line distance for `gap` stop-to-stop hops. */
const reach = (gap, spacingKm) => (gap * spacingKm + 1.2) * 1000;
const dist = (a, b) => haversine(a.lat, a.lon, b.lat, b.lon);

function plausible(stops, i, c, spacingKm) {
  // a place already used by a differently named stop on this route is not this stop
  const key = nameKey(stops[i].name);
  if (stops.some((o, j) => j !== i && hasCoord(o) && !isInterpolated(o) && nameKey(o.name) !== key && dist(o, c) < 40)) return null;
  const { prev, next } = neighbours(stops, i);
  let penalty = 0;
  for (const j of [prev, next]) {
    if (j == null) continue;
    const d = dist(stops[j], c);
    if (d > reach(Math.abs(i - j), spacingKm)) return null;
    penalty += (d / 1000 / Math.max(1, Math.abs(i - j))) * 0.04;
  }
  if (prev != null && next != null) {
    const direct = dist(stops[prev], stops[next]);
    const detour = dist(stops[prev], c) + dist(c, stops[next]);
    if (detour > direct * 2 + 2500) return null;
  }
  return { ...c, adjusted: c.score - penalty, anchored: prev != null || next != null };
}

function oneCluster(cands, radius = 700) {
  return cands.length > 0 && cands.every((c) => haversine(c.lat, c.lon, cands[0].lat, cands[0].lon) <= radius);
}

function set(stop, c) {
  stop.lat = +c.lat.toFixed(6);
  stop.lon = +c.lon.toFixed(6);
  stop.coord_source = c.source;
}

function unset(stop) {
  stop.lat = null;
  stop.lon = null;
  stop.coord_source = null;
}

/** Remove automatic matches that create an implausible detour. Returns number removed. */
function removeOutliers(stops, spacingKm, rejected) {
  let removed = 0;
  for (let changed = true; changed; ) {
    changed = false;
    let worst = -1;
    let worstExcess = 0;
    stops.forEach((s, i) => {
      if (!hasCoord(s) || !isAuto(s) || isInterpolated(s)) return;
      const { prev, next } = neighbours(stops, i);
      let excess = 0;
      if (prev != null && next != null) {
        const direct = dist(stops[prev], stops[next]);
        const detour = dist(stops[prev], s) + dist(s, stops[next]);
        excess = detour - (direct * 2 + 2500);
      } else {
        const j = prev ?? next;
        if (j == null) return;
        excess = dist(stops[j], s) - reach(Math.abs(i - j), spacingKm);
      }
      if (excess > worstExcess) {
        worstExcess = excess;
        worst = i;
      }
    });
    if (worst >= 0) {
      rejected.add(`${worst}|${stops[worst].lat.toFixed(4)},${stops[worst].lon.toFixed(4)}`);
      unset(stops[worst]);
      removed++;
      changed = true;
    }
  }
  return removed;
}

function loadReference(systemId) {
  const file = path.join(ROOT, 'research', 'reference', `${systemId}.geojson`);
  if (!fs.existsSync(file)) return new Map();
  const gj = readJSON(file);
  return new Map(
    gj.features
      .filter((f) => f.geometry?.type === 'LineString')
      .map((f) => {
        const line = f.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        return [String(f.properties.route_id), { line, cum: cumulative(line) }];
      }),
  );
}

const systems = loadSystems().filter(({ system }) => !only.size || only.has(system.id));
const cityMemo = new Map(); // `${city}|${nameKey}` -> {lat, lon, source}

for (const pass of [1, 2]) {
  for (const { file, system } of systems) {
    const city = cities.get(system.city);
    if (!city) continue;
    const index = osmIndex(city.id);
    const refs = loadReference(system.id);
    const stationMode = system.mode === 'brt' || system.mode === 'metro_rail';
    const counts = { verified: 0, osm: 0, nominatim: 0, interpolated: 0, missing: 0 };

    for (const route of system.routes) {
      const stops = route.stops;
      if (pass === 1 && refresh) for (const s of stops) if (isAuto(s)) unset(s);
      // interpolated points are recomputed every pass so they follow improved anchors
      for (const s of stops) if (isInterpolated(s)) unset(s);
      const ref = refs.get(route.id);
      const spacingKm = route.length_km && stops.length > 1 ? Math.max(0.6, (route.length_km / (stops.length - 1)) * 2.2) : stationMode ? 2.5 : 3;
      const nearRef = (c) => !ref || pointLineDistance([c.lat, c.lon], ref.line, ref.cum).metres <= 700;
      const inBbox = (c) => c.lat >= city.bbox[0] && c.lat <= city.bbox[2] && c.lon >= city.bbox[1] && c.lon <= city.bbox[3];
      const rejected = new Set();
      const notRejected = (i) => (c) => !rejected.has(`${i}|${c.lat.toFixed(4)},${c.lon.toFixed(4)}`);

      for (const s of stops) {
        if (isVerified(s)) cityMemo.set(`${city.id}|${nameKey(s.name)}`, { lat: s.lat, lon: s.lon, source: `auto:same-name:${s.coord_source}` });
      }

      const candidates = stops.map((s) => {
        if (isVerified(s)) return [];
        const list = osmCandidates(index, s.name, stationMode || s.is_station).filter((c) => inBbox(c) && nearRef(c));
        const memo = cityMemo.get(`${city.id}|${nameKey(s.name)}`);
        if (memo && nearRef(memo)) list.push({ ...memo, score: 1.3, kind: 'memo' });
        return list;
      });

      const seed = () => {
        stops.forEach((s, i) => {
          if (hasCoord(s)) return;
          const strong = candidates[i].filter((c) => c.score >= 1).filter(notRejected(i));
          if (!strong.length || !(oneCluster(strong) || ref)) return;
          const ok = strong.map((c) => plausible(stops, i, c, spacingKm)).filter(Boolean);
          const best = ok.sort((a, b) => b.adjusted - a.adjusted)[0];
          if (best) set(s, best);
        });
      };
      const grow = () => {
        for (let changed = true, guard = 0; changed && guard < 12; guard++) {
          changed = false;
          stops.forEach((s, i) => {
            if (hasCoord(s) || !candidates[i].length) return;
            const ok = candidates[i].filter(notRejected(i)).map((c) => plausible(stops, i, c, spacingKm)).filter((c) => c && c.anchored);
            const best = ok.sort((a, b) => b.adjusted - a.adjusted)[0];
            if (best && best.adjusted >= 0.7) {
              set(s, best);
              changed = true;
            }
          });
        }
      };

      seed();
      grow();
      for (let round = 0; round < 3 && removeOutliers(stops, spacingKm, rejected); round++) {
        seed();
        grow();
      }

      if (pass === 2 && useNominatim) {
        for (let i = 0; i < stops.length; i++) {
          const s = stops[i];
          if (hasCoord(s)) continue;
          const found = (await nominatimCandidates(s.name, city)).filter((c) => inBbox(c) && nearRef(c)).filter(notRejected(i));
          const ok = found.map((c) => plausible(stops, i, c, spacingKm)).filter(Boolean);
          const anchored = ok.filter((c) => c.anchored);
          const pick = (anchored.length ? anchored : oneCluster(ok, 1500) ? ok : []).sort((a, b) => b.adjusted - a.adjusted)[0];
          if (pick) set(s, pick);
        }
        removeOutliers(stops, spacingKm, rejected);
      }

      // remember confident automatic matches for other routes in this city
      for (const s of stops) {
        if (hasCoord(s) && isAuto(s) && !isInterpolated(s) && !s.coord_source.startsWith('auto:same-name')) {
          const k = `${city.id}|${nameKey(s.name)}`;
          if (!cityMemo.has(k)) cityMemo.set(k, { lat: s.lat, lon: s.lon, source: s.coord_source });
        }
      }

      if (pass === 2) {
        // Interpolate: along the reference line when there is one, else straight between neighbours.
        const known = stops.map(hasCoord);
        stops.forEach((s, i) => {
          if (known[i]) return;
          let p = i - 1;
          while (p >= 0 && !known[p]) p--;
          let q = i + 1;
          while (q < stops.length && !known[q]) q++;
          const prev = p >= 0 ? p : null;
          const next = q < stops.length ? q : null;
          if (ref) {
            const along = (j) => pointLineDistance([stops[j].lat, stops[j].lon], ref.line, ref.cum).along;
            const a = prev != null ? along(prev) : 0;
            const b = next != null ? along(next) : ref.cum[ref.cum.length - 1];
            const t = (i - (prev ?? -1)) / ((next ?? stops.length) - (prev ?? -1));
            const pt = pointAlong(ref.line, ref.cum, a + (b - a) * t);
            set(s, { lat: pt[0], lon: pt[1], source: 'auto:interpolated' });
          } else if (prev != null && next != null) {
            // Anchors at (nearly) the same place would stack every stop between them on one point.
            if (dist(stops[prev], stops[next]) < 100) return;
            const t = (i - prev) / (next - prev);
            set(s, {
              lat: stops[prev].lat + t * (stops[next].lat - stops[prev].lat),
              lon: stops[prev].lon + t * (stops[next].lon - stops[prev].lon),
              source: 'auto:interpolated',
            });
          }
        });
        for (const s of stops) {
          if (!hasCoord(s)) counts.missing++;
          else if (!isAuto(s)) counts.verified++;
          else if (isInterpolated(s)) counts.interpolated++;
          else if (s.coord_source.startsWith('auto:nominatim')) counts.nominatim++;
          else counts.osm++;
        }
      }
    }
    if (pass === 2) {
      writeJSON(file, system);
      report[system.id] = counts;
      console.log(`${system.id.padEnd(34)} ${JSON.stringify(counts)}`);
    }
  }
}

writeJSON(path.join(CACHE_DIR, 'geocode-report.json'), { generated_at: new Date().toISOString(), systems: report });
