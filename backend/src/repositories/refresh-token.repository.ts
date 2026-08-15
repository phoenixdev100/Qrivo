import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const refreshTokenRepository = {
  findByToken(token: string) {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  create(data: Prisma.RefreshTokenCreateInput) {
    return prisma.refreshToken.create({ data });
  },

  revoke(token: string) {
    return prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  },

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  },

  deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },

  deleteRevoked() {
    return prisma.refreshToken.deleteMany({
      where: { revoked: true },
    });
  },
};
