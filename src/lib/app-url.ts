/**
 * Single source of truth for app base URL (emails, redirects, etc.)
 * - Dev: localhost (or NEXT_PUBLIC_SITE_URL if set in .env.local)
 * - Prod: NEXT_PUBLIC_SITE_URL must be set; else Vercel URL if available
 */
function getAppBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
}

export const appBaseUrl = getAppBaseUrl();

export function appPath(path: string): string {
  const base = appBaseUrl.replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}
