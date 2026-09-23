// Turn research/incoming/pakistan-railways-trains.json into data/systems/pakistan-railways.json.
// Economy fares come from the official fare table (research/incoming/pakistan-railways/
// passenger-fare-*.json), picking the column for the train's fare group. Per-stop times go into
// route.stop_times (departure, or arrival at the last stop), which the app and GTFS export use.
//   node scripts/import-trains.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const research = readJSON(path.join(ROOT, 'research/incoming/pakistan-railways-trains.json'));
const table = readJSON(path.join(ROOT, 'research/incoming/pakistan-railways/passenger-fare-2025-04-20.json'));

function slabs(rows, col) {
  const out = [];
  for (const row of rows) {
    const fare = row.fares[col];
    if (fare == null) continue;
    if (out.length && out.at(-1).fare === fare) out.at(-1).up_to_km = row.to_km;
    else out.push({ up_to_km: row.to_km, fare });
  }
  if (out.length) out.at(-1).up_to_km = null;
  return out;
}

const mainCol = (label) => table.main_columns.indexOf(label);
const icCol = (label) => table.intercity_columns.indexOf(label);
const FARE_GROUPS = [
  [/karachi express|business|karakoram|jaffar|tezgam|jinnah/i, table.main, mainCol('B:Economy')],
  [/green line|shah hussain/i, table.main, mainCol('GreenLine/ShahHussain:Economy')],
  [/fareed/i, table.main, mainCol('Fareed?:Economy')],
  [/sir sa?y+ed/i, table.main, mainCol('SirSyed?:Economy')],
  [/mianwali/i, table.intercity, icCol('Mianwali Exp:Economy')],
  [/thall?/i, table.intercity, icCol('Thal Exp:Economy')],
  [/mehr/i, table.intercity, icCol('Mehr Exp:Economy')],
  [/musa pak/i, table.intercity, icCol('Musa Pak & Multan Exp:Economy')],
  [/passenger|shuttle|mixed/i, table.intercity, icCol('Passenger/Shuttle/Branch line:Economy')],
  [/subak|rawal express|islamabad express|badar|ghouri|lasani|chenab|ravi|kohat|mehran|shah latif|saman sarkar/i, table.intercity, icCol('Intercity (non-reserved):Economy')],
];
const DEFAULT = slabs(table.main, mainCol('A:Economy'));
const fareFor = (name) => {
  const hit = FARE_GROUPS.find(([re, , col]) => re.test(name) && col >= 0);
  return hit ? slabs(hit[1], hit[2]) : null;
};

const src = research.systems[0];
const fareBase = { type: 'distance_slab', currency: 'PKR', concessions: src.fare_rules.concessions, as_of: src.fare_rules.as_of, source_url: src.fare_rules.source_url };

// Positions fixed or filled in later (geocode.mjs, manual corrections of bad Wikidata points) are
// kept when the same train is imported again.
const OUT = path.join(SYSTEMS_DIR, 'pakistan-railways.json');
const numberOf = (id) => String(id).split(' ')[0];
const previous = new Map(fs.existsSync(OUT) ? readJSON(OUT).routes.map((r) => [numberOf(r.id), r.stops]) : []);
const keepFixed = (id, i, s) => {
  const old = previous.get(id)?.[i];
  return old && old.name === s.name && String(old.coord_source || '').startsWith('auto:') ? { ...s, lat: old.lat, lon: old.lon, coord_source: old.coord_source } : s;
};

const routes = src.routes.map((r) => {
  const { train_number, fare_override, hours, stops, ...rest } = r;
  const number = train_number || numberOf(r.id);
  const trainName = r.id.replace(/^\S+\s+/, '');
  const group = fareFor(trainName);
  const first = stops[0];
  const last = stops.at(-1);
  const stopTimes = stops.map((s) => s.departure || s.arrival || null);
  const when = first.departure && last.arrival ? `Leaves ${first.name} ${first.departure}, reaches ${last.name} ${last.arrival}.` : '';
  return {
    ...rest,
    id: number, // passengers and tickets use the train number; the name is shown beside it
    name: `${trainName}: ${first.name} - ${last.name}`,
    variant: /passenger|shuttle|mixed/i.test(trainName) ? 'regular' : 'express',
    hours: null,
    fare_override: group && JSON.stringify(group) !== JSON.stringify(DEFAULT) ? { ...fareBase, slabs: group } : null,
    stops: stops.map(({ arrival, departure, timetable_name, ...s }, i) => keepFixed(number, i, { ...s, is_station: true })),
    ...(stopTimes.some(Boolean) ? { stop_times: stopTimes } : {}),
    notes: [when, r.notes, 'Fare shown is Economy class from the official distance table; AC classes cost more. Times are from pakinformation.com, not Pakistan Railways.'].filter(Boolean).join(' ').trim(),
  };
});

const system = {
  ...src,
  fare_rules: { ...fareBase, slabs: DEFAULT, notes: 'Economy class, fare groups A (Khyber Mail, Millat, Allama Iqbal, Awam, Bolan and others). Other trains use their own column of the same table.' },
  hours: null,
  last_verified: research.researched_on,
  routes,
};
writeJSON(OUT, system);
console.log(`pakistan-railways: ${routes.length} trains, ${routes.filter((r) => r.fare_override).length} with their own fare column`);
