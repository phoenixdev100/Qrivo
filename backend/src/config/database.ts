import { PrismaClient } from '@prisma/client';
import { isProd } from './env.js';

// Reuse a single PrismaClient instance across hot-reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
    // Connection pooling for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

if (!isProd) {
  globalForPrisma.prisma = prisma;
}
