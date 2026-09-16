import type { Route } from '../types';

/** Picks black or white text for readable contrast on the route colour. */
function textOn(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return lum > 0.6 ? '#111' : '#fff';
}

export function RouteBadge({ route }: { route: Route }) {
  return (
    <span className="route-badge" style={{ background: route.color, color: textOn(route.color) }} title={route.name}>
      {route.id}
    </span>
  );
}
