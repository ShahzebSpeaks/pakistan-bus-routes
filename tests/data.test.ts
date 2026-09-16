// Checks the compiled dataset in public/data, so a bad pipeline run fails CI instead of the app.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decodePolyline, haversine } from '../src/lib/geo';
import { Planner } from '../src/lib/planner';
import type { CityData, DatasetIndex } from '../src/types';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'public', 'data');
const read = <T,>(p: string): T => JSON.parse(fs.readFileSync(p, 'utf8'));

const index = read<DatasetIndex>(path.join(DATA, 'index.json'));
const cities = index.cities.map((c) => ({ summary: c, data: read<CityData>(path.join(DATA, 'cities', `${c.id}.json`)) }));

describe('compiled dataset', () => {
  it('has cities, and the index counts match the city files', () => {
    expect(cities.length).toBeGreaterThan(5);
    for (const { summary, data } of cities) {
      expect(data.city.id).toBe(summary.id);
      expect(data.routes.length).toBe(summary.routes);
      expect(data.stops.length).toBe(summary.stops);
    }
  });

  it('every route points at stops that exist, in a consistent order', () => {
    for (const { data } of cities) {
      const ids = new Set(data.stops.map((s) => s.id));
      for (const r of data.routes) {
        expect(r.stops.length).toBe(r.cum_km.length);
        for (const id of r.stops) expect(ids.has(id), `${r.key} -> ${id}`).toBe(true);
        for (let i = 1; i < r.cum_km.length; i++) {
          expect(r.cum_km[i], `${r.key} distances go backwards at stop ${i}`).toBeGreaterThanOrEqual(r.cum_km[i - 1]);
        }
      }
    }
  });

  it('stops know the routes that serve them', () => {
    for (const { data } of cities) {
      for (const s of data.stops) {
        for (const ri of s.routes) {
          expect(data.routes[ri], `${data.city.id}/${s.id} references route ${ri}`).toBeDefined();
          expect(data.routes[ri].stops).toContain(s.id);
        }
      }
    }
  });

  it('shapes decode and stay inside the city bounding box', () => {
    for (const { data } of cities) {
      const [s, w, n, e] = data.city.bbox;
      for (const r of data.routes) {
        if (!r.shape) continue;
        const line = decodePolyline(r.shape);
        expect(line.length, `${r.key} has an empty shape`).toBeGreaterThan(1);
        const pad = 0.2; // routes may run a little past the city box
        for (const [la, lo] of line) {
          expect(la).toBeGreaterThan(s - pad);
          expect(la).toBeLessThan(n + pad);
          expect(lo).toBeGreaterThan(w - pad);
          expect(lo).toBeLessThan(e + pad);
        }
      }
    }
  });

  it('route length roughly matches the distance between its stops', () => {
    for (const { data } of cities) {
      for (const r of data.routes) {
        if (r.stops.length < 3 || !r.shape) continue;
        const stops = new Map(data.stops.map((x) => [x.id, x]));
        let chain = 0;
        for (let i = 1; i < r.stops.length; i++) {
          const a = stops.get(r.stops[i - 1])!;
          const b = stops.get(r.stops[i])!;
          chain += haversine(a.lat, a.lon, b.lat, b.lon) / 1000;
        }
        const along = r.cum_km[r.cum_km.length - 1];
        expect(along, `${r.key}: ${along} km along a ${chain.toFixed(1)} km stop chain`).toBeLessThan(chain * 2.2 + 5);
        expect(along).toBeGreaterThan(chain * 0.6);
      }
    }
  });

  it('plans a journey along a real route in the biggest city', () => {
    const { data } = cities[0];
    const route = data.routes.find((r) => r.status === 'operational' && r.stops.length > 8 && !r.women_only)!;
    const stops = new Map(data.stops.map((s) => [s.id, s]));
    const from = stops.get(route.stops[1])!;
    const to = stops.get(route.stops[route.stops.length - 2])!;
    const results = new Planner(data).plan({ lat: from.lat, lon: from.lon }, { lat: to.lat, lon: to.lon });
    expect(results.length).toBeGreaterThan(0);
    const ride = results.find((r) => r.rides >= 1);
    expect(ride, `no ride found along ${route.key}`).toBeDefined();
    expect(ride!.totalMinutes).toBeGreaterThan(0);
  });

  it('publishes downloads', () => {
    const dir = path.join(ROOT, 'public', 'downloads');
    for (const f of ['pakistan-bus-routes.geojson', 'pakistan-bus-routes-gtfs.zip', 'stops.csv']) {
      expect(fs.existsSync(path.join(dir, f)), `${f} missing`).toBe(true);
      expect(fs.statSync(path.join(dir, f)).size).toBeGreaterThan(1000);
    }
  });
});
