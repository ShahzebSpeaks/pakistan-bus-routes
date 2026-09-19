// Copy stop positions from an external route list into data/systems.
//
// Input: research/incoming/<source>/<city>.json shaped as
//   { city, source, lines: [{ id, code, name, url, stops: [{ name, name_ur, lat, lon }] }] }
// For every route in that city, the external line with the most stop names in common is chosen
// (it must share at least 40% of the route's stops). Stops with the same name then take the external
// position, unless they already have a position checked by a person (coord_source without "auto:").
// Positions written here get coord_source "ext:<source>:<line id>", which the build shows as
// "from a route guide" and the geocoder never overwrites.
//   node scripts/merge-coordinates.mjs <source-dir> [--dry] [--min-overlap 0.4]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, haversine, loadCities, loadSystems, nameKey, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const dir = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
const minOverlap = Number(args[args.indexOf('--min-overlap') + 1]) || 0.4;
if (!dir) {
  console.error('usage: node scripts/merge-coordinates.mjs research/incoming/<source> [--dry]');
  process.exit(1);
}

const cities = new Map(loadCities().map((c) => [c.id, c]));
const files = fs.readdirSync(path.resolve(ROOT, dir)).filter((f) => f.endsWith('.json'));
const external = new Map(); // city -> lines
for (const f of files) {
  const doc = readJSON(path.resolve(ROOT, dir, f));
  if (!doc.city || !Array.isArray(doc.lines)) continue;
  const lines = doc.lines
    .map((l) => ({ ...l, source: doc.source || path.basename(dir), stops: (l.stops || []).filter((s) => s.lat != null && s.lon != null && s.name) }))
    .filter((l) => l.stops.length >= 2);
  external.set(doc.city, [...(external.get(doc.city) || []), ...lines]);
}

const isAuto = (s) => typeof s.coord_source === 'string' && s.coord_source.startsWith('auto:');
const keysOf = (stops) => new Set(stops.map((s) => nameKey(s.name)).filter(Boolean));

let routesMatched = 0;
let stopsUpdated = 0;
const unmatched = [];
for (const { file, system } of loadSystems()) {
  const lines = external.get(system.city);
  if (!lines?.length) continue;
  const city = cities.get(system.city);
  let changed = 0;
  for (const route of system.routes) {
    const ours = keysOf(route.stops);
    if (!ours.size) continue;
    let best = null;
    let bestShare = 0;
    for (const line of lines) {
      const theirs = keysOf(line.stops);
      let common = 0;
      for (const k of ours) if (theirs.has(k)) common++;
      const share = common / ours.size;
      if (share > bestShare) {
        bestShare = share;
        best = line;
      }
    }
    if (!best || bestShare < minOverlap) {
      unmatched.push(`${system.id}/${route.id}`);
      continue;
    }
    routesMatched++;
    const byKey = new Map(best.stops.map((s) => [nameKey(s.name), s]));
    for (const stop of route.stops) {
      const ext = byKey.get(nameKey(stop.name));
      if (!ext) continue;
      if (city) {
        const [s, w, n, e] = city.bbox;
        if (ext.lat < s || ext.lat > n || ext.lon < w || ext.lon > e) continue;
      }
      if (stop.lat != null && !isAuto(stop)) continue; // keep positions a person checked
      if (stop.lat != null && haversine(stop.lat, stop.lon, ext.lat, ext.lon) < 5 && String(stop.coord_source).startsWith('ext:')) continue;
      stop.lat = +Number(ext.lat).toFixed(6);
      stop.lon = +Number(ext.lon).toFixed(6);
      stop.coord_source = `ext:${best.source}:${best.id}`;
      if (!stop.name_ur && ext.name_ur) stop.name_ur = ext.name_ur;
      changed++;
    }
    if (best.url && !(route.sources || []).some((s) => s.url === best.url)) {
      route.sources = [...(route.sources || []), { title: `${best.source}: ${best.code || best.name || best.id}`, url: best.url }];
    }
  }
  if (changed) {
    stopsUpdated += changed;
    if (!dry) writeJSON(file, system);
    console.log(`${system.id.padEnd(34)} ${changed} stop position(s)`);
  }
}
console.log(`\n${routesMatched} route(s) matched, ${stopsUpdated} stop position(s) ${dry ? 'would be ' : ''}updated`);
if (unmatched.length) console.log(`${unmatched.length} route(s) without a matching external line in cities that have one`);
