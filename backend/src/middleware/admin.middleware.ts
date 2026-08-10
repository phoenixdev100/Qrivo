import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/api-error.js';

// Requires an authenticated ADMIN user. Must run after requireAuth.
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  if (!req.user) {
    next(ApiError.unauthorized());
    return;
  }
  if (req.user.role !== 'ADMIN') {
    next(ApiError.forbidden('Administrator access required'));
    return;
  }
  next();
}
