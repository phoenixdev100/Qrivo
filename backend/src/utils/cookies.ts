import type { CookieOptions, Response } from 'express';
import { env, isProd } from '../config/env.js';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '../config/constants.js';

const FIFTEEN_MIN = 15 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  const secure = env.COOKIE_SECURE || isProd;
  return {
    httpOnly: true,
    secure,
    // sameSite: 'none' requires secure: true
    sameSite: secure ? 'none' : 'lax',
    path: '/',
    ...(env.COOKIE_DOMAIN && { domain: env.COOKIE_DOMAIN }),
  };
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, { ...baseOptions(), maxAge: FIFTEEN_MIN });
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, { ...baseOptions(), maxAge: SEVEN_DAYS });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { ...baseOptions(), maxAge: 0 });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { ...baseOptions(), maxAge: 0 });
}
