import type { FareRules } from '../types';

export interface FareResult {
  amount: number | null;
  currency: string;
  exact: boolean;
}

/** Estimate a single-ride fare for a leg of `km` kilometres covering `stopCount` stop-to-stop hops. */
export function estimateFare(rules: FareRules | undefined, km: number, stopCount: number, routeKm = 0): FareResult {
  const currency = rules?.currency || 'PKR';
  if (!rules) return { amount: null, currency, exact: false };
  switch (rules.type) {
    case 'flat':
      return { amount: rules.flat ?? null, currency, exact: rules.flat != null };
    case 'distance_slab':
    case 'stop_count': {
      const slabs = [...(rules.slabs ?? [])].sort(
        (a, b) => (a.up_to_km ?? Number.POSITIVE_INFINITY) - (b.up_to_km ?? Number.POSITIVE_INFINITY),
      );
      if (!slabs.length) return { amount: rules.flat ?? null, currency, exact: false };
      const measure = rules.type === 'stop_count' ? stopCount : km;
      const slab = slabs.find((s) => s.up_to_km == null || measure <= s.up_to_km) ?? slabs[slabs.length - 1];
      return { amount: slab.fare, currency, exact: true };
    }
    case 'range': {
      if (rules.min == null || rules.max == null) return { amount: null, currency, exact: false };
      // Scale between the minimum and the full-route fare, rounded to Rs 5.
      const share = routeKm > 0 ? Math.min(1, km / routeKm) : 1;
      const amount = Math.round((rules.min + (rules.max - rules.min) * share) / 5) * 5;
      return { amount: Math.max(rules.min, Math.min(rules.max, amount)), currency, exact: false };
    }
    default:
      return { amount: rules.flat ?? null, currency, exact: false };
  }
}
