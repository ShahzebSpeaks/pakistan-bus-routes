import { describe, expect, it } from 'vitest';
import { decodePolyline, encodePolyline, GridIndex, haversine } from '../src/lib/geo';
import { estimateFare } from '../src/lib/fare';
import { Planner } from '../src/lib/planner';
import type { CityData, Route, Stop } from '../src/types';

/**
 * Synthetic city on a grid near Karachi. 0.01 deg lat ~ 1.11 km.
 *
 *   Route A (bus, west-east) along lat 24.90: A0 A1 A2 A3 A4
 *   Route B (brt, south-north) along lon 67.03: B0 B1 B2(=A3 nearby) B3 B4
 */
function stop(id: string, lat: number, lon: number): Stop {
  return { id, name: id, name_ur: '', lat, lon, quality: 'exact', is_station: false, routes: [] };
}

function route(id: string, mode: Route['mode'], stops: Stop[], fare: Route['fare']): Route {
  const cum = [0];
  for (let i = 1; i < stops.length; i++) {
    cum.push(cum[i - 1] + haversine(stops[i - 1].lat, stops[i - 1].lon, stops[i].lat, stops[i].lon) / 1000);
  }
  return {
    key: `t:${id}`, id, system: 't', name: id, name_ur: '', mode, variant: 'regular', color: '#000',
    status: 'operational', length_km: null, headway_min: 10, hours: null, fare, women_only: false,
    launched: null, stops: stops.map((s) => s.id), cum_km: cum, shape: '', shape_source: 'straight',
    stops_confidence: 'high', sources: [], notes: '',
  };
}

const A = [0, 1, 2, 3, 4].map((i) => stop(`A${i}`, 24.9, 67.0 + i * 0.01));
const B = [0, 1, 2, 3, 4].map((i) => stop(`B${i}`, 24.88 + i * 0.01, 67.0302));
const flat = { type: 'flat' as const, currency: 'PKR', flat: 50 };
const slab = { type: 'distance_slab' as const, currency: 'PKR', slabs: [{ up_to_km: 15, fare: 80 }, { up_to_km: null, fare: 120 }] };

const city: CityData = {
  city: { id: 't', name: 'T', name_ur: '', province: '', center: [24.9, 67.02], zoom: 12, bbox: [24.8, 66.9, 25, 67.1], systems: 1, routes: 2, operational_routes: 2, stops: 10 },
  generated_at: '',
  systems: [],
  routes: [route('A', 'bus', A, slab), route('B', 'brt', B, flat)],
  stops: [...A, ...B],
};

describe('geo', () => {
  it('haversine ~ 1.11 km per 0.01 deg latitude', () => {
    expect(haversine(24.9, 67, 24.91, 67)).toBeGreaterThan(1100);
    expect(haversine(24.9, 67, 24.91, 67)).toBeLessThan(1120);
  });

  it('polyline round-trips', () => {
    const pts: [number, number][] = [[24.86071, 67.00114], [24.9, 67.1], [25.0001, 66.99999]];
    const back = decodePolyline(encodePolyline(pts));
    back.forEach((p, i) => {
      expect(p[0]).toBeCloseTo(pts[i][0], 5);
      expect(p[1]).toBeCloseTo(pts[i][1], 5);
    });
  });

  it('grid index finds nearby items sorted', () => {
    const g = new GridIndex(city.stops);
    const res = g.near(24.9, 67.0, 1200);
    expect(res[0].item.id).toBe('A0');
    expect(res.map((r) => r.item.id)).toContain('A1');
    expect(res.map((r) => r.item.id)).not.toContain('A3');
  });
});

describe('fare', () => {
  it('flat and slab fares', () => {
    expect(estimateFare(flat, 30, 5).amount).toBe(50);
    expect(estimateFare(slab, 10, 5).amount).toBe(80);
    expect(estimateFare(slab, 16, 5).amount).toBe(120);
    expect(estimateFare(undefined, 1, 1).amount).toBeNull();
  });

  it('range fares scale with distance and are marked approximate', () => {
    const range = { type: 'range' as const, currency: 'PKR', min: 15, max: 55 };
    expect(estimateFare(range, 0.5, 1, 20)).toEqual({ amount: 15, currency: 'PKR', exact: false });
    expect(estimateFare(range, 20, 20, 20).amount).toBe(55);
    expect(estimateFare(range, 10, 10, 20).amount).toBe(35);
  });
});

describe('planner', () => {
  const planner = new Planner(city);

  it('finds a direct ride along one route', () => {
    const res = planner.plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 });
    const ride = res.find((r) => r.rides === 1);
    expect(ride).toBeDefined();
    const legs = ride!.legs.filter((l) => l.kind === 'ride');
    expect(legs).toHaveLength(1);
    if (legs[0].kind === 'ride') {
      expect(legs[0].stopIds[0]).toBe('A0');
      expect(legs[0].stopIds.at(-1)).toBe('A4');
      expect(legs[0].fare).toBe(80);
    }
  });

  it('rides against listed stop order (reverse direction)', () => {
    const res = planner.plan({ lat: 24.9, lon: 67.04 }, { lat: 24.9, lon: 67.0 });
    const ride = res.find((r) => r.rides === 1)!;
    const leg = ride.legs.find((l) => l.kind === 'ride');
    expect(leg && leg.kind === 'ride' && leg.reverse).toBe(true);
    expect(leg && leg.kind === 'ride' && leg.stopIds[0]).toBe('A4');
  });

  it('transfers between routes at nearby stops', () => {
    // start at A0, finish near B4 (north end of route B)
    const res = planner.plan({ lat: 24.9, lon: 67.0 }, { lat: 24.92, lon: 67.0302 });
    const two = res.find((r) => r.rides === 2);
    expect(two).toBeDefined();
    const rides = two!.legs.filter((l) => l.kind === 'ride');
    expect(rides.map((r) => (r.kind === 'ride' ? city.routes[r.routeIndex].id : ''))).toEqual(['A', 'B']);
    expect(two!.fare).toBe(130);
  });

  it('offers walking for short trips and nothing for unreachable ones', () => {
    const near = planner.plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.005 });
    expect(near.some((r) => r.rides === 0)).toBe(true);
    const far = planner.plan({ lat: 25.5, lon: 67.5 }, { lat: 25.6, lon: 67.6 });
    expect(far).toHaveLength(0);
  });

  it('skips women-only routes unless allowed', () => {
    const pink = { ...city, routes: city.routes.map((r) => ({ ...r, women_only: true })) };
    expect(new Planner(pink).plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 }).filter((r) => r.rides > 0)).toHaveLength(0);
    expect(new Planner(pink, { womenOnlyAllowed: true }).plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 }).filter((r) => r.rides > 0).length).toBeGreaterThan(0);
  });

  it('rides timetabled routes (trains) only in their listed direction', () => {
    const train = { ...route('T', 'rail', A, flat), stop_times: ['07:00', '07:10', '07:20', '07:30', '07:40'] };
    const oneWay = { ...city, routes: [train] };
    const forward = new Planner(oneWay).plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 });
    expect(forward.some((r) => r.rides === 1)).toBe(true);
    const back = new Planner(oneWay).plan({ lat: 24.9, lon: 67.04 }, { lat: 24.9, lon: 67.0 });
    expect(back.filter((r) => r.rides > 0)).toHaveLength(0);
  });

  it('lets intercity trips start and end several km from a terminal', () => {
    const far = { lat: 24.9, lon: 67.07 }; // ~3 km east of A4
    expect(planner.plan({ lat: 24.9, lon: 67.0 }, far).filter((r) => r.rides > 0)).toHaveLength(0);
    const intercity = { ...city, city: { ...city.city, id: 'intercity' } };
    expect(new Planner(intercity).plan({ lat: 24.9, lon: 67.0 }, far).filter((r) => r.rides > 0).length).toBeGreaterThan(0);
  });

  it('ignores unconfirmed routes where only the two terminals are known', () => {
    const ends = route('ENDS', 'bus', [A[0], A[4]], flat);
    const onlyEnds = { ...city, routes: [{ ...ends, status: 'unverified' as const, stops_confidence: 'low' as const }] };
    expect(new Planner(onlyEnds).plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 }).filter((r) => r.rides > 0)).toHaveLength(0);
    const confirmed = { ...city, routes: [{ ...ends, status: 'operational' as const, stops_confidence: 'low' as const }] };
    expect(new Planner(confirmed).plan({ lat: 24.9, lon: 67.0 }, { lat: 24.9, lon: 67.04 }).filter((r) => r.rides > 0).length).toBeGreaterThan(0);
  });
});
