import type { Request, Response } from 'express';
import { userService } from '../services/user.service.js';
import { authService } from '../services/auth.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { clearAuthCookies } from '../utils/cookies.js';

export const userController = {
  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.id);
    return sendSuccess(res, { user });
  },

  async updateProfile(req: Request, res: Response) {
    const user = await userService.updateProfile(req.user!.id, req.body);
    return sendSuccess(res, { user });
  },

  async changePassword(req: Request, res: Response) {
    await userService.changePassword(
      req.user!.id,
      req.body.currentPassword,
      req.body.newPassword,
    );
    return sendSuccess(res, { message: 'Password updated' });
  },

  async deleteAccount(req: Request, res: Response) {
    await userService.deleteAccount(req.user!.id);
    clearAuthCookies(res);
    return sendSuccess(res, { message: 'Account deleted' });
  },
};
