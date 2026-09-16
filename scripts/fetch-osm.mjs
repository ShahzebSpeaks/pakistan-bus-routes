// Download named places (bus stops, stations, junctions, landmarks, neighbourhoods) from OpenStreetMap
// for every city that has at least one system, into data/cache/osm/<city>.json.
// These are used by geocode.mjs to match stop names to coordinates.
//   node scripts/fetch-osm.mjs [--refresh] [city-id ...]
import fs from 'node:fs';
import path from 'node:path';
import { CACHE_DIR, USER_AGENT, loadCities, loadSystems, sleep, writeJSON } from './lib.mjs';

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const only = new Set(args.filter((a) => !a.startsWith('--')));
const ENDPOINTS = (process.env.OVERPASS_URL ? [process.env.OVERPASS_URL] : []).concat(['https://maps.mail.ru/osm/tools/overpass/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass-api.de/api/interpreter']);

const usedCities = new Set(loadSystems().map((s) => s.system.city));
const cities = loadCities().filter((c) => usedCities.has(c.id) && (!only.size || only.has(c.id)));

// Every named node, way and relation. A single broad filter is cheaper for Overpass than many tag
// filters, and named roads help match stops such as "University Road".
function query([s, w, n, e]) {
  // Only area relations: country/province boundaries and long route relations are huge and slow to centre.
  const b = `(${s},${w},${n},${e})`;
  return `[out:json][timeout:90];(node["name"]${b};way["name"]${b};relation["name"]["type"="multipolygon"]${b};relation["name"]["boundary"]["admin_level"~"^(8|9|10|11)$"]${b};);out center tags qt;`;
}

const KEEP_TAGS = ['name', 'name:en', 'name:ur', 'alt_name', 'old_name', 'short_name', 'official_name', 'int_name'];
const KIND_KEYS = ['public_transport', 'railway', 'junction', 'highway', 'amenity', 'place', 'shop', 'leisure', 'tourism', 'historic', 'landuse', 'boundary', 'aeroway', 'office', 'military', 'building'];

function compact(el) {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (lat == null || lon == null) return null;
  const t = el.tags || {};
  const names = {};
  for (const k of KEEP_TAGS) if (t[k]) names[k] = t[k];
  const kindKey = KIND_KEYS.find((k) => t[k]);
  return { id: `${el.type}/${el.id}`, lat: +lat.toFixed(6), lon: +lon.toFixed(6), kind: kindKey ? `${kindKey}=${t[kindKey]}` : 'other', names };
}

const quarter = ([s, w, n, e]) => {
  const my = +((s + n) / 2).toFixed(4);
  const mx = +((w + e) / 2).toFixed(4);
  return [[s, w, my, mx], [s, mx, my, e], [my, w, n, mx], [my, mx, n, e]];
};

/** One HTTP attempt per endpoint; returns JSON or null. */
async function tryQuery(label, bbox) {
  for (const endpoint of ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'User-Agent': USER_AGENT, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query(bbox)),
        signal: AbortSignal.timeout(150_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      if (!text.startsWith('{')) throw new Error('non-JSON response');
      const json = JSON.parse(text);
      if (json.remark && /timed out|out of memory/i.test(json.remark)) throw new Error(json.remark);
      return json;
    } catch (err) {
      console.warn(`! ${label}: ${err.message} (${new URL(endpoint).host})`);
      await sleep(3000);
    }
  }
  return null;
}

/** Query a bbox; when every mirror fails, split it into quarters (down to ~0.05 degrees). */
async function fetchArea(label, bbox, into, depth = 0) {
  const json = await tryQuery(label, bbox);
  if (json) {
    for (const el of json.elements || []) {
      const f = compact(el);
      if (f) into.byId.set(f.id, f);
    }
    into.osmBase = json.osm3s?.timestamp_osm_base ?? into.osmBase;
    into.queries++;
    await sleep(1500);
    return true;
  }
  if (bbox[2] - bbox[0] < 0.06 || depth > 4) return false;
  for (const [i, q] of quarter(bbox).entries()) {
    if (!(await fetchArea(`${label}.${i + 1}`, q, into, depth + 1))) return false;
  }
  return true;
}

let failed = 0;
for (const city of cities) {
  const file = path.join(CACHE_DIR, 'osm', `${city.id}.json`);
  if (fs.existsSync(file) && !refresh) {
    console.log(`- ${city.id}: cached`);
    continue;
  }
  const into = { byId: new Map(), osmBase: null, queries: 0 };
  // Large cities start as quarters; small ones as a single query.
  const [s, w, n, e] = city.bbox;
  const start = (n - s) * (e - w) > 0.12 ? quarter(city.bbox) : [city.bbox];
  let ok = true;
  for (const [i, bbox] of start.entries()) {
    if (!(await fetchArea(`${city.id}#${i + 1}`, bbox, into))) {
      ok = false;
      break;
    }
  }
  if (!ok) {
    failed++;
    console.warn(`! ${city.id}: giving up for now, run again later`);
    continue;
  }
  const features = [...into.byId.values()];
  writeJSON(file, { city: city.id, fetched_at: new Date().toISOString(), osm_base: into.osmBase, license: 'ODbL, (c) OpenStreetMap contributors', features }, { pretty: false });
  console.log(`+ ${city.id}: ${features.length} named features (${into.queries} queries)`);
}
if (failed) process.exitCode = 1;
