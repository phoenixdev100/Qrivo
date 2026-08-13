import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/database.js';
import { logger } from './utils/logger.js';

async function main(): Promise<void> {
  // Verify the database connection early so misconfiguration fails fast.
  try {
    await prisma.$connect();
    logger.info('Connected to database');
  } catch (err) {
    logger.error('Failed to connect to database', {
      message: err instanceof Error ? err.message : String(err),
    });
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`Qrivo API listening on http://localhost:${env.PORT}`, {
      env: env.NODE_ENV,
    });
  });

  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully`);
    server.close(() => logger.info('HTTP server closed'));
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main();
