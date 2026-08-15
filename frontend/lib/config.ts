// Centralized runtime configuration sourced from public env vars.
// Never hardcode API URLs elsewhere - import from here.

export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
} as const;

export function trackingUrl(code: string): string {
  return `${config.siteUrl}/q/${code}`;
}
