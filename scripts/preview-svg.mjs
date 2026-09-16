// Draw the compiled routes of a city as a plain SVG map, for the README and for a quick visual check.
// No basemap, no external assets: just the route lines and stops from public/data.
//   node scripts/preview-svg.mjs [city-id ...]      (default: the four largest networks)
import fs from 'node:fs';
import path from 'node:path';
import { PUBLIC_DATA, ROOT, decodePolyline, readJSON } from './lib.mjs';

const WIDTH = 900;
const HEIGHT = 620;
const PAD = 24;

const cities = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const index = readJSON(path.join(PUBLIC_DATA, 'index.json'));
const wanted = cities.length ? cities : index.cities.slice(0, 4).map((c) => c.id);

for (const id of wanted) {
  const file = path.join(PUBLIC_DATA, 'cities', `${id}.json`);
  if (!fs.existsSync(file)) {
    console.warn(`! no data for ${id}`);
    continue;
  }
  const data = readJSON(file);
  const drawn = data.routes.filter((r) => r.shape && (r.status === 'operational' || r.status === 'unverified'));
  if (!drawn.length) continue;

  const lines = drawn.map((r) => ({ route: r, points: decodePolyline(r.shape) }));
  const lats = lines.flatMap((l) => l.points.map((p) => p[0]));
  const lons = lines.flatMap((l) => l.points.map((p) => p[1]));
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  // Web-Mercator-ish: longitude degrees are shorter away from the equator.
  const k = Math.cos(((minLat + maxLat) / 2) * (Math.PI / 180));
  const w = (maxLon - minLon) * k;
  const h = maxLat - minLat;
  const scale = Math.min((WIDTH - 2 * PAD) / w, (HEIGHT - 2 * PAD) / h);
  const offX = (WIDTH - w * scale) / 2;
  const offY = (HEIGHT - h * scale) / 2;
  const px = (lat, lon) => [
    +(offX + (lon - minLon) * k * scale).toFixed(1),
    +(offY + (maxLat - lat) * scale).toFixed(1),
  ];

  const paths = lines
    .map(({ route, points }) => {
      const d = points.map(([la, lo], i) => `${i ? 'L' : 'M'}${px(la, lo).join(' ')}`).join('');
      return `<path d="${d}" fill="none" stroke="${route.color}" stroke-width="2.4" stroke-opacity="0.85" stroke-linecap="round" stroke-linejoin="round"><title>${route.id} ${route.name.replace(/[<&]/g, '')}</title></path>`;
    })
    .join('\n    ');

  const stationDots = data.stops
    .filter((s) => s.is_station)
    .map((s) => {
      const [x, y] = px(s.lat, s.lon);
      return `<circle cx="${x}" cy="${y}" r="2.6" fill="#fffdf7" stroke="#1d2320" stroke-width="1"/>`;
    })
    .join('\n    ');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}" width="${WIDTH}" height="${HEIGHT}" role="img" aria-label="${data.city.name} transit routes">
  <title>${data.city.name}: ${drawn.length} routes</title>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#f4f1e8"/>
  <g>
    ${paths}
  </g>
  <g>
    ${stationDots}
  </g>
  <text x="${PAD}" y="${HEIGHT - 34}" font-family="system-ui, sans-serif" font-size="20" font-weight="700" fill="#1d2320">${data.city.name}</text>
  <text x="${PAD}" y="${HEIGHT - 14}" font-family="system-ui, sans-serif" font-size="12" fill="#4b5550">${drawn.length} routes · ${data.stops.length} stops · Pakistan Bus Routes, data © OpenStreetMap contributors (ODbL)</text>
</svg>
`;
  const out = path.join(ROOT, 'docs', 'previews', `${id}.svg`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, svg);
  console.log(`+ docs/previews/${id}.svg (${drawn.length} routes)`);
}
