// Add CDA's published departure times to Islamabad routes, from
// research/incoming/cda-timetables.json ([{ system_hint, route_id, direction, from, departures,
// first, last, headway_min, source_url, as_of, changed_since_pdf, notes }]).
// Each direction becomes one entry in route.departures. Hours and frequency are filled in only
// where the route has none. Routes changed since the PDFs (changed_since_pdf) and timetables
// known to be outdated or wrong (SKIP) are left out. CDA gave the project permission to reuse
// its published data. Re-running replaces the entries from the same PDF.
//   node scripts/import-cda-timetables.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const dry = process.argv.includes('--dry');
// CDA route code -> our system and route where the ids differ.
const ALIAS = { 'FRB-01': ['isb-rwp-metrobus', 'BLUE'], 'FRG-1': ['isb-rwp-metrobus', 'GREEN'] };
// PDFs that show an old pattern or are internally inconsistent (checked 2026-11-01):
// FR-03A shows the old PIMS-Flower Market route; FR-05's stops contradict its own header;
// FR-08A Forward overlays two series with duplicate times.
const SKIP = new Set(['FR-03A', 'FR-05', 'FR-08A/Forward']);

const rows = readJSON(path.join(ROOT, 'research/incoming/cda-timetables.json'));
const systems = new Map();
const tally = { added: 0, skipped: 0, missing: [] };
for (const r of rows) {
  const code = r.cda_short_name || r.route_id;
  if (r.changed_since_pdf || SKIP.has(r.route_id) || SKIP.has(`${r.route_id}/${r.direction}`)) { tally.skipped++; continue; }
  const [sysId, routeId] = ALIAS[code] || ALIAS[r.route_id] || [r.system_hint, r.route_id];
  const file = path.join(SYSTEMS_DIR, `${sysId}.json`);
  if (!fs.existsSync(file)) { tally.missing.push(`${sysId}/${routeId}`); continue; }
  if (!systems.has(file)) systems.set(file, readJSON(file));
  const route = systems.get(file).routes.find((x) => x.id === routeId);
  if (!route || !r.departures?.length) { tally.missing.push(`${sysId}/${routeId}`); continue; }
  const entry = { from: r.from, times: [...new Set(r.departures)].sort(), official: true, source_url: r.source_url, as_of: r.as_of };
  route.departures = [...(route.departures || []).filter((d) => d.source_url !== entry.source_url), entry];
  if (!route.hours?.start && r.first && r.last) route.hours = { start: r.first, end: r.last };
  if (route.headway_min == null && r.headway_min) route.headway_min = r.headway_min;
  if (!(route.sources || []).some((s) => s.url === r.source_url)) route.sources = [...(route.sources || []), { title: `CDA timetable ${code} ${r.direction} (${r.as_of})`, url: r.source_url }];
  tally.added++;
}
if (!dry) for (const [file, sys] of systems) writeJSON(file, sys);
console.log(`departure lists added ${tally.added}, skipped ${tally.skipped}${tally.missing.length ? `, not found: ${tally.missing.join(', ')}` : ''}`);
