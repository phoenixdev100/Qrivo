import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { setAuthCookies, clearAuthCookies } from '../utils/cookies.js';
import { REFRESH_TOKEN_COOKIE } from '../config/constants.js';
import { ApiError } from '../utils/api-error.js';

export const authController = {
  async register(req: Request, res: Response) {
    const { user, tokens } = await authService.register(req.body);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return sendSuccess(res, { user, accessToken: tokens.accessToken }, 201);
  },

  async login(req: Request, res: Response) {
    const { user, tokens } = await authService.login(req.body);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return sendSuccess(res, { user, accessToken: tokens.accessToken });
  },

  async logout(_req: Request, res: Response) {
    clearAuthCookies(res);
    return sendSuccess(res, { message: 'Logged out' });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;
    console.log('Refresh request cookies:', req.cookies);
    console.log('Refresh token found:', !!token);
    if (!token) throw ApiError.unauthorized('No refresh token');
    const tokens = await authService.refresh(token);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    return sendSuccess(res, { accessToken: tokens.accessToken });
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    return sendSuccess(res, { user });
  },

  // Password reset is stubbed to avoid an email provider dependency in this build.
  // The endpoints validate input and respond generically (no user enumeration).
  async forgotPassword(_req: Request, res: Response) {
    return sendSuccess(res, {
      message: 'If an account exists for that email, reset instructions have been sent.',
    });
  },

  async resetPassword(_req: Request, _res: Response) {
    throw ApiError.badRequest('Password reset is not enabled in this deployment');
  },
};
