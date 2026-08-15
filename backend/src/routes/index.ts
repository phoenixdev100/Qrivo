import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import qrRoutes from './qr.routes.js';
import analyticsRoutes from './analytics.routes.js';
import folderRoutes from './folder.routes.js';
import adminRoutes from './admin.routes.js';
import { scanController } from '../controllers/scan.controller.js';
import { asyncHandler } from '../utils/async-handler.js';
import { apiLimiter, healthLimiter } from '../middleware/rate-limit.middleware.js';

// Mounted at /api/v1
const apiRouter = Router();

apiRouter.get('/health', healthLimiter, (_req, res) => {
  res.json({ success: true, data: { status: 'ok', time: new Date().toISOString() } });
});

apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', apiLimiter, userRoutes);
apiRouter.use('/qr', apiLimiter, qrRoutes);
apiRouter.use('/analytics', apiLimiter, analyticsRoutes);
apiRouter.use('/folders', apiLimiter, folderRoutes);
apiRouter.use('/admin', apiLimiter, adminRoutes);

// Public content for the scan landing page (no scan recorded, no auth).
apiRouter.get('/public/qr/:code', asyncHandler(scanController.publicContent));
// Public scan resolution for frontend (records scan, returns JSON).
apiRouter.get('/public/scan/:code', asyncHandler(scanController.resolveJson));

export default apiRouter;
