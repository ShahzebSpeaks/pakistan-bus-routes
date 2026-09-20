// Turn a SCHEMA.md-shaped research file into the line list that merge-coordinates.mjs reads, so a
// third-party route list can lend its stop positions to the routes we already have.
//   node scripts/schema-to-lines.mjs research/incoming/<file>.json research/incoming/<source-dir> <source-name> [url]
import path from 'node:path';
import { ROOT, readJSON, writeJSON } from './lib.mjs';

const [input, outDir, sourceName, url] = process.argv.slice(2);
if (!input || !outDir || !sourceName) {
  console.error('usage: node scripts/schema-to-lines.mjs <schema.json> <out-dir> <source-name> [url]');
  process.exit(1);
}

const doc = readJSON(path.resolve(ROOT, input));
const byCity = new Map();
for (const sys of doc.systems || []) {
  const lines = byCity.get(sys.city) || [];
  for (const route of sys.routes || []) {
    const stops = (route.stops || []).filter((s) => s.lat != null && s.lon != null && s.name);
    if (stops.length < 2) continue;
    lines.push({
      id: `${sys.id}:${route.id}`,
      code: route.id,
      name: route.name || route.id,
      url: url || sys.website || null,
      stops: stops.map((s) => ({ name: s.name, name_ur: s.name_ur || '', lat: s.lat, lon: s.lon })),
    });
  }
  byCity.set(sys.city, lines);
}

for (const [city, lines] of byCity) {
  if (!lines.length) continue;
  const file = path.resolve(ROOT, outDir, `${city}.json`);
  writeJSON(file, { city, source: sourceName, fetched_at: doc.researched_on || new Date().toISOString().slice(0, 10), lines });
  console.log(`+ ${path.relative(ROOT, file)}: ${lines.length} lines, ${lines.reduce((a, l) => a + l.stops.length, 0)} stops`);
}
