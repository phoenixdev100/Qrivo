import express, { type Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import apiRouter from './routes/index.js';
import { scanController } from './controllers/scan.controller.js';
import { asyncHandler } from './utils/async-handler.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { scanLimiter } from './middleware/rate-limit.middleware.js';
import { timeoutMiddleware } from './middleware/timeout.middleware.js';
import { API_PREFIX, BODY_LIMIT, SCAN_PATH_PREFIX } from './config/constants.js';
import { env } from './config/env.js';

export function createApp(): Application {
  const app = express();

  // Behind a proxy/CDN in production - required for correct client IP + secure cookies.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // The scan landing/redirect is a plain API; CSP is managed by the frontend app.
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Additional security headers
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
    }),
  );

  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );

  // Apply timeout middleware before body parsing
  app.use(timeoutMiddleware);

  app.use(express.json({ limit: BODY_LIMIT }));
  app.use(express.urlencoded({ extended: true, limit: BODY_LIMIT }));
  app.use(cookieParser());

  // Public QR resolution (the hot scan path). Mounted at root: GET /q/:code
  app.get(`${SCAN_PATH_PREFIX}/:code`, scanLimiter, asyncHandler(scanController.resolve));

  // Versioned API
  app.use(API_PREFIX, apiRouter);

  // Root info
  app.get('/', (_req, res) => {
    res.json({ success: true, data: { name: 'Qrivo API', version: 'v1', docs: '/api/v1/health' } });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
