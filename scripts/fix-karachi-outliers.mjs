// Correct Karachi stops placed far from where their route runs, using Mnzil's station positions.
// A stop is moved only when it is 3+ km from the Mnzil station of the same name and the move
// shortens the detour between its neighbours. OpenStreetMap-verified positions are never moved.
// Needs research/incoming/karachi-mnzil-stations.json.
//   node scripts/fix-karachi-outliers.mjs [--dry]
import fs from 'node:fs';
const dry = process.argv.includes('--dry');
const key = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const mn = JSON.parse(fs.readFileSync('research/incoming/karachi-mnzil-stations.json', 'utf8')).stations.filter((s) => s.lat > 24.7 && s.lat < 25.3 && s.lon > 66.8 && s.lon < 67.55);
const byKey = new Map(mn.map((s) => [key(s.name), s]));
const hav = (a, b) => { const r = Math.PI / 180; const x = Math.sin((b[0] - a[0]) * r / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin((b[1] - a[1]) * r / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
let fixed = 0; const log = [];
for (const f of fs.readdirSync('data/systems').filter((f) => f.startsWith('karachi-'))) {
  const p = 'data/systems/' + f; const s = JSON.parse(fs.readFileSync(p, 'utf8')); let ch = false;
  for (const r of s.routes) r.stops.forEach((st, i) => {
    if (st.lat == null || String(st.coord_source).startsWith('osm:')) return;
    const m = byKey.get(key(st.name)); if (!m) return;
    const cur = [st.lat, st.lon], alt = [m.lat, m.lon];
    if (hav(cur, alt) < 3) return;
    const prev = r.stops.slice(0, i).reverse().find((x) => x.lat != null);
    const next = r.stops.slice(i + 1).find((x) => x.lat != null);
    const detour = (pt) => (prev ? hav([prev.lat, prev.lon], pt) : 0) + (next ? hav(pt, [next.lat, next.lon]) : 0);
    if (!(prev || next) || detour(alt) >= detour(cur) - 2) return;
    log.push(`${f} ${r.id} "${st.name}": ${hav(cur, alt).toFixed(1)} km, detour ${detour(cur).toFixed(1)} -> ${detour(alt).toFixed(1)} km (was ${st.coord_source})`);
    st.lat = +m.lat.toFixed(6); st.lon = +m.lon.toFixed(6); st.coord_source = `ext:mnzil:station/${m.mnzil_id}`; fixed++; ch = true;
  });
  if (ch && !dry) fs.writeFileSync(p, JSON.stringify(s, null, 2) + '\n');
}
console.log(log.join('\n')); console.log('fixed', fixed, dry ? '(dry run)' : '');
