// Application-wide constants.

export const API_PREFIX = '/api/v1';

// Public QR resolution path: {PUBLIC_BASE_URL}/q/{code}
export const SCAN_PATH_PREFIX = '/q';

// Length of the generated short code embedded in tracking URLs.
export const QR_CODE_LENGTH = 8;

// Unambiguous alphabet (no 0/O/1/I/l) for human-friendly, scannable codes.
export const QR_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

// Auth cookie names.
export const ACCESS_TOKEN_COOKIE = 'freeqr_access';
export const REFRESH_TOKEN_COOKIE = 'freeqr_refresh';

// Window (in ms) used to approximate a unique visitor (same visitorHash within window = same visit).
export const UNIQUE_VISITOR_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

// Request body size limit.
export const BODY_LIMIT = '256kb';

// Allowed URL protocols for redirect-type QR codes.
export const ALLOWED_URL_PROTOCOLS = ['http:', 'https:'] as const;
