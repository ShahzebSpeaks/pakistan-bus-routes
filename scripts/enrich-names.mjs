// Fill missing Urdu stop names (name_ur) from the OpenStreetMap cache.
//
// Three ways a name is accepted:
//   1. the stop is already tied to an OSM element (coord_source has an osm id) that carries name:ur
//   2. an OSM feature with the same normalised name sits within 300 m of the stop and carries name:ur
//   3. a Wikidata station (research/wikidata-stations.json, CC0) with the same name is within 500 m
// Existing Urdu names are never overwritten.
//   node scripts/enrich-names.mjs [--dry] [system-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { CACHE_DIR, ROOT, haversine, loadSystems, nameKey, readJSON, writeJSON } from './lib.mjs';

const wikidataFile = path.join(ROOT, 'research', 'wikidata-stations.json');
const wikidata = fs.existsSync(wikidataFile) ? readJSON(wikidataFile).stations ?? [] : [];
const stationKey = (n) => nameKey(String(n).replace(/\b(railway|metro|metrobus|brt|bus|train)\b/gi, ' '));
const wikidataByKey = new Map();
for (const w of wikidata) {
  if (!w.name_ur || w.lat == null) continue;
  const k = stationKey(w.name_en || '');
  if (!k) continue;
  if (!wikidataByKey.has(k)) wikidataByKey.set(k, []);
  wikidataByKey.get(k).push(w);
}

const args = process.argv.slice(2);
const dry = args.includes('--dry');
const only = new Set(args.filter((a) => !a.startsWith('--')));

const caches = new Map();
function cityIndex(city) {
  if (caches.has(city)) return caches.get(city);
  const file = path.join(CACHE_DIR, 'osm', `${city}.json`);
  const index = { byId: new Map(), byKey: new Map() };
  if (fs.existsSync(file)) {
    for (const f of readJSON(file).features) {
      if (!f.names['name:ur']) continue;
      index.byId.set(f.id, f);
      const key = nameKey(f.names.name || f.names['name:en'] || '');
      if (!key) continue;
      if (!index.byKey.has(key)) index.byKey.set(key, []);
      index.byKey.get(key).push(f);
    }
  }
  caches.set(city, index);
  return index;
}

const osmId = (source) => {
  const m = /((?:node|way|relation)\/\d+)/.exec(String(source || ''));
  return m ? m[1] : null;
};

let filled = 0;
let touched = 0;
for (const { file, system } of loadSystems().filter(({ system }) => !only.size || only.has(system.id))) {
  const index = cityIndex(system.city);
  let changed = 0;
  for (const route of system.routes) {
    for (const stop of route.stops) {
      if (stop.name_ur) continue;
      const direct = index.byId.get(osmId(stop.coord_source));
      let hit = direct;
      if (!hit && stop.lat != null) {
        const key = nameKey(stop.name);
        hit = (index.byKey.get(key) || []).find((f) => haversine(stop.lat, stop.lon, f.lat, f.lon) <= 300);
      }
      let ur = hit?.names['name:ur'];
      if (!ur && stop.lat != null) {
        const w = (wikidataByKey.get(stationKey(stop.name)) || []).find((x) => haversine(stop.lat, stop.lon, x.lat, x.lon) <= 500);
        ur = w?.name_ur;
      }
      // ignore Urdu names that are really Latin text
      if (!ur || !/[\u0600-\u06FF]/.test(ur)) continue;
      stop.name_ur = ur;
      changed++;
      filled++;
    }
  }
  if (changed) {
    touched++;
    if (!dry) writeJSON(file, system);
    console.log(`${system.id.padEnd(34)} +${changed} Urdu names`);
  }
}
console.log(`\n${filled} Urdu stop name(s) added across ${touched} system(s)${dry ? ' (dry run)' : ''}`);
