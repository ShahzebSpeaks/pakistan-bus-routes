// Move intercity stops from town centres to the operator's bus terminal mapped in OpenStreetMap.
// Bus stations in Pakistan (amenity=bus_station) are fetched once into data/cache/osm-bus-stations-pk.json.
// A stop whose position is automatic is matched to a station within 20 km of it when:
//   - the station's name or operator contains the operator's name (e.g. "Daewoo"), and/or
//   - the station's name shares words with the stop's address ("Sohrab Goth", "Thokar", "Pir Wadhai").
// The best station is taken only when its score is clearly ahead of the next one, so towns with
// several terminals of the same operator are left alone unless the stop's address picks one.
// A bare town name ("Lahore") is moved only when the operator has exactly one station in that town.
//   node scripts/place-terminals.mjs [--refresh] [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { CACHE_DIR, SYSTEMS_DIR, USER_AGENT, haversine, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const CACHE = path.join(CACHE_DIR, 'osm-bus-stations-pk.json');

async function fetchStations() {
  const q = '[out:json][timeout:180];area["ISO3166-1"="PK"][admin_level=2]->.pk;(nwr["amenity"="bus_station"](area.pk);nwr["public_transport"="station"]["bus"="yes"](area.pk););out center tags;';
  for (const url of ['https://overpass-api.de/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']) {
    const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' } });
    if (!res.ok) continue;
    const j = await res.json();
    return j.elements
      .map((e) => ({ id: `${e.type}/${e.id}`, name: e.tags?.name || '', operator: e.tags?.operator || '', lat: e.lat ?? e.center?.lat, lon: e.lon ?? e.center?.lon }))
      .filter((e) => e.lat != null && (e.name || e.operator));
  }
  throw new Error('Overpass unavailable');
}

const stations = !args.includes('--refresh') && fs.existsSync(CACHE) ? readJSON(CACHE) : await fetchStations();
if (!dry) writeJSON(CACHE, stations);

const GENERIC = new Set(['express', 'travels', 'travel', 'movers', 'transport', 'transports', 'coach', 'coaches', 'bus', 'buses', 'service', 'services', 'company', 'the', 'new', 'al', 'and', 'pvt', 'ltd', 'intercity', 'lines', 'online']);
const words = (s) => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length >= 3);
// Town names never identify an operator or an address ("Bahawalpur Express", "... , Karachi").
const TOWN_WORDS = new Set(readJSON(path.join(path.dirname(SYSTEMS_DIR), 'cities.json')).cities.flatMap((c) => words(c.name)));
// Short or place-like words ("Ali", "Bahawalpur") match unrelated stations, so operators need a distinctive word.
const operatorWords = (sys) => words(`${sys.name} ${sys.operator || ''}`).filter((w) => w.length >= 4 && !GENERIC.has(w) && !TOWN_WORDS.has(w));
const ADDRESS_NOISE = new Set(['terminal', 'road', 'near', 'opp', 'opposite', 'main', 'bus', 'stand', 'adda', 'stop', 'office', 'booking', 'point', 'chowk', 'city', 'station', 'the', 'cantt', 'cantonment', 'highway']);
// City transit stops (metro, BRT, feeder) are not intercity terminals.
const NOT_TERMINAL = /metro|brt|feeder|bus stop/i;

let moved = 0;
const report = [];
for (const file of fs.readdirSync(SYSTEMS_DIR).filter((f) => f.startsWith('intercity-'))) {
  const full = path.join(SYSTEMS_DIR, file);
  const sys = readJSON(full);
  const opWords = operatorWords(sys);
  let changed = false;
  for (const r of sys.routes) for (const st of r.stops) {
    if (st.lat == null || !String(st.coord_source || '').startsWith('auto:')) continue;
    const parts = String(st.name).split(',').map((p) => p.trim());
    const named = parts.length > 1;
    const address = named ? parts.slice(0, -1).flatMap(words).filter((w) => !ADDRESS_NOISE.has(w) && !GENERIC.has(w) && !TOWN_WORDS.has(w) && !words(`${sys.name} ${sys.operator || ''}`).includes(w)) : [];
    const scored = stations
      .filter((s) => !NOT_TERMINAL.test(s.name) && haversine(st.lat, st.lon, s.lat, s.lon) <= 20000)
      .map((s) => {
        const text = words(`${s.name} ${s.operator}`);
        const op = opWords.length && opWords.every((w) => text.includes(w)) ? 2 : 0;
        const addr = address.filter((w) => text.includes(w)).length;
        return { s, op, score: op + addr };
      })
      .filter((c) => (named ? c.score >= 2 : c.op > 0))
      .sort((a, b) => b.score - a.score);
    if (!scored.length) continue;
    if (!named && scored.length > 1) continue; // several terminals of this operator in town
    if (scored.length > 1 && scored[0].score === scored[1].score) continue;
    const best = scored[0].s;
    st.lat = +best.lat.toFixed(6);
    st.lon = +best.lon.toFixed(6);
    st.coord_source = `osm:${best.id}`;
    moved++;
    changed = true;
    report.push(`${sys.id}: "${st.name}" -> ${best.name || best.operator} (${best.id})`);
  }
  if (changed && !dry) writeJSON(full, sys);
}
console.log(report.join('\n'));
console.log(`${stations.length} OSM bus stations; ${moved} stop position(s) moved to a terminal`);
