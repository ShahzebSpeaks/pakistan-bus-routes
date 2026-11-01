// Fetch PMA eTransit routes that are not in data/systems yet and write them as a research file.
// Which routes: the rows of research/incoming/pma-timings.json that have no match_confidence
// (eTransit routes with no counterpart in our data). For each, the public endpoint the eTransit
// route planner itself calls (get-line-schedules) gives the ordered stops with positions and the
// day's departures. PMA gave the project permission to reuse eTransit data.
// Output: research/incoming/pma-missing-routes.json (SCHEMA.md format); merge it with
//   node scripts/append-routes.mjs research/incoming/pma-missing-routes.json
//   node scripts/fetch-etransit-routes.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, sleep, writeJSON } from './lib.mjs';

const timings = readJSON(path.join(ROOT, 'research/incoming/pma-timings.json')).timings;
const wanted = new Map();
for (const t of timings) if (!t.match_confidence && t.source_request?.json && !wanted.has(t.etransit_route_id)) wanted.set(t.etransit_route_id, t);

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const hm = (s) => String(s).slice(11, 16);
const median = (xs) => { const a = [...xs].sort((x, y) => x - y); return a.length ? a[Math.floor(a.length / 2)] : null; };
const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

const systems = new Map();
for (const [routeId, t] of wanted) {
  const res = await fetch(t.source_url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0' }, body: JSON.stringify(t.source_request.json) });
  await sleep(2000);
  if (!res.ok) { console.log(`! ${routeId}: HTTP ${res.status}`); continue; }
  const dir = (await res.json())?.data?.forward;
  if (!dir?.stops?.length) { console.log(`! ${routeId}: no stops`); continue; }
  const stops = dir.stops.map((s) => ({
    name: String(s.name).trim(), name_ur: '',
    lat: Number(s.latitude) || null, lon: Number(s.longitude) || null,
    coord_source: Number(s.latitude) ? `ext:etransit.punjab.gov.pk:stop/${s.id}` : null, is_station: false,
  }));
  const deps = (dir.stops[0].timings || []).map((x) => hm(x.start_time)).filter(Boolean).sort();
  const gaps = deps.slice(1).map((d, i) => toMin(d) - toMin(deps[i])).filter((g) => g > 0);

  const sysId = t.system_hint;
  const file = path.join(SYSTEMS_DIR, `${sysId}.json`);
  const existing = fs.existsSync(file) ? readJSON(file) : null;
  const slugIds = !existing || existing.routes.some((r) => r.id.includes('-to-'));
  const id = slugIds ? slug(dir.route_long_name || t.headsign) : `${String(t.etransit_line_name).split(/[\s-]/)[0].toUpperCase()}-${routeId}`;
  if (!systems.has(sysId)) {
    systems.set(sysId, existing
      ? { id: sysId, city: existing.city, name: existing.name, mode: existing.mode, routes: [] }
      : {
          id: sysId, city: String(t.district).toLowerCase().replace(/\s+/g, '-'), name: `${t.etransit_line_name} (PMA)`, name_ur: '',
          operator: 'Punjab Masstransit Authority (PMA)', mode: 'electric_bus', website: 'https://etransit.punjab.gov.pk', helpline: '111-222-627', payment: 'Cash or T-Cash card',
          fare_rules: { type: 'unknown', currency: 'PKR', flat: null, slabs: [], concessions: null, as_of: null, source_url: null },
          hours: null, sources: [{ title: 'PMA eTransit route planner', url: t.source_page, publisher: 'Punjab Masstransit Authority', date: t.as_of, official: true }],
          routes: [],
        });
  }
  systems.get(sysId).routes.push({
    id, name: dir.route_long_name || t.headsign, name_ur: '', variant: 'regular', color: null, status: 'operational', launched: null,
    length_km: null, headway_min: median(gaps), hours: deps.length ? { start: deps[0], end: deps.at(-1) } : null,
    fare_override: null, women_only: false, stops, stops_confidence: 'high',
    sources: [{ title: `Official timetable (eTransit, ${deps.length ? dir.stops[0].timings[0].date : t.as_of})`, url: t.source_page }],
    notes: `Ordered stops, positions and departures from PMA eTransit (route ${routeId}); hours and frequency from the official timetable for ${dir.stops[0].timings?.[0]?.date || t.as_of}.`,
  });
  console.log(`+ ${sysId}/${id}: ${stops.length} stops, ${deps.length} departures`);
}

const out = { assignment: 'pma-missing-routes', researched_on: new Date().toISOString().slice(0, 10), systems: [...systems.values()] };
writeJSON(path.join(ROOT, 'research/incoming/pma-missing-routes.json'), out);
console.log(`${out.systems.reduce((n, s) => n + s.routes.length, 0)} routes written`);
