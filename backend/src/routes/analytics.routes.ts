import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth);

// Account-wide analytics overview (per-QR analytics live under /qr/:id/analytics).
router.get('/overview', asyncHandler(analyticsController.overview));

export default router;
