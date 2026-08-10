import type { Request, Response } from 'express';
import { scanService } from '../services/scan.service.js';
import { qrService } from '../services/qr.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { getClientIp, parseGeo } from '../utils/geo-parser.js';
import { env } from '../config/env.js';

function frontendQrUrl(code: string, state?: string): string {
  const base = `${env.FRONTEND_URL}/qr/${encodeURIComponent(code)}`;
  return state ? `${base}?state=${state}` : base;
}

export const scanController = {
  // Public: GET /q/:code - the hot path. Records the scan then resolves.
  async resolve(req: Request, res: Response) {
    const { code } = req.params;
    const result = await scanService.resolveAndRecord(code, {
      ip: getClientIp(req),
      userAgent: req.headers['user-agent'],
      geo: parseGeo(req),
    });

    if (result.state === 'ok' && result.type === 'URL' && result.redirectUrl) {
      return res.redirect(302, result.redirectUrl);
    }
    if (result.state === 'ok') {
      // Non-URL content is rendered by the frontend scan landing page.
      return res.redirect(302, frontendQrUrl(code));
    }
    // not_found | disabled | expired → let the frontend show a friendly state.
    return res.redirect(302, frontendQrUrl(code, result.state));
  },

  // Public: GET /api/v1/public/qr/:code - content for the landing page (no scan recorded).
  async publicContent(req: Request, res: Response) {
    const data = await scanService.getPublicContent(req.params.code);
    return sendSuccess(res, data);
  },

  // Authenticated: GET /api/v1/qr/:id/scans
  async listScans(req: Request, res: Response) {
    await qrService.getById(req.user!.id, req.params.id); // ownership check
    const page = Number(req.query.page ?? 1);
    const pageSize = Math.min(Number(req.query.pageSize ?? 20), 100);
    const [items, total] = await scanService.listScans(req.params.id, page, pageSize);
    return sendSuccess(res, {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    });
  },
};
