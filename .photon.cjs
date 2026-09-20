const fs = require('fs');
const p = 'scripts/geocode.mjs';
let s = fs.readFileSync(p, 'utf8');
const pairs = [
  ["const useNominatim = !args.includes('--no-nominatim');",
   "const useNominatim = !args.includes('--no-nominatim');\nconst usePhoton = !args.includes('--no-photon');"],
  ["const nominatimCache = readJSON(nominatimFile, {});",
   "const nominatimCache = readJSON(nominatimFile, {});\nconst photonFile = path.join(CACHE_DIR, 'photon.json');\nconst photonCache = readJSON(photonFile, {});"],
  ["      if (pass === 2 && useNominatim) {\n        for (let i = 0; i < stops.length; i++) {\n          const s = stops[i];\n          if (hasCoord(s)) continue;\n          const found = (await nominatimCandidates(s.name, city)).filter((c) => inBbox(c) && nearRef(c)).filter(notRejected(i));",
   "      if (pass === 2 && (useNominatim || usePhoton)) {\n        for (let i = 0; i < stops.length; i++) {\n          const s = stops[i];\n          if (hasCoord(s)) continue;\n          const found = [\n            ...(useNominatim ? await nominatimCandidates(s.name, city) : []),\n            ...(usePhoton ? await photonCandidates(s.name, city) : []),\n          ].filter((c) => inBbox(c) && nearRef(c)).filter(notRejected(i));"],
  ["  else if (s.coord_source.startsWith('auto:nominatim')) counts.nominatim++;",
   "  else if (s.coord_source.startsWith('auto:nominatim') || s.coord_source.startsWith('auto:photon')) counts.nominatim++;"],
  ["//   node scripts/geocode.mjs [--refresh] [--no-nominatim] [system-id ...]",
   "//   node scripts/geocode.mjs [--refresh] [--no-nominatim] [--no-photon] [system-id ...]"],
];
for (const [a, b] of pairs) {
  if (!s.includes(a)) throw new Error('missing: ' + a.slice(0, 60));
  s = s.replace(a, b);
}
fs.writeFileSync(p, s);
console.log('ok');
