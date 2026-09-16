// Compile data/systems + data/shapes into what the app and downloads need. Works offline.
//   public/data/index.json                 list of cities with counts
//   public/data/cities/<city>.json         systems, routes, merged stops, encoded shapes
//   public/downloads/pakistan-bus-routes.geojson
//   public/downloads/pakistan-bus-routes-gtfs.zip   (GTFS with frequency-based trips)
//   public/downloads/stops.csv
//   docs/COVERAGE.md                        per-route coverage and data quality report
import fs from 'node:fs';
import path from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import {
  PUBLIC_DATA, PUBLIC_DOWNLOADS, ROOT, SHAPES_DIR, cumulative, decodePolyline, encodePolyline,
  haversine, loadCities, loadSystems, nameKey, pointLineDistance, readJSON, slugify, writeJSON,
} from './lib.mjs';

const pkg = readJSON(path.join(ROOT, 'package.json'));
const REPO_URL = process.env.REPO_URL || 'https://github.com/OWNER/pakistan-bus-routes';
const generatedAt = new Date().toISOString();

const VARIANT_COLORS = {
  red: ['#C62828', '#AD1457', '#B71C1C', '#D84315', '#8E24AA', '#E53935', '#6D4C41', '#F4511E', '#C2185B', '#7B1FA2', '#BF360C', '#880E4F', '#D32F2F', '#5D4037', '#EF6C00'],
  pink: ['#EC407A', '#D81B60', '#F06292', '#AD1457', '#FF4081'],
  ev: ['#1565C0', '#00838F', '#283593', '#0277BD', '#00695C', '#4527A0', '#2E7D32'],
  brt: ['#2E7D32', '#EF6C00', '#C62828', '#1565C0', '#F9A825', '#6D4C41'],
  metro: ['#EF6C00', '#2E7D32', '#1565C0', '#8E24AA'],
  feeder: ['#00897B', '#5E35B1', '#3949AB', '#6D4C41', '#F4511E', '#039BE5', '#7CB342', '#8D6E63', '#00ACC1', '#C0CA33', '#D81B60', '#546E7A'],
  default: ['#00897B', '#5E35B1', '#3949AB', '#F4511E', '#039BE5', '#7CB342', '#8D6E63', '#00ACC1', '#C0CA33', '#D81B60', '#546E7A', '#6D4C41'],
};
const GTFS_ROUTE_TYPE = { bus: 3, feeder: 3, electric_bus: 3, brt: 3, metro_rail: 1 };
const SPEED_KMH = { bus: 16, feeder: 16, electric_bus: 17, brt: 24, metro_rail: 34 };

const quality = (s) => {
  if (s.lat == null) return 'missing';
  const src = String(s.coord_source || '');
  if (!src.startsWith('auto:')) return 'exact';
  if (src.startsWith('auto:interpolated')) return 'estimated';
  if (src.startsWith('auto:nominatim')) return 'geocoded';
  return 'matched';
};
const QUALITY_RANK = { exact: 0, matched: 1, geocoded: 2, estimated: 3, missing: 4 };

const cities = loadCities();
const systemsByCity = new Map();
for (const { system } of loadSystems()) {
  if (!systemsByCity.has(system.city)) systemsByCity.set(system.city, []);
  systemsByCity.get(system.city).push(system);
}

fs.rmSync(path.join(PUBLIC_DATA, 'cities'), { recursive: true, force: true });
fs.mkdirSync(path.join(PUBLIC_DATA, 'cities'), { recursive: true });
fs.mkdirSync(PUBLIC_DOWNLOADS, { recursive: true });

const index = { generated_at: generatedAt, version: pkg.version, cities: [], totals: { cities: 0, systems: 0, routes: 0, stops: 0 } };
const geojson = { type: 'FeatureCollection', features: [] };
const gtfs = { agency: [], stops: [], routes: [], trips: [], stop_times: [], frequencies: [], shapes: [] };
const coverage = [];
const warnings = [];

for (const city of cities) {
  const systems = systemsByCity.get(city.id);
  if (!systems?.length) continue;

  const stops = []; // merged city stops
  const stopIds = new Set();
  const routes = [];

  const findOrCreateStop = (s) => {
    const key = nameKey(s.name);
    const q = quality(s);
    // same name within 450 m, or any stop within 25 m, is the same place
    let match = stops.find((m) => (m._key === key && haversine(m.lat, m.lon, s.lat, s.lon) <= 450) || haversine(m.lat, m.lon, s.lat, s.lon) <= 25);
    if (match) {
      if (QUALITY_RANK[q] < QUALITY_RANK[match.quality]) Object.assign(match, { lat: s.lat, lon: s.lon, quality: q });
      if (!match.name_ur && s.name_ur) match.name_ur = s.name_ur;
      match.is_station ||= Boolean(s.is_station);
      return match;
    }
    let id = slugify(s.name);
    for (let n = 2; stopIds.has(id); n++) id = `${slugify(s.name)}-${n}`;
    stopIds.add(id);
    match = { id, name: s.name, name_ur: s.name_ur || '', lat: +s.lat.toFixed(6), lon: +s.lon.toFixed(6), quality: q, is_station: Boolean(s.is_station), routes: [], _key: key };
    stops.push(match);
    return match;
  };

  const systemsOut = systems.map((sys) => ({
    id: sys.id, name: sys.name, name_ur: sys.name_ur || '', operator: sys.operator || '', mode: sys.mode,
    website: sys.website || null, helpline: sys.helpline || null, payment: sys.payment || null,
    fare_rules: sys.fare_rules || { type: 'unknown', currency: 'PKR' }, hours: sys.hours || null,
    last_verified: sys.last_verified || null, sources: sys.sources || [],
  }));

  for (const sys of systems) {
    const palette = { ...VARIANT_COLORS };
    const used = {};
    for (const r of sys.routes) {
      const mode = r.mode || sys.mode;
      const withCoords = r.stops.filter((s) => s.lat != null && s.lon != null);
      const counts = { exact: 0, matched: 0, geocoded: 0, estimated: 0, missing: 0 };
      r.stops.forEach((s) => counts[quality(s)]++);
      coverage.push({ city: city.name, system: sys.name, systemId: sys.id, route: r.id, name: r.name, status: r.status, stops: r.stops.length, confidence: r.stops_confidence, counts });
      if (r.stops.length - withCoords.length) warnings.push(`${sys.id}/${r.id}: ${r.stops.length - withCoords.length} stop(s) without coordinates are left out of the map`);
      const cityStops = [];
      for (const s of withCoords) {
        const m = findOrCreateStop(s);
        if (cityStops.at(-1) !== m) cityStops.push(m); // drop consecutive duplicates
      }
      const fare0 = r.fare_override || sys.fare_rules || { type: 'unknown', currency: 'PKR' };
      if (cityStops.length < 2) {
        // Keep the route as information only (no map line, not used for trip planning).
        warnings.push(`${sys.id}/${r.id}: fewer than 2 located stops, listed without a map line`);
        const routeIndex = routes.length;
        routes.push({
          key: `${sys.id}:${r.id}`, id: r.id, system: sys.id, name: r.name, name_ur: r.name_ur || '', mode, variant: r.variant || 'regular',
          color: r.color || (VARIANT_COLORS[r.variant] || VARIANT_COLORS.default)[0], status: r.status, length_km: r.length_km ?? null,
          headway_min: r.headway_min ?? null, hours: r.hours || (sys.hours ? { start: sys.hours.start || null, end: sys.hours.end || null } : null),
          fare: fare0, women_only: Boolean(r.women_only), launched: r.launched || null, stops: cityStops.map((s) => s.id),
          cum_km: cityStops.map(() => 0), shape: '', shape_source: 'straight', stops_confidence: r.stops_confidence || 'low',
          sources: r.sources || [], notes: [r.notes, r.stops.length ? `Stops without locations: ${r.stops.filter((s) => s.lat == null).map((s) => s.name).join(', ')}` : ''].filter(Boolean).join('\n\n'),
        });
        for (const s of cityStops) if (!s.routes.includes(routeIndex)) s.routes.push(routeIndex);
        continue;
      }

      // shape
      const shapeFile = path.join(SHAPES_DIR, sys.id, `${r.id.replace(/[^A-Za-z0-9_-]+/g, '_')}.json`);
      const shapeDoc = readJSON(shapeFile, null);
      let line = shapeDoc ? decodePolyline(shapeDoc.polyline) : cityStops.map((s) => [s.lat, s.lon]);
      let shapeSource = shapeDoc?.source || 'straight';

      // Distance of each stop along the shape. A route that passes close to itself can project one
      // stop slightly backwards, which is fine; the shape is only rejected when many stops sit far
      // from it or the order is badly wrong.
      const lineCum = cumulative(line);
      const along = cityStops.map((s) => pointLineDistance([s.lat, s.lon], line, lineCum));
      const bad = along.filter((a, i) => a.metres > 500 || (i > 0 && a.along < along[i - 1].along - 2000)).length;
      const usable = bad <= Math.max(2, Math.round(cityStops.length * 0.2));
      let cum;
      if (usable && shapeSource !== 'straight') {
        const base = along[0].along;
        cum = along.map((a) => +(Math.max(0, a.along - base) / 1000).toFixed(3));
        for (let i = 1; i < cum.length; i++) cum[i] = Math.max(cum[i], cum[i - 1]);
      } else {
        const chain = cumulative(cityStops.map((s) => [s.lat, s.lon]));
        const factor = mode === 'metro_rail' ? 1.05 : 1.25;
        cum = chain.map((m) => +((m * factor) / 1000).toFixed(3));
        if (shapeSource !== 'straight') {
          warnings.push(`${sys.id}/${r.id}: stops do not follow the routed shape in order; using straight segments`);
          line = cityStops.map((s) => [s.lat, s.lon]);
          shapeSource = 'straight';
        }
      }

      const variant = r.variant || 'regular';
      const pal = palette[variant] || palette.default;
      used[variant] = (used[variant] || 0) + 1;
      const color = r.color || pal[(used[variant] - 1) % pal.length];
      const fare = r.fare_override || sys.fare_rules || { type: 'unknown', currency: 'PKR' };
      const routeIndex = routes.length;
      const hours = r.hours || (sys.hours ? { start: sys.hours.start || null, end: sys.hours.end || null } : null);
      routes.push({
        key: `${sys.id}:${r.id}`, id: r.id, system: sys.id, name: r.name, name_ur: r.name_ur || '', mode, variant, color,
        status: r.status, length_km: r.length_km ?? +(cum.at(-1)).toFixed(1), headway_min: r.headway_min ?? null, hours,
        fare, women_only: Boolean(r.women_only), launched: r.launched || null, stops: cityStops.map((s) => s.id), cum_km: cum,
        shape: encodePolyline(line), shape_source: shapeSource, stops_confidence: r.stops_confidence || 'low',
        sources: r.sources || [], notes: r.notes || '',
      });
      for (const s of cityStops) if (!s.routes.includes(routeIndex)) s.routes.push(routeIndex);

      // GeoJSON + GTFS
      geojson.features.push({
        type: 'Feature',
        properties: { kind: 'route', city: city.id, system: sys.id, operator: sys.operator, route_id: r.id, name: r.name, mode, status: r.status, color, stops: cityStops.map((s) => s.name), shape_source: shapeSource },
        geometry: { type: 'LineString', coordinates: line.map(([la, lo]) => [lo, la]) },
      });
      if (r.status === 'operational' || r.status === 'unverified') {
        const gRoute = `${sys.id}:${r.id}`;
        gtfs.routes.push({ route_id: gRoute, agency_id: sys.id, route_short_name: r.id, route_long_name: r.name, route_type: GTFS_ROUTE_TYPE[mode] ?? 3, route_color: color.slice(1), route_text_color: 'FFFFFF' });
        const start = hours?.start || '07:00';
        const end = hours?.end || '22:00';
        const toSec = (hm) => {
          const [h, m] = hm.split(':').map(Number);
          return h * 3600 + (m || 0) * 60;
        };
        const fmt = (sec) => `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
        for (const dir of [0, 1]) {
          const tripId = `${gRoute}:${dir}`;
          const shapeId = `${gRoute}:${dir}`;
          const seq = dir ? [...cityStops].reverse() : cityStops;
          const seqCum = dir ? cum.map((c) => cum.at(-1) - c).reverse() : cum;
          gtfs.trips.push({ route_id: gRoute, service_id: 'DAILY', trip_id: tripId, direction_id: dir, shape_id: shapeId });
          seq.forEach((s, i) => {
            const t = fmt(toSec(start) + (seqCum[i] / SPEED_KMH[mode]) * 3600 + i * 20);
            gtfs.stop_times.push({ trip_id: tripId, arrival_time: t, departure_time: t, stop_id: `${city.id}:${s.id}`, stop_sequence: i + 1, timepoint: 0 });
          });
          gtfs.frequencies.push({ trip_id: tripId, start_time: fmt(toSec(start)), end_time: fmt(toSec(end)), headway_secs: (r.headway_min || 15) * 60, exact_times: 0 });
          const shapePts = dir ? [...line].reverse() : line;
          const shapeCum = cumulative(shapePts);
          shapePts.forEach(([la, lo], i) => gtfs.shapes.push({ shape_id: shapeId, shape_pt_lat: la.toFixed(6), shape_pt_lon: lo.toFixed(6), shape_pt_sequence: i + 1, shape_dist_traveled: (shapeCum[i] / 1000).toFixed(3) }));
        }
      }
    }
    gtfs.agency.push({ agency_id: sys.id, agency_name: `${sys.name}${sys.operator ? ` (${sys.operator})` : ''}`, agency_url: sys.website || REPO_URL, agency_timezone: 'Asia/Karachi', agency_lang: 'en', agency_phone: sys.helpline || '' });
  }

  if (!routes.length) continue;
  const outStops = stops.map(({ _key, ...s }) => s);
  for (const s of outStops) {
    geojson.features.push({ type: 'Feature', properties: { kind: 'stop', city: city.id, stop_id: s.id, name: s.name, name_ur: s.name_ur, coord_quality: s.quality, routes: s.routes.map((i) => routes[i].key) }, geometry: { type: 'Point', coordinates: [s.lon, s.lat] } });
    gtfs.stops.push({ stop_id: `${city.id}:${s.id}`, stop_name: s.name, stop_lat: s.lat, stop_lon: s.lon, location_type: 0, stop_desc: `coordinates: ${s.quality}` });
  }
  const summary = {
    id: city.id, name: city.name, name_ur: city.name_ur, province: city.province, center: city.center, zoom: city.zoom, bbox: city.bbox,
    systems: systems.length, routes: routes.length, operational_routes: routes.filter((r) => r.status === 'operational').length, stops: outStops.length,
  };
  writeJSON(path.join(PUBLIC_DATA, 'cities', `${city.id}.json`), { city: summary, generated_at: generatedAt, systems: systemsOut, routes, stops: outStops }, { pretty: false });
  index.cities.push(summary);
  index.totals.cities++;
  index.totals.systems += systems.length;
  index.totals.routes += routes.length;
  index.totals.stops += outStops.length;
  console.log(`${city.id.padEnd(22)} systems ${systems.length}  routes ${routes.length}  stops ${outStops.length}`);
}

index.cities.sort((a, b) => b.routes - a.routes);
writeJSON(path.join(PUBLIC_DATA, 'index.json'), index);
writeJSON(path.join(PUBLIC_DOWNLOADS, 'pakistan-bus-routes.geojson'), geojson, { pretty: false });

// CSV helpers
const csv = (rows, cols) => [cols.join(','), ...rows.map((r) => cols.map((c) => {
  const v = r[c] ?? '';
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}).join(','))].join('\n') + '\n';

// GTFS validators flag stops that no trip serves; drop stops only used by non-operational routes.
const gtfsUsedStops = new Set(gtfs.stop_times.map((r) => r.stop_id));
gtfs.stops = gtfs.stops.filter((s) => gtfsUsedStops.has(s.stop_id));
const gtfsUsedAgencies = new Set(gtfs.routes.map((r) => r.agency_id));
gtfs.agency = gtfs.agency.filter((a) => gtfsUsedAgencies.has(a.agency_id));

const today = new Date();
const ymd = (d) => `${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, '0')}${String(d.getUTCDate()).padStart(2, '0')}`;
const nextYear = new Date(today);
nextYear.setUTCFullYear(today.getUTCFullYear() + 1);
const files = {
  'agency.txt': csv(gtfs.agency, ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang', 'agency_phone']),
  'stops.txt': csv(gtfs.stops, ['stop_id', 'stop_name', 'stop_lat', 'stop_lon', 'location_type', 'stop_desc']),
  'routes.txt': csv(gtfs.routes, ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'route_type', 'route_color', 'route_text_color']),
  'trips.txt': csv(gtfs.trips, ['route_id', 'service_id', 'trip_id', 'direction_id', 'shape_id']),
  'stop_times.txt': csv(gtfs.stop_times, ['trip_id', 'arrival_time', 'departure_time', 'stop_id', 'stop_sequence', 'timepoint']),
  'frequencies.txt': csv(gtfs.frequencies, ['trip_id', 'start_time', 'end_time', 'headway_secs', 'exact_times']),
  'shapes.txt': csv(gtfs.shapes, ['shape_id', 'shape_pt_lat', 'shape_pt_lon', 'shape_pt_sequence', 'shape_dist_traveled']),
  'calendar.txt': csv([{ service_id: 'DAILY', monday: 1, tuesday: 1, wednesday: 1, thursday: 1, friday: 1, saturday: 1, sunday: 1, start_date: ymd(today), end_date: ymd(nextYear) }], ['service_id', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'start_date', 'end_date']),
  'feed_info.txt': csv([{ feed_publisher_name: 'Pakistan Bus Routes (community project)', feed_publisher_url: REPO_URL, feed_lang: 'en', feed_start_date: ymd(today), feed_end_date: ymd(nextYear), feed_version: `${pkg.version}-${ymd(today)}`, feed_contact_url: `${REPO_URL}/issues` }], ['feed_publisher_name', 'feed_publisher_url', 'feed_lang', 'feed_start_date', 'feed_end_date', 'feed_version', 'feed_contact_url']),
};
const zipInput = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, strToU8(v)]));
fs.writeFileSync(path.join(PUBLIC_DOWNLOADS, 'pakistan-bus-routes-gtfs.zip'), zipSync(zipInput, { level: 9 }));
fs.writeFileSync(path.join(PUBLIC_DOWNLOADS, 'stops.csv'), files['stops.txt']);

// Coverage report
const pct = (n, d) => (d ? `${Math.round((n / d) * 100)}%` : '-');
let md = `# Data coverage\n\nGenerated ${generatedAt.slice(0, 10)} by \`npm run data:build\`. Do not edit by hand.\n\n`;
md += `**${index.totals.cities} cities · ${index.totals.systems} systems · ${index.totals.routes} published routes · ${index.totals.stops} stops**\n\n`;
md += `Coordinate quality: **exact** = verified (OpenStreetMap element or Wikipedia, checked by a person), **matched** = automatic OpenStreetMap name match, **geocoded** = Nominatim search, **estimated** = interpolated between neighbours, **missing** = not on the map yet.\n\n`;
md += `Help wanted: routes with many *estimated* or *missing* stops. See [CONTRIBUTING.md](../CONTRIBUTING.md).\n\n`;
let lastCity = '';
for (const c of coverage) {
  if (c.city !== lastCity) {
    md += `\n## ${c.city}\n\n| System | Route | Name | Status | Stops | Exact | Matched | Geocoded | Estimated | Missing | Stop list confidence |\n|---|---|---|---|---:|---:|---:|---:|---:|---:|---|\n`;
    lastCity = c.city;
  }
  md += `| ${c.system} | ${c.route} | ${c.name.replace(/\|/g, '/')} | ${c.status} | ${c.stops} | ${pct(c.counts.exact, c.stops)} | ${pct(c.counts.matched, c.stops)} | ${pct(c.counts.geocoded, c.stops)} | ${pct(c.counts.estimated, c.stops)} | ${c.counts.missing} | ${c.confidence} |\n`;
}
if (warnings.length) md += `\n## Build warnings\n\n${warnings.map((w) => `- ${w}`).join('\n')}\n`;
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'COVERAGE.md'), md);

// Sources list
let src = `# Sources\n\nGenerated ${generatedAt.slice(0, 10)} from \`data/systems\`. Facts (route numbers, stop names, fares, timings) were compiled from these public sources. Maps, images and text from them are not redistributed.\n`;
for (const { system: sys } of loadSystems()) {
  const seen = new Set();
  const rows = [...(sys.sources || []), ...sys.routes.flatMap((r) => r.sources || [])].filter((s) => s?.url && !seen.has(s.url) && seen.add(s.url));
  src += `\n## ${sys.name} (${sys.city})\n\n`;
  src += rows.length
    ? rows.map((s) => `- [${String(s.title || s.url).replace(/[[\]]/g, '')}](${s.url})${s.publisher ? ` · ${s.publisher}` : ''}${s.date ? ` · ${s.date}` : ''}${s.official ? ' · official' : ''}`).join('\n') + '\n'
    : '_No sources recorded._\n';
}
src += `\n## Geodata\n\n- Stop positions and road geometry: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), ODbL\n- Routing: [OSRM](https://project-osrm.org/) over OpenStreetMap\n- Geocoding: [Nominatim](https://nominatim.org/)\n`;
fs.writeFileSync(path.join(ROOT, 'docs', 'SOURCES.md'), src);

console.log(`\nTotal: ${index.totals.cities} cities, ${index.totals.systems} systems, ${index.totals.routes} routes, ${index.totals.stops} stops`);
console.log(`GTFS: ${gtfs.routes.length} routes, ${gtfs.stops.length} stops, ${gtfs.shapes.length} shape points`);
if (warnings.length) console.log(`${warnings.length} warning(s), see docs/COVERAGE.md`);
