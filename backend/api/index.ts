import { createApp } from '../src/app.js';
import { prisma } from '../src/config/database.js';

// Create Express app
const app = createApp();

// Handle Vercel serverless function
export default async function handler(req: any, res: any) {
  // Ensure database connection is established
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('Failed to connect to database:', err);
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  }

  // Handle the request with Express app
  return app(req, res);
}
