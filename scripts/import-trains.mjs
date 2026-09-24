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

// The official timetable (research/incoming/pakrail-official-timetable.json, from the public
// pakrailways.gov.pk train page) replaces the third-party station list and times of a train when
// most of its stations can be located. Station names there are upper case abbreviations
// ("HYDERABAD JN."), so they are matched to known stations by a normalised key, allowing small
// spelling differences.
const OFFICIAL_FILE = path.join(ROOT, 'research/incoming/pakrail-official-timetable.json');
const official = fs.existsSync(OFFICIAL_FILE) ? readJSON(OFFICIAL_FILE) : null;
const officialByNumber = new Map((official?.trains || []).map((t) => [t.train_number, t]));

const stationKey = (name) =>
  String(name).toLowerCase().replace(/railway station|\bstation\b|\bjunction\b|\bjn\b/g, ' ').replace(/\bcantt\b/g, 'cantonment').replace(/[^a-z]/g, '');
const gazetteer = new Map();
const addStation = (s) => { if (s.lat != null && s.name) gazetteer.set(stationKey(s.name), s); };
const WIKIDATA_FILE = path.join(ROOT, 'research/wikidata-stations.json');
if (fs.existsSync(WIKIDATA_FILE)) {
  for (const w of readJSON(WIKIDATA_FILE).stations || []) {
    addStation({ name: w.name_en.replace(/ railway station$/i, ''), name_ur: w.name_ur || '', lat: w.lat, lon: w.lon, coord_source: `wikidata:${w.qid}` });
  }
}
for (const r of src.routes) for (const s of r.stops) addStation(s);
for (const stops of previous.values()) for (const s of stops) addStation(s); // includes later fixes
function editDistance(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  }
  return d[a.length][b.length];
}
// Different stations whose names are only a letter or two apart (checked by hand).
const EXACT_ONLY = new Set(['khudian', 'sulemanabad', 'banhmianwala']);
function findStation(name) {
  const k = stationKey(name);
  if (gazetteer.has(k)) return gazetteer.get(k);
  if (k.length < 6 || EXACT_ONLY.has(k)) return null;
  let best = null;
  for (const [g, s] of gazetteer) {
    if (g[0] !== k[0] || Math.abs(g.length - k.length) > 2) continue;
    const dist = editDistance(g, k);
    if (dist <= 2 && (!best || dist < best.dist)) best = { dist, s };
  }
  return best?.s ?? null;
}
const titleCase = (s) => String(s).trim().replace(/\.$/, '').toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).replace(/\bJn\b/, 'Junction').replace(/\bCantt\b/, 'Cantonment');
const OFFICIAL_SOURCE = { title: 'Pakistan Railways train schedule (pakrailways.gov.pk)', url: 'https://pakrailways.gov.pk/train' };

/** Official stations and times for a train, or null when too few stations can be located. */
function officialStops(number) {
  const t = officialByNumber.get(number);
  if (!t) return null;
  const stops = t.stops.map((o) => {
    const known = findStation(o.station);
    const s = known
      ? { name: known.name, name_ur: known.name_ur || '', lat: known.lat, lon: known.lon, coord_source: known.coord_source, is_station: true }
      : { name: titleCase(o.station), name_ur: '', lat: null, lon: null, coord_source: null, is_station: true };
    return { ...s, departure: o.dep, arrival: o.arr };
  });
  const located = stops.filter((s) => s.lat != null).length;
  return located >= stops.length * 0.8 ? { stops, date: t.service_date_queried } : null;
}

function buildRoute({ number, trainName, stops, rest, notes, sources, fromOfficial }) {
  const group = fareFor(trainName);
  const first = stops[0];
  const last = stops.at(-1);
  const stopTimes = stops.map((s, i) => (i === stops.length - 1 ? s.arrival || s.departure : s.departure || s.arrival) || null);
  const when = first.departure && (last.arrival || last.departure) ? `Leaves ${first.name} ${first.departure}, reaches ${last.name} ${last.arrival || last.departure}.` : '';
  const timesFrom = fromOfficial
    ? `Stations and times are from Pakistan Railways' own schedule for ${fromOfficial}.`
    : 'Times are from pakinformation.com, not Pakistan Railways.';
  return {
    ...rest,
    id: number, // passengers and tickets use the train number; the name is shown beside it
    name: `${trainName}: ${first.name} - ${last.name}`,
    variant: /passenger|shuttle|mixed/i.test(trainName) ? 'regular' : 'express',
    hours: null,
    fare_override: group && JSON.stringify(group) !== JSON.stringify(DEFAULT) ? { ...fareBase, slabs: group } : null,
    stops: stops.map(({ arrival, departure, timetable_name, ...s }, i) => (fromOfficial ? { ...s, is_station: true } : keepFixed(number, i, { ...s, is_station: true }))),
    ...(stopTimes.some(Boolean) ? { stop_times: stopTimes } : {}),
    sources,
    notes: [when, notes, `Fare shown is Economy class from the official distance table; AC classes cost more. ${timesFrom}`].filter(Boolean).join(' ').trim(),
  };
}

let officialCount = 0;
const routes = src.routes.map((r) => {
  const { train_number, fare_override, hours, stops, sources, notes, ...rest } = r;
  const number = train_number || numberOf(r.id);
  const trainName = r.id.replace(/^\S+\s+/, '');
  const off = officialStops(number);
  if (off) officialCount++;
  return buildRoute({
    number, trainName, rest,
    stops: off ? off.stops : stops,
    notes,
    sources: off ? [OFFICIAL_SOURCE, ...(sources || [])] : sources || [],
    fromOfficial: off?.date,
  });
});

// Trains in the official schedule that the research list does not have.
const have = new Set(routes.map((r) => r.id));
for (const t of official?.trains || []) {
  if (have.has(t.train_number)) continue;
  const off = officialStops(t.train_number);
  if (!off) { console.log(`! ${t.train_number}: too few stations located, skipped`); continue; }
  const trainName = t.name || (/^S\d/.test(t.train_number) ? 'Shuttle' : 'Passenger');
  routes.push(buildRoute({
    number: t.train_number, trainName, stops: off.stops,
    rest: { name_ur: '', color: null, status: 'operational', launched: null, length_km: t.stops.at(-1)?.distance_km || null, headway_min: null, women_only: false, stops_confidence: 'high' },
    notes: 'Found only in the official schedule.', sources: [OFFICIAL_SOURCE], fromOfficial: off.date,
  }));
}
console.log(`official timetable used for ${officialCount} trains, ${routes.length - src.routes.length} new trains from it`);

const system = {
  ...src,
  fare_rules: { ...fareBase, slabs: DEFAULT, notes: 'Economy class, fare groups A (Khyber Mail, Millat, Allama Iqbal, Awam, Bolan and others). Other trains use their own column of the same table.' },
  hours: null,
  last_verified: research.researched_on,
  routes,
};
writeJSON(OUT, system);
console.log(`pakistan-railways: ${routes.length} trains, ${routes.filter((r) => r.fare_override).length} with their own fare column`);
