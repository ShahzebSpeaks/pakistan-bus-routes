/**
 * Trip planner for networks that have routes and stops but no timetables.
 *
 * This is a cost-based variant of RAPTOR (Round-bAsed Public Transit Optimized
 * Router): round k finds the best journeys that use exactly k rides. Pakistani
 * bus data rarely has schedules, so ride time is estimated from distance and a
 * typical speed per mode, and every boarding pays a waiting penalty of half the
 * headway. Routes are assumed to run in both directions along the same stops.
 */
import type { CityData, Mode, Route } from '../types';
import { estimateFare } from './fare';
import { GridIndex, haversine } from './geo';

export interface PlannerOptions {
  maxRides: number;
  maxWalkToStopM: number;
  maxTransferWalkM: number;
  walkSpeedMpm: number;
  includeNonOperational: boolean;
  womenOnlyAllowed: boolean;
}

export const DEFAULT_OPTIONS: PlannerOptions = {
  maxRides: 3,
  maxWalkToStopM: 1200,
  maxTransferWalkM: 450,
  walkSpeedMpm: 75,
  includeNonOperational: false,
  womenOnlyAllowed: false,
};

export const SPEED_KMH: Record<Mode, number> = {
  bus: 16,
  feeder: 16,
  electric_bus: 17,
  brt: 24,
  metro_rail: 34,
  intercity_bus: 55,
  rail: 45,
};

/** Long-distance services run far less often than city buses when no headway is published. */
const DEFAULT_HEADWAY_BY_MODE: Partial<Record<Mode, number>> = { intercity_bus: 90, rail: 240 };

/** Straight-line distance underestimates a real walk; this compensates. */
export const WALK_DETOUR = 1.3;
const TRANSFER_PENALTY_MIN = 4;
const DEFAULT_HEADWAY_MIN = 12;
const MAX_PURE_WALK_M = 2500;

export interface Point {
  lat: number;
  lon: number;
  stopId?: string;
}

export interface WalkLeg {
  kind: 'walk';
  from: Point;
  to: Point;
  metres: number;
  minutes: number;
}

export interface RideLeg {
  kind: 'ride';
  routeIndex: number;
  /** true when travelling against the listed stop order */
  reverse: boolean;
  stopIds: string[]; // boarding .. alighting, inclusive, in travel order
  km: number;
  minutes: number;
  waitMinutes: number;
  fare: number | null;
  fareExact: boolean;
  currency: string;
}

export type Leg = WalkLeg | RideLeg;

export interface Itinerary {
  legs: Leg[];
  totalMinutes: number;
  walkMetres: number;
  rides: number;
  fare: number | null;
  fareIsPartial: boolean;
  fareIsApprox: boolean;
  currency: string;
}

type Parent =
  | { type: 'access'; walkM: number }
  | { type: 'ride'; routeIndex: number; reverse: boolean; boardStop: number; boardPos: number; alightPos: number }
  | { type: 'transfer'; fromStop: number; walkM: number };

interface Label {
  cost: number;
  parent: Parent;
}

export class Planner {
  private stopIndex: Map<string, number>;
  private grid: GridIndex<CityData['stops'][number]>;
  /** per stop: [routeIndex, position in route] */
  private stopRoutes: [number, number][][];
  private transfers: { to: number; metres: number }[][];
  readonly opts: PlannerOptions;

  constructor(private data: CityData, opts: Partial<PlannerOptions> = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...opts };
    this.stopIndex = new Map(data.stops.map((s, i) => [s.id, i]));
    this.grid = new GridIndex(data.stops);
    this.stopRoutes = data.stops.map(() => []);
    data.routes.forEach((r, ri) => {
      if (!this.routeUsable(r)) return;
      r.stops.forEach((sid, pos) => {
        const si = this.stopIndex.get(sid);
        if (si !== undefined) this.stopRoutes[si].push([ri, pos]);
      });
    });
    this.transfers = data.stops.map((s, i) =>
      this.grid
        .near(s.lat, s.lon, this.opts.maxTransferWalkM)
        .filter((nb) => nb.index !== i)
        .map((nb) => ({ to: nb.index, metres: nb.dist * WALK_DETOUR })),
    );
  }

  private routeUsable(r: Route) {
    if (!this.opts.includeNonOperational && r.status !== 'operational' && r.status !== 'unverified') return false;
    if (r.women_only && !this.opts.womenOnlyAllowed) return false;
    // Only the two terminals of an unconfirmed route are known: we cannot say where it runs in between.
    if (r.stops.length === 2 && r.stops_confidence === 'low' && r.status !== 'operational') return false;
    return r.stops.length >= 2;
  }

  private walkMin(m: number) {
    return m / this.opts.walkSpeedMpm;
  }

  private waitMin(route: Route) {
    return (route.headway_min ?? DEFAULT_HEADWAY_BY_MODE[route.mode] ?? DEFAULT_HEADWAY_MIN) / 2;
  }

  plan(from: Point, to: Point): Itinerary[] {
    const n = this.data.stops.length;
    const R = this.opts.maxRides;
    const INF = Number.POSITIVE_INFINITY;
    const labels: (Label | undefined)[][] = Array.from({ length: R + 1 }, () => new Array(n));
    const bestEver = new Float64Array(n).fill(INF);

    const egress = new Map<number, number>();
    for (const e of this.grid.near(to.lat, to.lon, this.opts.maxWalkToStopM)) egress.set(e.index, e.dist * WALK_DETOUR);

    let marked = new Set<number>();
    for (const a of this.grid.near(from.lat, from.lon, this.opts.maxWalkToStopM)) {
      const walkM = a.dist * WALK_DETOUR;
      const cost = this.walkMin(walkM);
      labels[0][a.index] = { cost, parent: { type: 'access', walkM } };
      bestEver[a.index] = cost;
      marked.add(a.index);
    }

    for (let k = 1; k <= R && marked.size; k++) {
      // Each route is scanned once per direction, starting at the first marked stop in travel order.
      const queue = new Map<string, { ri: number; reverse: boolean; pos: number }>();
      for (const si of marked) {
        for (const [ri, pos] of this.stopRoutes[si]) {
          for (const reverse of [false, true]) {
            const key = `${ri}:${reverse ? 1 : 0}`;
            const q = queue.get(key);
            if (!q || (reverse ? pos > q.pos : pos < q.pos)) queue.set(key, { ri, reverse, pos });
          }
        }
      }

      const improved = new Set<number>();
      for (const { ri, reverse, pos } of queue.values()) {
        const route = this.data.routes[ri];
        const len = route.stops.length;
        const cum = route.cum_km;
        const boardPenalty = this.waitMin(route) + (k > 1 ? TRANSFER_PENALTY_MIN : 0);
        const minPerKm = 60 / SPEED_KMH[route.mode];
        // best = min over boarding positions j of (label(j) + penalty - along(j) * minPerKm)
        let best = INF;
        let boardStop = -1;
        let boardPos = -1;
        const step = reverse ? -1 : 1;
        for (let p = pos; p >= 0 && p < len; p += step) {
          const si = this.stopIndex.get(route.stops[p]);
          if (si === undefined) continue;
          const along = reverse ? cum[len - 1] - cum[p] : cum[p];
          if (boardStop >= 0) {
            const cost = best + along * minPerKm;
            if (cost < bestEver[si] - 1e-9) {
              bestEver[si] = cost;
              labels[k][si] = { cost, parent: { type: 'ride', routeIndex: ri, reverse, boardStop, boardPos, alightPos: p } };
              improved.add(si);
            }
          }
          const prev = labels[k - 1][si];
          if (prev) {
            const v = prev.cost + boardPenalty - along * minPerKm;
            if (v < best) {
              best = v;
              boardStop = si;
              boardPos = p;
            }
          }
        }
      }

      // Walking transfers from stops improved in this round.
      const next = new Set(improved);
      for (const si of improved) {
        const base = labels[k][si];
        if (!base || base.parent.type !== 'ride') continue;
        for (const t of this.transfers[si]) {
          const cost = base.cost + this.walkMin(t.metres);
          if (cost < bestEver[t.to] - 1e-9) {
            bestEver[t.to] = cost;
            labels[k][t.to] = { cost, parent: { type: 'transfer', fromStop: si, walkM: t.metres } };
            next.add(t.to);
          }
        }
      }
      marked = next;
    }

    const results: Itinerary[] = [];
    const directWalkM = haversine(from.lat, from.lon, to.lat, to.lon) * WALK_DETOUR;
    let bestFewerRides = directWalkM <= MAX_PURE_WALK_M ? this.walkMin(directWalkM) : INF;

    for (let k = 1; k <= R; k++) {
      let bestStop = -1;
      let bestCost = INF;
      for (const [si, walkM] of egress) {
        const l = labels[k][si];
        if (!l) continue;
        const c = l.cost + this.walkMin(walkM);
        if (c < bestCost) {
          bestCost = c;
          bestStop = si;
        }
      }
      if (bestStop < 0) continue;
      // An extra ride must save real time to be worth showing.
      const margin = k === 1 ? 0 : 5;
      if (bestCost >= bestFewerRides - margin) continue;
      const it = this.reconstruct(labels, k, bestStop, from, to, egress.get(bestStop)!);
      if (it) {
        results.push(it);
        bestFewerRides = bestCost;
      }
    }

    if (directWalkM <= MAX_PURE_WALK_M) {
      const minutes = this.walkMin(directWalkM);
      results.push({
        legs: [{ kind: 'walk', from, to, metres: directWalkM, minutes }],
        totalMinutes: minutes,
        walkMetres: directWalkM,
        rides: 0,
        fare: 0,
        fareIsPartial: false,
        fareIsApprox: false,
        currency: 'PKR',
      });
    }
    return results.sort((a, b) => a.totalMinutes - b.totalMinutes);
  }

  private reconstruct(
    labels: (Label | undefined)[][],
    k: number,
    stop: number,
    from: Point,
    to: Point,
    egressM: number,
  ): Itinerary | null {
    const stops = this.data.stops;
    const pt = (i: number): Point => ({ lat: stops[i].lat, lon: stops[i].lon, stopId: stops[i].id });
    const legs: Leg[] = [];
    let round = k;
    let si = stop;
    for (let guard = 0; guard < 64; guard++) {
      const l = labels[round][si];
      if (!l) return null;
      const p = l.parent;
      if (p.type === 'access') {
        legs.push({ kind: 'walk', from, to: pt(si), metres: p.walkM, minutes: this.walkMin(p.walkM) });
        break;
      }
      if (p.type === 'transfer') {
        legs.push({ kind: 'walk', from: pt(p.fromStop), to: pt(si), metres: p.walkM, minutes: this.walkMin(p.walkM) });
        si = p.fromStop;
        continue;
      }
      const route = this.data.routes[p.routeIndex];
      const lo = Math.min(p.boardPos, p.alightPos);
      const hi = Math.max(p.boardPos, p.alightPos);
      const km = route.cum_km[hi] - route.cum_km[lo];
      const ids = route.stops.slice(lo, hi + 1);
      if (p.reverse) ids.reverse();
      const fare = estimateFare(route.fare, km, hi - lo, route.cum_km[route.cum_km.length - 1]);
      legs.push({
        kind: 'ride',
        routeIndex: p.routeIndex,
        reverse: p.reverse,
        stopIds: ids,
        km,
        minutes: km * (60 / SPEED_KMH[route.mode]),
        waitMinutes: this.waitMin(route),
        fare: fare.amount,
        fareExact: fare.exact,
        currency: fare.currency,
      });
      si = p.boardStop;
      round -= 1;
    }
    if (round < 0) return null;
    legs.reverse();
    legs.push({ kind: 'walk', from: pt(stop), to, metres: egressM, minutes: this.walkMin(egressM) });

    const cleaned = legs.filter((l) => l.kind === 'ride' || l.metres >= 20);
    const rides = cleaned.filter((l): l is RideLeg => l.kind === 'ride');
    const walkMetres = cleaned.reduce((s, l) => s + (l.kind === 'walk' ? l.metres : 0), 0);
    const totalMinutes =
      cleaned.reduce((s, l) => s + l.minutes + (l.kind === 'ride' ? l.waitMinutes : 0), 0) +
      Math.max(0, rides.length - 1) * TRANSFER_PENALTY_MIN;
    const priced = rides.filter((r) => r.fare != null);
    return {
      legs: cleaned,
      totalMinutes,
      walkMetres,
      rides: rides.length,
      fare: priced.length ? priced.reduce((s, r) => s + (r.fare ?? 0), 0) : null,
      fareIsPartial: priced.length !== rides.length,
      fareIsApprox: rides.some((r) => r.fare != null && !r.fareExact),
      currency: rides[0]?.currency ?? 'PKR',
    };
  }
}
