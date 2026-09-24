// Add intercity bus departure times from research/incoming/intercity-timetables.json
// ([{ system_hint, operator, from, to, departures: ["HH:MM"], source_url, official, ... }]).
//   system_hint "intercity-x"  -> times go on the route of that system between the two towns,
//                                 which is created (two stops, unverified) when missing
//   system_hint "new:<slug>"   -> a new system "intercity-<slug>" is created for the operator
// Each route gets departures: [{ from, times, official, source_url }], one entry per direction.
// Re-running replaces the departures that came from the same source URL.
//   node scripts/import-bus-timetables.mjs [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const dry = process.argv.includes('--dry');
const records = readJSON(path.join(ROOT, 'research/incoming/intercity-timetables.json'));
const fetched = records.map((r) => r.fetched).filter(Boolean).sort().at(-1) || null;

// "Islamabad / Rawalpindi" -> "Islamabad"; "Lahore (Thokar)" stays as is.
const town = (s) => String(s).split('/')[0].trim();
const key = (s) => String(s).toLowerCase().replace(/\(.*?\)/g, '').replace(/[^a-z]/g, '');
// Every name a place goes by: "Islamabad / Rawalpindi" and "Swat (Mingora)" give two each, and
// the twin cities count as one place because operators use terminals between them.
const TWINS = ['islamabad', 'rawalpindi'];
const aliases = (s) => {
  const parts = String(s).split(/[/()]/).map(key).filter(Boolean);
  if (parts.some((p) => TWINS.some((t) => p.startsWith(t)))) parts.push(...TWINS);
  return parts;
};
// A stop belongs to a town when the town in "Terminal, Road, Town" (or the whole name) matches.
const sameTown = (stopName, t) => {
  const a = aliases(String(stopName).split(',').at(-1));
  const b = aliases(t);
  return a.some((x) => b.some((y) => x === y || x.startsWith(y) || y.startsWith(x)));
};
const slug = (s) => key(s).slice(0, 12);

const systems = new Map();
const load = (id) => {
  if (!systems.has(id)) {
    const file = path.join(SYSTEMS_DIR, `${id}.json`);
    systems.set(id, fs.existsSync(file) ? readJSON(file) : null);
  }
  return systems.get(id);
};

const tally = { attached: 0, newRoutes: 0, newSystems: 0 };
for (const rec of records) {
  if (!rec.departures?.length || !rec.from || !rec.to) continue;
  const from = town(rec.from);
  const to = town(rec.to);
  const hint = rec.system_hint || '';
  const id = hint.startsWith('new:') ? `intercity-${hint.slice(4)}` : hint;
  if (!id) continue;
  let sys = load(id);
  if (!sys) {
    sys = {
      id, city: 'intercity', name: rec.operator, name_ur: '', operator: rec.operator, mode: 'intercity_bus',
      website: null, helpline: null, payment: 'Cash or online booking',
      fare_rules: { type: 'unknown', currency: 'PKR', flat: null, slabs: [], concessions: null, as_of: null, source_url: null },
      hours: null, last_verified: fetched,
      sources: [{ title: `${rec.operator} timetable`, url: rec.source_url, publisher: new URL(rec.source_url).hostname, date: fetched, official: Boolean(rec.official) }],
      routes: [],
    };
    systems.set(id, sys);
    tally.newSystems++;
  }
  let route = sys.routes.find((r) => r.stops.length >= 2 && (
    (sameTown(r.stops[0].name, from) && sameTown(r.stops.at(-1).name, to)) ||
    (sameTown(r.stops[0].name, to) && sameTown(r.stops.at(-1).name, from))));
  if (!route) {
    const stop = (name) => ({ name, name_ur: '', lat: null, lon: null, coord_source: null, is_station: false });
    route = {
      id: `${slug(from)}-${slug(to)}`.toUpperCase(), name: `${from} - ${to}`, name_ur: '', variant: 'express', color: null,
      status: 'unverified', launched: null, length_km: null, headway_min: null, hours: null, fare_override: null, women_only: false,
      stops: [stop(from), stop(to)], stops_confidence: 'low',
      sources: [{ title: `${rec.operator} timetable`, url: rec.source_url }],
      notes: `Listed with departure times on ${new URL(rec.source_url).hostname}; the operator's terminals are not named there.`,
    };
    sys.routes.push(route);
    tally.newRoutes++;
  }
  const entry = { from, times: [...new Set(rec.departures)].sort(), official: Boolean(rec.official), source_url: rec.source_url, as_of: rec.service_date || rec.site_verified_date || rec.fetched || null };
  route.departures = [...(route.departures || []).filter((d) => !(d.from === from && d.source_url === entry.source_url)), entry];
  if (!route.sources.some((s) => s.url === rec.source_url)) route.sources.push({ title: `${rec.operator} departure times`, url: rec.source_url });
  tally.attached++;
}

if (!dry) for (const [id, sys] of systems) if (sys) writeJSON(path.join(SYSTEMS_DIR, `${id}.json`), sys);
console.log(`departure lists attached ${tally.attached}, new routes ${tally.newRoutes}, new operator systems ${tally.newSystems}`);
