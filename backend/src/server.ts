import { createApp } from './app.js';
import { env, isDev } from './config/env.js';
import { prisma } from './config/database.js';

async function main(): Promise<void> {
  // Verify the database connection early so misconfiguration fails fast.
  try {
    await prisma.$connect();
    if (isDev) {
      console.log('✅ Connected to database');
    }
  } catch (err) {
    console.error('❌ Failed to connect to database:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    if (isDev) {
      console.log(`🚀 Qrivo API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    }
  });

  const shutdown = async (signal: string): Promise<void> => {
    if (isDev) {
      console.log(`👋 Received ${signal}, shutting down gracefully`);
    }
    server.close(() => {
      if (isDev) {
        console.log('✅ HTTP server closed');
      }
    });
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main();
