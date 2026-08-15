import type { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/api-response.js';

const REQUEST_TIMEOUT_MS = 30000; // 30 seconds

export function timeoutMiddleware(_req: Request, res: Response, next: NextFunction): void {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      sendError(res, 408, 'REQUEST_TIMEOUT', 'Request timeout');
    }
  }, REQUEST_TIMEOUT_MS);

  // Clear timeout when response finishes
  res.on('finish', () => {
    clearTimeout(timeout);
  });

  // Clear timeout on error
  res.on('close', () => {
    clearTimeout(timeout);
  });

  next();
}
