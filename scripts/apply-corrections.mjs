// Apply a corrections file: [{ system, route, field, old, new, source, note }].
//   field "stops"           -> replace the stop list when the current list still matches `old`
//   field "stops[N].name"   -> rename one stop when it still has the `old` name
//   field "name" / others   -> not applied automatically; recorded in the route notes as a conflict
// Stop positions already known for a stop with the same name are kept.
//   node scripts/apply-corrections.mjs research/incoming/<file>.json [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
if (!input) {
  console.error('usage: node scripts/apply-corrections.mjs <corrections.json> [--dry]');
  process.exit(1);
}

const norm = (id) => String(id).toUpperCase().replace(/[^A-Z0-9]/g, '');
const key = (n) => String(n).toLowerCase().replace(/[^a-z0-9]/g, '');
const sameNames = (stops, names) => stops.length === names.length && stops.every((s, i) => key(s.name) === key(names[i]));

const corrections = readJSON(path.resolve(ROOT, input));
const systems = new Map();
const tally = { stops: 0, renamed: 0, noted: 0, stale: 0, missing: 0 };

for (const c of corrections) {
  const file = path.join(SYSTEMS_DIR, `${c.system}.json`);
  if (!fs.existsSync(file)) { tally.missing++; continue; }
  if (!systems.has(file)) systems.set(file, readJSON(file));
  const route = systems.get(file).routes.find((r) => norm(r.id) === norm(c.route));
  if (!route) { tally.missing++; console.log(`? ${c.system} ${c.route}: route not found`); continue; }
  const source = c.source ? { title: `Correction source for ${route.id}`, url: c.source } : null;
  const addSource = () => {
    if (source && !(route.sources || []).some((s) => s.url === source.url)) route.sources = [...(route.sources || []), source];
  };
  const rename = /^stops\[(\d+)\]\.name$/.exec(c.field);

  if (c.field === 'stops') {
    if (!sameNames(route.stops, c.old)) { tally.stale++; console.log(`~ ${c.system} ${route.id}: stop list changed since the correction was written, skipped`); continue; }
    const known = new Map(route.stops.filter((s) => s.lat != null).map((s) => [key(s.name), s]));
    route.stops = c.new.map((name) => known.get(key(name)) ? { ...known.get(key(name)), name } : { name, name_ur: '', lat: null, lon: null, coord_source: null, is_station: false });
    if (route.stops.length > 2 && route.stops_confidence === 'low') route.stops_confidence = 'medium';
    addSource();
    tally.stops++;
  } else if (rename) {
    const stop = route.stops[Number(rename[1])];
    if (!stop || key(stop.name) !== key(c.old)) { tally.stale++; continue; }
    stop.name = c.new;
    addSource();
    tally.renamed++;
  } else {
    const line = `Conflict (${c.field}): another source gives "${Array.isArray(c.new) ? c.new.join(' - ') : c.new}" instead of "${Array.isArray(c.old) ? c.old.join(' - ') : c.old}"${c.source ? ` (${c.source})` : ''}.`;
    if (!(route.notes || '').includes(line)) route.notes = [route.notes, line].filter(Boolean).join(' ');
    addSource();
    tally.noted++;
  }
}

if (!dry) for (const [file, system] of systems) writeJSON(file, system);
console.log(`stop lists replaced ${tally.stops}, stops renamed ${tally.renamed}, conflicts noted ${tally.noted}, stale ${tally.stale}, not found ${tally.missing}`);
