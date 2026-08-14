import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';

// Create Express app
const app = createApp();

// Ensure database connection is established before handling requests
let dbConnected = false;

async function ensureDbConnection() {
  if (!dbConnected) {
    try {
      await prisma.$connect();
      dbConnected = true;
    } catch (err) {
      console.error('Failed to connect to database:', err);
      throw err;
    }
  }
}

// Handle Vercel serverless function
export default async function handler(req: any, res: any) {
  try {
    await ensureDbConnection();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  }

  // Handle the request with Express app
  return app(req, res);
}
