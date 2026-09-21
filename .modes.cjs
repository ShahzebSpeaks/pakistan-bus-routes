const fs = require('fs');
function rw(p, pairs) {
  let s = fs.readFileSync(p, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error(p + ' missing: ' + a.slice(0, 70));
    s = s.split(a).join(b);
  }
  fs.writeFileSync(p, s);
}
rw('src/types.ts', [["export type Mode = 'bus' | 'brt' | 'metro_rail' | 'feeder' | 'electric_bus';",
  "export type Mode = 'bus' | 'brt' | 'metro_rail' | 'feeder' | 'electric_bus' | 'intercity_bus' | 'rail';"]]);
rw('scripts/build-data.mjs', [
  ["const GTFS_ROUTE_TYPE = { bus: 3, feeder: 3, electric_bus: 3, brt: 3, metro_rail: 1 };",
   "const GTFS_ROUTE_TYPE = { bus: 3, feeder: 3, electric_bus: 3, brt: 3, metro_rail: 1, intercity_bus: 3, rail: 2 };"],
  ["const SPEED_KMH = { bus: 16, feeder: 16, electric_bus: 17, brt: 24, metro_rail: 34 };",
   "const SPEED_KMH = { bus: 16, feeder: 16, electric_bus: 17, brt: 24, metro_rail: 34, intercity_bus: 55, rail: 45 };"],
]);
rw('scripts/validate.mjs', [
  ["const MODES = ['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus'];",
   "const MODES = ['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus', 'intercity_bus', 'rail'];"],
  ["const limit = (s.mode === 'metro_rail' ? 5000 : 6000) * Math.max(1, i - prev.i);",
   "const limit = (s.mode === 'metro_rail' ? 5000 : s.mode === 'intercity_bus' || s.mode === 'rail' ? 400000 : 6000) * Math.max(1, i - prev.i);"],
]);
rw('scripts/import-research.mjs', [["const MODES = new Set(['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus']);",
  "const MODES = new Set(['bus', 'brt', 'metro_rail', 'feeder', 'electric_bus', 'intercity_bus', 'rail']);"]]);
rw('scripts/shapes.mjs', [["    if (mode !== 'metro_rail' && route.shape !== 'straight') {",
  "    if (mode !== 'metro_rail' && mode !== 'rail' && route.shape !== 'straight') {"],
  ["    const simplified = simplify(line, 5);", "    // Long-distance lines need far fewer points to look right.\n    const simplified = simplify(line, mode === 'intercity_bus' ? 60 : 5);"]]);
rw('scripts/geocode.mjs', [
  ["  const q = `${clean}, ${city.name.replace(/\s*\(.*\)/, '')}, Pakistan`;",
   "  const q = city.id === 'intercity' ? `${clean}, Pakistan` : `${clean}, ${city.name.replace(/\s*\(.*\)/, '')}, Pakistan`;"],
  ["const stationMode = system.mode === 'brt' || system.mode === 'metro_rail';",
   "const stationMode = system.mode === 'brt' || system.mode === 'metro_rail' || system.mode === 'rail' || system.mode === 'intercity_bus';"],
]);
console.log('modes updated');
