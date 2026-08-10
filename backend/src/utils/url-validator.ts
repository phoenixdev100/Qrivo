import { ALLOWED_URL_PROTOCOLS } from '../config/constants.js';

// Validates that a URL is safe to redirect to. Blocks javascript:, data:, and
// any non-http(s) protocol to prevent XSS / open-redirect abuse via QR codes.
export function isSafeRedirectUrl(input: string): boolean {
  if (typeof input !== 'string' || input.trim().length === 0) return false;

  let parsed: URL;
  try {
    parsed = new URL(input.trim());
  } catch {
    return false;
  }

  if (!ALLOWED_URL_PROTOCOLS.includes(parsed.protocol as (typeof ALLOWED_URL_PROTOCOLS)[number])) {
    return false;
  }

  // Must have a host for http(s).
  if (!parsed.hostname) return false;

  return true;
}

export function normalizeUrl(input: string): string {
  return new URL(input.trim()).toString();
}
