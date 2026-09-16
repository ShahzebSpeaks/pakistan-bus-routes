/** Public repository URL. Set VITE_REPO_URL at build time (CI does this automatically). */
export const REPO_URL: string = import.meta.env.VITE_REPO_URL || 'https://github.com/OWNER/pakistan-bus-routes';

export const TILE_URL: string = import.meta.env.VITE_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors';

/** Build a URL inside the deployed base path (GitHub Pages serves under /<repo>/). */
export const asset = (p: string) => `${import.meta.env.BASE_URL}${p.replace(/^\//, '')}`;

export function issueUrl(title: string, body: string, labels = 'data') {
  const q = new URLSearchParams({ title, body, labels });
  return `${REPO_URL}/issues/new?${q.toString()}`;
}
