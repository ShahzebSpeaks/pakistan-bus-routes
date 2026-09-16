// Validate data/systems/*.json. Errors fail CI; warnings are printed for maintainers.
//   node scripts/validate.mjs [--strict]   (--strict turns warnings into errors)
import path from 'node:path';
import { haversine, loadCities, loadSystems, nameKey } from './lib.mjs';

const strict = process.argv.includes('--strict');
const cities = new Map(loadCities().map((c) => [c.id, c]));
const MODES = ['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus'];
const STATUSES = ['operational', 'under_construction', 'planned', 'suspended', 'unverified'];
const FARE_TYPES = ['flat', 'distance_slab', 'stop_count', 'range', 'unknown'];
const errors = [];
const warnings = [];
const seenSystems = new Set();

const isUrl = (u) => typeof u === 'string' && /^https?:\/\/\S+$/.test(u);

function checkFare(where, f) {
  if (!f) return;
  if (!FARE_TYPES.includes(f.type)) errors.push(`${where}: fare type "${f.type}" must be one of ${FARE_TYPES.join(', ')}`);
  if (f.type === 'flat' && typeof f.flat !== 'number') warnings.push(`${where}: flat fare without amount`);
  if (f.type === 'range' && (typeof f.min !== 'number' || typeof f.max !== 'number')) errors.push(`${where}: range fare needs numeric min and max`);
  if (f.type === 'distance_slab' || f.type === 'stop_count') {
    if (!Array.isArray(f.slabs) || !f.slabs.length) errors.push(`${where}: ${f.type} fare needs slabs`);
    else if (f.slabs.some((s) => typeof s.fare !== 'number')) errors.push(`${where}: every slab needs a numeric fare`);
  }
}

for (const { file, system: s } of loadSystems()) {
  const where = path.basename(file);
  if (`${s.id}.json` !== where) errors.push(`${where}: file name must equal system id "${s.id}.json"`);
  if (seenSystems.has(s.id)) errors.push(`${where}: duplicate system id`);
  seenSystems.add(s.id);
  const city = cities.get(s.city);
  if (!city) errors.push(`${where}: unknown city "${s.city}" (add to data/cities.json)`);
  if (!MODES.includes(s.mode)) errors.push(`${where}: mode must be one of ${MODES.join(', ')}`);
  if (!s.name) errors.push(`${where}: missing name`);
  if (!Array.isArray(s.sources) || !s.sources.length) warnings.push(`${where}: system has no sources`);
  (s.sources || []).forEach((src, i) => !isUrl(src.url) && errors.push(`${where}: sources[${i}] has invalid url`));
  checkFare(`${where} fare_rules`, s.fare_rules);
  if (!Array.isArray(s.routes)) {
    errors.push(`${where}: routes must be an array`);
    continue;
  }
  const ids = new Set();
  for (const r of s.routes) {
    const rw = `${where} route ${r.id}`;
    if (!r.id) errors.push(`${where}: route without id`);
    if (ids.has(r.id)) errors.push(`${rw}: duplicate route id`);
    ids.add(r.id);
    if (!STATUSES.includes(r.status)) errors.push(`${rw}: status must be one of ${STATUSES.join(', ')}`);
    if (r.color && !/^#[0-9A-Fa-f]{6}$/.test(r.color)) errors.push(`${rw}: color must be #RRGGBB`);
    if (r.mode && !MODES.includes(r.mode)) errors.push(`${rw}: mode must be one of ${MODES.join(', ')}`);
    checkFare(`${rw} fare_override`, r.fare_override);
    if (!Array.isArray(r.stops)) {
      errors.push(`${rw}: stops must be an array`);
      continue;
    }
    if (r.status === 'operational' && r.stops.length < 2) warnings.push(`${rw}: operational route with fewer than 2 stops`);
    if (!r.sources?.length && !s.sources?.length) warnings.push(`${rw}: no sources`);
    let prev = null;
    r.stops.forEach((st, i) => {
      const sw = `${rw} stop ${i + 1} "${st.name}"`;
      if (!st.name) errors.push(`${rw} stop ${i + 1}: missing name`);
      const has = st.lat != null && st.lon != null;
      if ((st.lat == null) !== (st.lon == null)) errors.push(`${sw}: lat and lon must both be set or both null`);
      if (has) {
        if (typeof st.lat !== 'number' || typeof st.lon !== 'number') errors.push(`${sw}: lat/lon must be numbers`);
        if (city) {
          const [so, we, no, ea] = city.bbox;
          if (st.lat < so || st.lat > no || st.lon < we || st.lon > ea) errors.push(`${sw}: coordinates outside ${city.id} bounding box`);
        }
        if (!st.coord_source) warnings.push(`${sw}: coordinates without coord_source`);
        if (prev) {
          const d = haversine(prev.lat, prev.lon, st.lat, st.lon);
          const limit = (s.mode === 'metro_rail' ? 5000 : 6000) * Math.max(1, i - prev.i);
          if (d > limit) warnings.push(`${sw}: ${(d / 1000).toFixed(1)} km from previous located stop, check geocoding`);
          // Two names for one place ("Golra Morh" / "Golra Morh Metro Station") is fine; unrelated names are not.
          const a = nameKey(st.name);
          const b = nameKey(r.stops[prev.i].name);
          const related = a === b || ` ${a} `.includes(` ${b} `) || ` ${b} `.includes(` ${a} `);
          if (d < 5 && i - prev.i === 1 && !related) warnings.push(`${sw}: same position as previous stop`);
        }
        prev = { lat: st.lat, lon: st.lon, i };
      }
    });
  }
}

for (const w of warnings) console.log(`warn  ${w}`);
for (const e of errors) console.log(`ERROR ${e}`);
console.log(`\n${seenSystems.size} systems checked: ${errors.length} error(s), ${warnings.length} warning(s)`);
if (errors.length || (strict && warnings.length)) process.exit(1);
