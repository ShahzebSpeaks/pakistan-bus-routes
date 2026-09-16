/** Shapes of the compiled per-city JSON produced by scripts/build-data.mjs. */

export type Mode = 'bus' | 'brt' | 'metro_rail' | 'feeder' | 'electric_bus';
export type RouteStatus = 'operational' | 'under_construction' | 'planned' | 'suspended' | 'unverified';

export interface FareSlab {
  up_to_km: number | null;
  fare: number;
}

export interface FareRules {
  type: 'flat' | 'distance_slab' | 'stop_count' | 'range' | 'unknown';
  /** for type "range": cheapest and full-route fare when the slab table is not published */
  min?: number | null;
  max?: number | null;
  currency: string;
  flat?: number | null;
  slabs?: FareSlab[];
  concessions?: string;
  as_of?: string;
  source_url?: string;
}

export interface Source {
  title: string;
  url: string;
  publisher?: string;
  date?: string;
  official?: boolean;
}

export interface CitySummary {
  id: string;
  name: string;
  name_ur: string;
  province: string;
  center: [number, number];
  zoom: number;
  bbox: [number, number, number, number];
  systems: number;
  routes: number;
  operational_routes: number;
  stops: number;
}

export interface DatasetIndex {
  generated_at: string;
  version: string;
  cities: CitySummary[];
  totals: { cities: number; systems: number; routes: number; stops: number };
}

export interface SystemInfo {
  id: string;
  name: string;
  name_ur: string;
  operator: string;
  mode: Mode;
  website: string | null;
  helpline: string | null;
  payment: string | null;
  fare_rules: FareRules;
  hours: { start: string | null; end: string | null; notes?: string } | null;
  last_verified?: string | null;
  sources: Source[];
}

export type CoordQuality = 'exact' | 'matched' | 'geocoded' | 'estimated' | 'missing';

export interface Stop {
  id: string;
  name: string;
  name_ur: string;
  lat: number;
  lon: number;
  quality: CoordQuality;
  is_station: boolean;
  /** indexes into CityData.routes */
  routes: number[];
}

export interface Route {
  key: string; // `${system}:${id}`
  id: string;
  system: string;
  name: string;
  name_ur: string;
  mode: Mode;
  variant: string;
  color: string;
  status: RouteStatus;
  length_km: number | null;
  headway_min: number | null;
  hours: { start: string | null; end: string | null } | null;
  fare: FareRules;
  women_only: boolean;
  launched: string | null;
  stops: string[]; // stop ids, one direction
  /** cumulative km along the route for each stop */
  cum_km: number[];
  /** Google encoded polyline (precision 5) */
  shape: string;
  shape_source: 'osrm' | 'osm' | 'straight';
  stops_confidence: 'high' | 'medium' | 'low';
  sources: Source[];
  notes: string;
}

export interface CityData {
  city: CitySummary;
  generated_at: string;
  systems: SystemInfo[];
  routes: Route[];
  stops: Stop[];
}
