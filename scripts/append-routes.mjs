// Add routes from a research file (research/SCHEMA.md format) to systems that already exist.
// Routes whose number is already present (ignoring spaces, dashes and case) are skipped, so the
// script can be re-run safely. Systems that do not exist yet are created as they are.
//   node scripts/append-routes.mjs research/incoming/<file>.json [--dry]
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
if (!input) {
  console.error('usage: node scripts/append-routes.mjs <research-file.json> [--dry]');
  process.exit(1);
}

const norm = (id) => String(id).toUpperCase().replace(/[^A-Z0-9]/g, '');
const cleanStop = (s) => ({
  name: String(s.name || '').trim(),
  name_ur: s.name_ur || '',
  lat: s.lat ?? null,
  lon: s.lon ?? null,
  coord_source: s.lat != null ? s.coord_source || 'research' : null,
  is_station: Boolean(s.is_station),
});

const doc = readJSON(path.resolve(ROOT, input));
for (const incoming of doc.systems || []) {
  const file = path.join(SYSTEMS_DIR, `${incoming.id}.json`);
  const routes = (incoming.routes || []).map((r) => ({
    ...r,
    stops: (r.stops || []).map(cleanStop).filter((s) => s.name),
    sources: (r.sources || []).filter((s) => s && s.url),
  }));
  if (!fs.existsSync(file)) {
    const created = { ...incoming, last_verified: doc.researched_on || null, routes };
    if (!dry) writeJSON(file, created);
    console.log(`+ ${incoming.id}: new system with ${routes.length} routes`);
    continue;
  }
  const system = readJSON(file);
  const have = new Set(system.routes.map((r) => norm(r.id)));
  let added = 0;
  for (const r of routes) {
    if (have.has(norm(r.id))) continue;
    have.add(norm(r.id));
    system.routes.push(r);
    added++;
  }
  if (!dry && added) writeJSON(file, system);
  console.log(`${added ? '+' : '-'} ${incoming.id}: ${added} route(s) added, ${routes.length - added} already present`);
}
