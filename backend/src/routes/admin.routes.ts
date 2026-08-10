import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/users', asyncHandler(adminController.users));
router.get('/qrs', asyncHandler(adminController.qrs));
router.get('/scans', asyncHandler(adminController.scans));
router.get('/audit-logs', asyncHandler(adminController.auditLogs));

export default router;
