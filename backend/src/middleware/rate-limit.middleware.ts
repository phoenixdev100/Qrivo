import rateLimit, { type Options } from 'express-rate-limit';
import { sendError } from '../utils/api-response.js';
import { isTest } from '../config/env.js';

// Factory producing a rate limiter with a consistent error envelope.
// Disabled during tests to keep suites fast and deterministic.
function createLimiter(windowMs: number, max: number, message: string) {
  const options: Partial<Options> = {
    windowMs,
    max: isTest ? 0 : max, // 0 = effectively unlimited path skips below
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => isTest,
    handler: (_req, res) => {
      sendError(res, 429, 'RATE_LIMITED', message);
    },
  };
  return rateLimit(options);
}

// Auth-sensitive endpoints (login, register, password reset).
export const authLimiter = createLimiter(
  15 * 60 * 1000,
  20,
  'Too many attempts. Please try again later.',
);

// QR creation.
export const createQrLimiter = createLimiter(
  60 * 1000,
  30,
  'You are creating QR codes too quickly. Please slow down.',
);

// General authenticated API surface.
export const apiLimiter = createLimiter(60 * 1000, 120, 'Too many requests. Please slow down.');

// Public scan resolution - generous, only to curb abusive bursts (never limits normal usage).
export const scanLimiter = createLimiter(60 * 1000, 300, 'Too many requests.');
