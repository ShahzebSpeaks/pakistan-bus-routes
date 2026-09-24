// Add routes from a research file (research/SCHEMA.md format) to systems that already exist.
// Routes whose number is already present (ignoring spaces, dashes and case) are skipped, so the
// script can be re-run safely. Systems that do not exist yet are created as they are.
//   node scripts/append-routes.mjs research/incoming/<file>.json [--dry] [--replace-weak]
// --replace-weak: an existing route that lists at most its two terminals is replaced by an incoming
// route with the same number and a longer stop list (status and notes come from the incoming
// route). Known stop positions are kept.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SYSTEMS_DIR, readJSON, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const input = args.find((a) => !a.startsWith('--'));
const dry = args.includes('--dry');
const replaceWeak = args.includes('--replace-weak');
const stopKey = (n) => String(n).toLowerCase().replace(/[^a-z0-9]/g, '');
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
  })).filter((r) => r.stops.length >= 2);
  if (!fs.existsSync(file)) {
    const created = { ...incoming, last_verified: doc.researched_on || null, routes };
    if (!dry) writeJSON(file, created);
    console.log(`+ ${incoming.id}: new system with ${routes.length} routes`);
    continue;
  }
  const system = readJSON(file);
  const have = new Set(system.routes.map((r) => norm(r.id)));
  let added = 0;
  let replaced = 0;
  for (const r of routes) {
    if (have.has(norm(r.id))) {
      const i = system.routes.findIndex((x) => norm(x.id) === norm(r.id));
      const old = system.routes[i];
      // A research file can also mark a route as an authoritative update ("merge_action": "replace_existing").
      const forced = r.merge_action === 'replace_existing';
      if (old && (forced || (replaceWeak && old.stops.length <= 2 && r.stops.length > old.stops.length))) {
        const known = new Map(old.stops.filter((st) => st.lat != null).map((st) => [stopKey(st.name), st]));
        const stops = r.stops.map((st) => (st.lat == null && known.has(stopKey(st.name)) ? { ...st, ...known.get(stopKey(st.name)), name: st.name } : st));
        const { merge_action, ...incomingRoute } = r;
        system.routes[i] = { ...old, ...incomingRoute, color: r.color || old.color, stops, sources: [...(old.sources || []), ...r.sources.filter((x) => !(old.sources || []).some((o) => o.url === x.url))] };
        replaced++;
      }
      continue;
    }
    have.add(norm(r.id));
    system.routes.push(r);
    added++;
  }
  if (!dry && (added || replaced)) writeJSON(file, system);
  console.log(`${added || replaced ? '+' : '-'} ${incoming.id}: ${added} route(s) added, ${replaced} route(s) filled in or updated, ${routes.length - added - replaced} already present`);
}
