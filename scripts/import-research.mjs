// Import research/*.json files (see research/SCHEMA.md) into canonical data/systems/<system-id>.json.
// Existing system files are NOT overwritten unless --force is passed, so manual fixes are safe.
//   node scripts/import-research.mjs [--force] [research/file.json ...]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, loadCities, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const force = args.includes('--force');
const explicit = args.filter((a) => !a.startsWith('--'));
const researchDir = path.join(ROOT, 'research');
const files = explicit.length
  ? explicit.map((f) => path.resolve(f))
  : fs.readdirSync(researchDir).filter((f) => f.endsWith('.json')).map((f) => path.join(researchDir, f));

const cityIds = new Set(loadCities().map((c) => c.id));
const MODES = new Set(['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus', 'intercity_bus', 'rail']);
const STATUSES = new Set(['operational', 'under_construction', 'planned', 'suspended', 'unverified', 'historical']);

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'string' && v.trim() && !isNaN(+v) ? +v : null);

function cleanStop(s) {
  if (typeof s === 'string') s = { name: s };
  const lat = num(s.lat);
  const lon = num(s.lon ?? s.lng);
  const hasCoord = lat != null && lon != null && Math.abs(lat) > 1 && Math.abs(lon) > 1;
  return {
    name: String(s.name || '').trim(),
    name_ur: s.name_ur || '',
    lat: hasCoord ? lat : null,
    lon: hasCoord ? lon : null,
    coord_source: hasCoord ? s.coord_source || 'research' : null,
    is_station: Boolean(s.is_station),
  };
}

function cleanRoute(r, sys) {
  const status = STATUSES.has(r.status) ? r.status : 'unverified';
  return {
    id: String(r.id).trim(),
    name: r.name || '',
    name_ur: r.name_ur || '',
    variant: r.variant || 'regular',
    color: typeof r.color === 'string' && /^#[0-9a-f]{6}$/i.test(r.color) ? r.color.toUpperCase() : null,
    status,
    launched: r.launched || null,
    length_km: num(r.length_km),
    headway_min: num(r.headway_min),
    hours: r.hours && (r.hours.start || r.hours.end) ? { start: r.hours.start || null, end: r.hours.end || null } : null,
    fare_override: r.fare_override || null,
    women_only: Boolean(r.women_only),
    stops_confidence: ['high', 'medium', 'low'].includes(r.stops_confidence) ? r.stops_confidence : 'low',
    stops: (r.stops || []).map(cleanStop).filter((s) => s.name),
    sources: Array.isArray(r.sources) ? r.sources.filter((s) => s && s.url) : [],
    notes: r.notes || '',
    ...(r.mode && MODES.has(r.mode) && r.mode !== sys.mode ? { mode: r.mode } : {}),
  };
}

let written = 0;
let skipped = 0;
for (const file of files) {
  const doc = readJSON(file);
  const researchedOn = doc.researched_on || null;
  for (const sys of doc.systems || []) {
    if (!sys.id || !sys.city) {
      console.warn(`! ${path.basename(file)}: system without id/city skipped`);
      continue;
    }
    if (!cityIds.has(sys.city)) console.warn(`! ${sys.id}: city "${sys.city}" is not in data/cities.json (add it there)`);
    if (!MODES.has(sys.mode)) console.warn(`! ${sys.id}: unknown mode "${sys.mode}", using "bus"`);
    const out = {
      id: sys.id,
      city: sys.city,
      name: sys.name || sys.id,
      name_ur: sys.name_ur || '',
      operator: sys.operator || '',
      mode: MODES.has(sys.mode) ? sys.mode : 'bus',
      website: sys.website || null,
      helpline: sys.helpline || null,
      payment: sys.payment || null,
      fare_rules: sys.fare_rules || { type: 'unknown', currency: 'PKR' },
      hours: sys.hours || null,
      last_verified: researchedOn,
      sources: Array.isArray(sys.sources) ? sys.sources.filter((s) => s && s.url) : [],
      routes: [],
    };
    const seen = new Set();
    for (const r of sys.routes || []) {
      const route = cleanRoute(r, sys);
      if (seen.has(route.id)) {
        console.warn(`! ${sys.id}: duplicate route id ${route.id}, keeping first`);
        continue;
      }
      seen.add(route.id);
      out.routes.push(route);
    }
    const target = path.join(SYSTEMS_DIR, `${sys.id}.json`);
    if (fs.existsSync(target) && !force) {
      skipped++;
      console.log(`- ${sys.id}: exists, skipped (use --force to overwrite)`);
      continue;
    }
    writeJSON(target, out);
    written++;
    console.log(`+ ${sys.id}: ${out.routes.length} routes, ${out.routes.reduce((s, r) => s + r.stops.length, 0)} stops`);
  }
}
console.log(`\nImported ${written} system(s), skipped ${skipped}.`);
