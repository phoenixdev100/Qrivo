import type { CookieOptions, Response } from 'express';
import { env, isProd } from '../config/env.js';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../config/constants.js';

const FIFTEEN_MIN = 15 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.COOKIE_SECURE || isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...baseOptions(), maxAge: FIFTEEN_MIN });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...baseOptions(), maxAge: SEVEN_DAYS });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, baseOptions());
  res.clearCookie(REFRESH_TOKEN_COOKIE, baseOptions());
}
