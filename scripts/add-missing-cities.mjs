// Add cities that appear in research/*.json or data/systems/*.json but are missing from data/cities.json.
// The centre comes from Nominatim; the bounding box is +/- 0.15 degrees, widened to include any known stop.
// Review the result by hand (Urdu names, province) before committing.
//   node scripts/add-missing-cities.mjs
import fs from 'node:fs';
import path from 'node:path';
import { DATA, ROOT, USER_AGENT, loadSystems, readJSON, sleep, writeJSON } from './lib.mjs';

const file = path.join(DATA, 'cities.json');
const doc = readJSON(file);
const known = new Set(doc.cities.map((c) => c.id));

const systems = [...loadSystems().map((s) => s.system)];
const researchDir = path.join(ROOT, 'research');
for (const f of fs.existsSync(researchDir) ? fs.readdirSync(researchDir) : []) {
  if (f.endsWith('.json')) systems.push(...(readJSON(path.join(researchDir, f)).systems || []));
}

const missing = new Map();
for (const s of systems) {
  if (known.has(s.city)) continue;
  if (!missing.has(s.city)) missing.set(s.city, { name: null, stops: [] });
  const m = missing.get(s.city);
  for (const r of s.routes || []) for (const st of r.stops || []) if (st.lat != null) m.stops.push([st.lat, st.lon]);
}

const title = (id) => id.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
const PROVINCE_HINT = { punjab: 'Punjab', sindh: 'Sindh', 'khyber pakhtunkhwa': 'Khyber Pakhtunkhwa', balochistan: 'Balochistan', 'azad kashmir': 'Azad Kashmir', 'azad jammu and kashmir': 'Azad Kashmir', 'gilgit-baltistan': 'Gilgit-Baltistan', 'islamabad capital territory': 'ICT' };

for (const [id, m] of missing) {
  const name = title(id);
  await sleep(1100);
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=pk&addressdetails=1&accept-language=en&q=${encodeURIComponent(`${name}, Pakistan`)}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  const [hit] = res.ok ? await res.json() : [];
  if (!hit) {
    console.warn(`! ${id}: not found, add manually`);
    continue;
  }
  const lat = +hit.lat;
  const lon = +hit.lon;
  let [s, w, n, e] = [lat - 0.15, lon - 0.15, lat + 0.15, lon + 0.15];
  for (const [la, lo] of m.stops) {
    s = Math.min(s, la - 0.02); n = Math.max(n, la + 0.02); w = Math.min(w, lo - 0.02); e = Math.max(e, lo + 0.02);
  }
  // Ask for the Urdu name separately
  await sleep(1100);
  let nameUr = '';
  try {
    const r2 = await fetch(`https://nominatim.openstreetmap.org/details?format=json&osmtype=${hit.osm_type[0].toUpperCase()}&osmid=${hit.osm_id}`, { headers: { 'User-Agent': USER_AGENT } });
    const det = r2.ok ? await r2.json() : {};
    nameUr = det.names?.['name:ur'] || '';
  } catch {
    /* optional */
  }
  const state = (hit.address?.state || '').toLowerCase();
  const city = {
    id, name, name_ur: nameUr, province: PROVINCE_HINT[state] || hit.address?.state || '',
    center: [+lat.toFixed(4), +lon.toFixed(4)], zoom: 13,
    bbox: [s, w, n, e].map((v) => +v.toFixed(2)),
  };
  doc.cities.push(city);
  console.log(`+ ${id}: ${city.center} ${city.province} ${nameUr}`);
}
writeJSON(file, doc);
