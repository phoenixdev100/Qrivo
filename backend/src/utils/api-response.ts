import type { Response } from 'express';
import type { ErrorCode } from './api-error.js';

// Consistent envelope for all API responses.

export interface SuccessBody<T> {
  success: true;
  data: T;
}

export interface ErrorBody {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    details?: unknown;
  };
}

export function sendSuccess<T>(res: Response, data: T, status = 200): Response {
  const body: SuccessBody<T> = { success: true, data };
  return res.status(status).json(body);
}

export function sendError(
  res: Response,
  status: number,
  code: ErrorCode | string,
  message: string,
  details?: unknown,
): Response {
  const body: ErrorBody = { success: false, error: { code, message, details } };
  return res.status(status).json(body);
}
