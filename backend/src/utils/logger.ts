import { isTest, isProd } from '../config/env.js';

// Minimal structured logger. Avoids leaking sensitive internals in production output.

type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, message: string, meta?: Record<string, unknown>): void {
  // Only log errors in production, everything in development, nothing in tests
  if (isTest) return; // keep test output clean
  if (isProd && level !== 'error') return; // only log errors in production

  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    ...(meta ? { meta } : {}),
  };
  const line = JSON.stringify(entry);
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => log('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => log('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => log('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => log('debug', message, meta),
};
