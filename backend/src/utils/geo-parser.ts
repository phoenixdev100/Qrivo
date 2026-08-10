import type { Request } from 'express';

export interface GeoInfo {
  country?: string;
  region?: string;
  city?: string;
}

// Extracts approximate geo info from proxy/CDN headers when available.
// We do NOT perform IP geolocation lookups here; we only read headers that a
// deployment platform (e.g. Vercel, Cloudflare) may provide. Location is always
// treated as approximate.
export function parseGeo(req: Request): GeoInfo {
  const header = (name: string): string | undefined => {
    const value = req.headers[name.toLowerCase()];
    if (Array.isArray(value)) return value[0];
    return value ?? undefined;
  };

  const country = header('x-vercel-ip-country') ?? header('cf-ipcountry');
  const region = header('x-vercel-ip-country-region');
  const cityRaw = header('x-vercel-ip-city');
  const city = cityRaw ? decodeURIComponent(cityRaw) : undefined;

  return {
    country: country || undefined,
    region: region || undefined,
    city: city || undefined,
  };
}

// Best-effort client IP extraction (used only to compute a privacy-safe hash).
export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0];
  }
  return req.socket.remoteAddress ?? 'unknown';
}
