// Last-resort positions for intercity stops that geocode.mjs could not place.
// Stops are named like "Road Master Terminal, Faizabad, Islamabad" or just "Larkana". The place
// name (last comma part, brackets removed) is looked up in data/cities.json, then Nominatim
// (towns and cities only, cached in data/cache/places.json). The same check also corrects
// automatic positions that ended up more than 25 km from the town the stop is named after
// (bare names like "Hyderabad" often match a village elsewhere).
//   plain place name        -> coord_source "auto:nominatim" (the stop is the town itself)
//   named terminal/address  -> coord_source "auto:city" (shown as estimated: town centre, not the terminal)
//   node scripts/place-intercity.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const dry = process.argv.includes('--dry');
const CACHE = path.join(ROOT, 'data/cache/places.json');
const cache = fs.existsSync(CACHE) ? readJSON(CACHE) : {};
const key = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z]/g, '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const files = fs.readdirSync(SYSTEMS_DIR).filter((f) => f.startsWith('intercity-')).map((f) => path.join(SYSTEMS_DIR, f));
const systems = files.map((f) => [f, readJSON(f)]);

// Towns where Nominatim returns a same-named place elsewhere (checked against Wikipedia).
const FIXES = {
  Rawalpindi: [33.5973, 73.0479], Sadiqabad: [28.3091, 70.1307], Naran: [34.9093, 73.6507],
  Haroonabad: [29.6106, 73.1361], Kunri: [25.1783, 69.5658], Alipur: [29.3813, 70.9111],
  Jatoi: [29.5183, 70.8442], Jalalpur: [29.5053, 71.2224], Badin: [24.6558, 68.8383],
  Sanghar: [26.0464, 68.9481], 'Mandi Yazman': [29.1167, 71.75],
};

const known = new Map();
for (const [name, pos] of Object.entries(FIXES)) known.set(key(name), pos);
for (const c of readJSON(path.join(ROOT, 'data/cities.json')).cities) if (c.id !== 'intercity' && !known.has(key(c.name))) known.set(key(c.name), c.center);
const km = (a, b) => {
  const r = Math.PI / 180;
  const x = Math.sin(((b[0] - a[0]) * r) / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(((b[1] - a[1]) * r) / 2) ** 2;
  return 12742 * Math.asin(Math.sqrt(x));
};

async function nominatim(place) {
  if (place in cache) return cache[place];
  let hit = null;
  for (const q of [`${place}, Pakistan`, place]) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=pk,cn&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { 'User-Agent': 'pakistan-bus-routes (open data project)' } });
    await sleep(1100);
    if (!res.ok) continue;
    const found = (await res.json()).find((x) => x.class === 'place' || x.class === 'boundary');
    if (found) { hit = [Number(found.lat), Number(found.lon)]; break; }
  }
  cache[place] = hit;
  return hit;
}

const placeOf = (name) => {
  const parts = String(name).split(',').map((p) => p.trim()).filter(Boolean);
  return parts.at(-1).replace(/\(.*?\)/g, '').trim();
};

let placed = 0;
let moved = 0;
let failed = [];
for (const [file, s] of systems) {
  let changed = false;
  for (const r of s.routes) for (const st of r.stops) {
    const auto = st.lat == null || String(st.coord_source || '').startsWith('auto:');
    if (!auto) continue;
    const place = placeOf(st.name);
    const pos = known.get(key(place)) || (await nominatim(place));
    if (!pos) { if (st.lat == null) failed.push(st.name); continue; }
    known.set(key(place), pos);
    if (st.lat != null) {
      if (km([st.lat, st.lon], pos) <= 25) continue;
      moved++;
    }
    st.lat = Math.round(pos[0] * 1e5) / 1e5;
    st.lon = Math.round(pos[1] * 1e5) / 1e5;
    st.coord_source = st.name.includes(',') ? 'auto:city' : 'auto:nominatim';
    placed++;
    changed = true;
  }
  if (changed && !dry) writeJSON(file, s);
}
if (!dry) writeJSON(CACHE, cache);
console.log(`placed ${placed} stops (${moved} of them moved from a wrong automatic match); not found: ${[...new Set(failed)].join(', ') || 'none'}`);
