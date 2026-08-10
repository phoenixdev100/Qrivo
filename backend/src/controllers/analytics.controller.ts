import type { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { qrService } from '../services/qr.service.js';
import { sendSuccess } from '../utils/api-response.js';

// Ensures the requesting user owns the QR before returning any analytics.
async function assertOwnership(req: Request): Promise<string> {
  await qrService.getById(req.user!.id, req.params.id);
  return req.params.id;
}

export const analyticsController = {
  async summary(req: Request, res: Response) {
    const id = await assertOwnership(req);
    return sendSuccess(res, await analyticsService.qrSummary(id));
  },

  async timeseries(req: Request, res: Response) {
    const id = await assertOwnership(req);
    const days = Math.min(Math.max(Number(req.query.days ?? 30), 1), 365);
    return sendSuccess(res, await analyticsService.timeseries(id, days));
  },

  async devices(req: Request, res: Response) {
    const id = await assertOwnership(req);
    return sendSuccess(res, await analyticsService.devices(id));
  },

  async browsers(req: Request, res: Response) {
    const id = await assertOwnership(req);
    return sendSuccess(res, await analyticsService.browsers(id));
  },

  async operatingSystems(req: Request, res: Response) {
    const id = await assertOwnership(req);
    return sendSuccess(res, await analyticsService.operatingSystems(id));
  },

  async countries(req: Request, res: Response) {
    const id = await assertOwnership(req);
    return sendSuccess(res, await analyticsService.countries(id));
  },

  async overview(req: Request, res: Response) {
    return sendSuccess(res, await analyticsService.overview(req.user!.id));
  },
};
