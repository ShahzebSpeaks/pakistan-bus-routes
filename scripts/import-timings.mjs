// Set service hours and frequency from an official timetable summary, e.g.
// research/incoming/pma-timings.json (PMA eTransit, one row per route direction:
// { system_hint, route_id_guess, match_confidence, timetable_partial_or_suspect, first, last,
//   headway_min, departures_per_day, source_page, service_date }).
// Only confident matches with a full-looking timetable are used. Both directions of a route are
// combined: earliest first departure, latest last departure, mean of the typical headways.
// Re-running replaces the hours and frequency set by the previous run.
//   node scripts/import-timings.mjs research/incoming/pma-timings.json [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
if (!input) {
  console.error('usage: node scripts/import-timings.mjs <timings.json> [--dry]');
  process.exit(1);
}

const doc = readJSON(path.resolve(ROOT, input));
const rows = (doc.timings || doc).filter((t) =>
  t.match_confidence === 'high' && !t.timetable_partial_or_suspect && t.system_hint && t.route_id_guess &&
  t.first && t.last && t.headway_min && (t.departures_per_day || 0) >= 4);

const groups = new Map();
for (const t of rows) {
  const k = `${t.system_hint}\u0000${t.route_id_guess}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(t);
}

const NOTE = /Hours and frequency from the official timetable[^.]*\.\s*/g;
const systems = new Map();
let updated = 0;
const missing = [];
for (const [k, list] of groups) {
  const [sysId, routeId] = k.split('\u0000');
  const file = path.join(SYSTEMS_DIR, `${sysId}.json`);
  if (!fs.existsSync(file)) { missing.push(`${sysId} (no system file)`); continue; }
  if (!systems.has(file)) systems.set(file, readJSON(file));
  const route = systems.get(file).routes.find((r) => r.id === routeId);
  if (!route) { missing.push(`${sysId}/${routeId}`); continue; }
  const first = list.map((t) => t.first).sort()[0];
  const last = list.map((t) => t.last).sort().at(-1);
  const headway = Math.round(list.reduce((s, t) => s + t.headway_min, 0) / list.length);
  const date = list[0].service_date || list[0].as_of || doc.researched_on;
  route.hours = { start: first, end: last };
  route.headway_min = headway;
  const src = { title: `Official timetable (eTransit, ${date})`, url: list[0].source_page || list[0].source_url };
  route.sources = [...(route.sources || []).filter((s) => !String(s.title).startsWith('Official timetable (eTransit')), src];
  route.notes = `${String(route.notes || '').replace(NOTE, '').trim()} Hours and frequency from the official timetable for ${date} (first and last departure, typical gap between buses).`.trim();
  updated++;
}

if (!dry) for (const [file, sys] of systems) writeJSON(file, sys);
console.log(`${rows.length} usable timetable rows, ${updated} routes updated`);
if (missing.length) console.log(`not found: ${missing.join(', ')}`);
