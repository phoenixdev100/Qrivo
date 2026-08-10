import { Router } from 'express';
import { qrController } from '../controllers/qr.controller.js';
import { scanController } from '../controllers/scan.controller.js';
import { analyticsController } from '../controllers/analytics.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createQrLimiter } from '../middleware/rate-limit.middleware.js';
import { asyncHandler } from '../utils/async-handler.js';
import {
  createQrSchema,
  listQrQuerySchema,
  qrIdParamSchema,
  updateCustomizationSchema,
  updateDestinationSchema,
  updateQrSchema,
} from '../validators/qr.validator.js';

const router = Router();

router.use(requireAuth);

// Collection
router.post('/', createQrLimiter, validate({ body: createQrSchema }), asyncHandler(qrController.create));
router.get('/', validate({ query: listQrQuerySchema }), asyncHandler(qrController.list));

// Single resource
router.get('/:id', validate({ params: qrIdParamSchema }), asyncHandler(qrController.getOne));
router.patch('/:id', validate({ params: qrIdParamSchema, body: updateQrSchema }), asyncHandler(qrController.update));
router.delete('/:id', validate({ params: qrIdParamSchema }), asyncHandler(qrController.remove));

// Actions
router.post('/:id/duplicate', validate({ params: qrIdParamSchema }), asyncHandler(qrController.duplicate));
router.post('/:id/enable', validate({ params: qrIdParamSchema }), asyncHandler(qrController.enable));
router.post('/:id/disable', validate({ params: qrIdParamSchema }), asyncHandler(qrController.disable));

router.patch('/:id/destination', validate({ params: qrIdParamSchema, body: updateDestinationSchema }), asyncHandler(qrController.updateDestination));
router.patch('/:id/customization', validate({ params: qrIdParamSchema, body: updateCustomizationSchema }), asyncHandler(qrController.updateCustomization));

// Downloads
router.get('/:id/download/png', validate({ params: qrIdParamSchema }), asyncHandler(qrController.downloadPng));
router.get('/:id/download/svg', validate({ params: qrIdParamSchema }), asyncHandler(qrController.downloadSvg));

// Scans
router.get('/:id/scans', validate({ params: qrIdParamSchema }), asyncHandler(scanController.listScans));

// Analytics (per QR)
router.get('/:id/analytics', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.summary));
router.get('/:id/analytics/timeseries', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.timeseries));
router.get('/:id/analytics/devices', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.devices));
router.get('/:id/analytics/browsers', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.browsers));
router.get('/:id/analytics/os', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.operatingSystems));
router.get('/:id/analytics/countries', validate({ params: qrIdParamSchema }), asyncHandler(analyticsController.countries));

export default router;
