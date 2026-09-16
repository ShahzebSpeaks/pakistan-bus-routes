// Shared helpers for the data pipeline. Plain Node >= 20, no runtime dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DATA = path.join(ROOT, 'data');
export const SYSTEMS_DIR = path.join(DATA, 'systems');
export const CACHE_DIR = path.join(DATA, 'cache');
export const SHAPES_DIR = path.join(DATA, 'shapes');
export const PUBLIC_DATA = path.join(ROOT, 'public', 'data');
export const PUBLIC_DOWNLOADS = path.join(ROOT, 'public', 'downloads');
// OpenStreetMap services ask for an identifying User-Agent with contact details. Set PIPELINE_CONTACT.
export const USER_AGENT = `pakistan-bus-routes-data-pipeline/0.1 (+${process.env.PIPELINE_CONTACT || 'https://github.com/topics/pakistan-bus-routes'})`;

export function readJSON(file, fallback = undefined) {
  if (!fs.existsSync(file)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing file: ${file}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
}

export function writeJSON(file, value, { pretty = true } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, (pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value)) + '\n', 'utf8');
}

export function loadCities() {
  return readJSON(path.join(DATA, 'cities.json')).cities;
}

/** @returns {{file: string, system: any}[]} */
export function loadSystems() {
  if (!fs.existsSync(SYSTEMS_DIR)) return [];
  return fs
    .readdirSync(SYSTEMS_DIR)
    .filter((f) => f.endsWith('.json') && !f.startsWith('_'))
    .sort()
    .map((f) => ({ file: path.join(SYSTEMS_DIR, f), system: readJSON(path.join(SYSTEMS_DIR, f)) }));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function haversine(aLat, aLon, bLat, bLon) {
  const R = 6371008.8;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLon = rad(bLon - aLon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Distance in metres from point to the segment a-b, using a local equirectangular projection. */
export function pointSegmentDistance(p, a, b) {
  const k = Math.cos((p[0] * Math.PI) / 180);
  const ax = a[1] * k, ay = a[0], bx = b[1] * k, by = b[0], px = p[1] * k, py = p[0];
  const dx = bx - ax, dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 ? ((px - ax) * dx + (py - ay) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * dx, qy = ay + t * dy;
  return { metres: Math.hypot(px - qx, py - qy) * 111_320, t };
}

/** Distance from a point to a polyline [[lat,lon],...]; also returns metres along the line. */
export function pointLineDistance(p, line, cum = cumulative(line)) {
  let best = { metres: Infinity, along: 0, index: 0 };
  for (let i = 0; i < line.length - 1; i++) {
    const d = pointSegmentDistance(p, line[i], line[i + 1]);
    if (d.metres < best.metres) {
      best = { metres: d.metres, along: cum[i] + d.t * (cum[i + 1] - cum[i]), index: i };
    }
  }
  return best;
}

export function cumulative(line) {
  const out = [0];
  for (let i = 1; i < line.length; i++) {
    out.push(out[i - 1] + haversine(line[i - 1][0], line[i - 1][1], line[i][0], line[i][1]));
  }
  return out;
}

/** Point at `metres` along a polyline. */
export function pointAlong(line, cum, metres) {
  if (metres <= 0) return line[0];
  for (let i = 1; i < line.length; i++) {
    if (cum[i] >= metres) {
      const t = (metres - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]);
      return [line[i - 1][0] + t * (line[i][0] - line[i - 1][0]), line[i - 1][1] + t * (line[i][1] - line[i - 1][1])];
    }
  }
  return line[line.length - 1];
}

export function encodePolyline(points, precision = 5) {
  const factor = 10 ** precision;
  let prevLat = 0, prevLon = 0, out = '';
  const enc = (v) => {
    let n = v < 0 ? ~(v << 1) : v << 1;
    let s = '';
    while (n >= 0x20) {
      s += String.fromCharCode((0x20 | (n & 0x1f)) + 63);
      n >>= 5;
    }
    return s + String.fromCharCode(n + 63);
  };
  for (const [la, lo] of points) {
    const lat = Math.round(la * factor), lon = Math.round(lo * factor);
    out += enc(lat - prevLat) + enc(lon - prevLon);
    prevLat = lat;
    prevLon = lon;
  }
  return out;
}

export function decodePolyline(str, precision = 5) {
  const factor = 10 ** precision;
  const out = [];
  let index = 0, lat = 0, lon = 0;
  while (index < str.length) {
    for (let which = 0; which < 2; which++) {
      let result = 0, shift = 0, byte;
      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20 && index < str.length);
      const delta = result & 1 ? ~(result >> 1) : result >> 1;
      if (which === 0) lat += delta;
      else lon += delta;
    }
    out.push([lat / factor, lon / factor]);
  }
  return out;
}

/** Douglas-Peucker simplification with tolerance in metres. */
export function simplify(line, tolerance = 6) {
  if (line.length <= 2) return line;
  const keep = new Uint8Array(line.length);
  keep[0] = keep[line.length - 1] = 1;
  const stack = [[0, line.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = 0, idx = -1;
    for (let i = s + 1; i < e; i++) {
      const d = pointSegmentDistance(line[i], line[s], line[e]).metres;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tolerance && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return line.filter((_, i) => keep[i]);
}

export function slugify(s) {
  return (
    String(s)
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'stop'
  );
}

// Words that describe the kind of place rather than which place it is.
// Keep distinguishing words such as town, colony, gate, road, market: "Model Town" != "Model Colony".
const GENERIC = new Set([
  'chowrangi', 'chorangi', 'chowk', 'chauk', 'chok', 'more', 'mor', 'morr', 'moar', 'stop', 'bus', 'station',
  'stn', 'terminal', 'terminus', 'interchange', 'crossing', 'flyover', 'underpass', 'the', 'no', 'number',
  'stand', 'adda', 'metro', 'brt', 'feeder', 'roundabout', 'junction', 'signal', 'near', 'opposite', 'opp', 'e', 'of',
]);

const SPELLING = [
  [/\bshahrah?\b|\bshahra\b|\bshara\b|\bsharah\b/g, 'shahrah'],
  [/\bfaysal\b|\bfaisel\b/g, 'faisal'],
  [/\bgulistan\b/g, 'gulistan'],
  [/\bnazimabad\b/g, 'nazimabad'],
  [/\bchundrigar\b|\bchundrigarh\b/g, 'chundrigar'],
  [/\bkorangi\b|\bkorangee\b/g, 'korangi'],
  [/\bhospital\b|\bhosp\b/g, 'hospital'],
  [/\buniversity\b|\buni\b|\bvarsity\b/g, 'university'],
  [/\bkhokhrapar\b|\bkhokrapar\b/g, 'khokhrapar'],
  [/\bsaddar\b|\bsadar\b/g, 'saddar'],
  [/\bkarsaz\b|\bkarsaaz\b/g, 'karsaz'],
  [/\bnumaish\b|\bnumayish\b/g, 'numaish'],
  [/\bsohrab\b|\bsuhrab\b/g, 'sohrab'],
  [/\bmall\b/g, 'mall'],
  [/\bmarket\b|\bmkt\b|\bbazaar\b|\bbazar\b/g, 'market'],
];

/** Lower-case, ASCII-fold, drop generic words; returns a canonical key for name matching. */
export function nameKey(name) {
  let s = String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[-_/.,'’`]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ');
  for (const [re, rep] of SPELLING) s = s.replace(re, rep);
  // Islamabad sectors and similar codes: "G-9", "I 8", "FR 4" -> "g9", "i8", "fr4"
  s = s.replace(/\b([a-z]{1,2})\s+(\d{1,2}[a-z]?)\b/g, '$1$2');
  const all = s.split(/\s+/).filter(Boolean);
  const tokens = all.filter((t) => !GENERIC.has(t));
  return (tokens.length ? tokens : all).join(' ');
}

export function tokenSimilarity(a, b) {
  const A = new Set(a.split(' ').filter(Boolean));
  const B = new Set(b.split(' ').filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const t of A) if (B.has(t)) inter++;
  return (2 * inter) / (A.size + B.size);
}

export function log(...args) {
  console.log(...args);
}
