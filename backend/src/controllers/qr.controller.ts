import type { Request, Response } from 'express';
import { qrService, buildTrackingUrl } from '../services/qr.service.js';
import { generatePng, generateSvg, toRenderOptions } from '../services/qr-generator.service.js';
import { sendSuccess } from '../utils/api-response.js';
import { ApiError } from '../utils/api-error.js';

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'qr-code';
}

export const qrController = {
  async create(req: Request, res: Response) {
    const qr = await qrService.create(req.user!.id, req.body);
    return sendSuccess(res, { qr }, 201);
  },

  async list(req: Request, res: Response) {
    const { page, pageSize, search, folderId, status } = req.query as unknown as {
      page: number;
      pageSize: number;
      search?: string;
      folderId?: string;
      status?: 'ACTIVE' | 'DISABLED' | 'EXPIRED' | 'DELETED';
    };
    const result = await qrService.list(req.user!.id, { page, pageSize, search, folderId, status });
    return sendSuccess(res, result);
  },

  async getOne(req: Request, res: Response) {
    const qr = await qrService.getById(req.user!.id, req.params.id);
    return sendSuccess(res, { qr });
  },

  async update(req: Request, res: Response) {
    const qr = await qrService.update(req.user!.id, req.params.id, req.body);
    return sendSuccess(res, { qr });
  },

  async remove(req: Request, res: Response) {
    const result = await qrService.remove(req.user!.id, req.params.id);
    return sendSuccess(res, result);
  },

  async duplicate(req: Request, res: Response) {
    const qr = await qrService.duplicate(req.user!.id, req.params.id);
    return sendSuccess(res, { qr }, 201);
  },

  async enable(req: Request, res: Response) {
    const qr = await qrService.setStatus(req.user!.id, req.params.id, 'ACTIVE');
    return sendSuccess(res, { qr });
  },

  async disable(req: Request, res: Response) {
    const qr = await qrService.setStatus(req.user!.id, req.params.id, 'DISABLED');
    return sendSuccess(res, { qr });
  },

  async updateDestination(req: Request, res: Response) {
    const qr = await qrService.updateDestination(req.user!.id, req.params.id, req.body.content);
    return sendSuccess(res, { qr });
  },

  async updateCustomization(req: Request, res: Response) {
    const qr = await qrService.updateCustomization(req.user!.id, req.params.id, req.body);
    return sendSuccess(res, { qr });
  },

  async downloadPng(req: Request, res: Response) {
    const qr = await qrService.getById(req.user!.id, req.params.id);
    if (!qr) throw ApiError.notFound('QR code not found');
    const payload = buildTrackingUrl(qr.code);
    const png = await generatePng(payload, toRenderOptions(qr.customization));
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${slugify(qr.name)}.png"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(png);
  },

  async downloadSvg(req: Request, res: Response) {
    const qr = await qrService.getById(req.user!.id, req.params.id);
    if (!qr) throw ApiError.notFound('QR code not found');
    const payload = buildTrackingUrl(qr.code);
    const svg = await generateSvg(payload, toRenderOptions(qr.customization));
    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Content-Disposition', `attachment; filename="${slugify(qr.name)}.svg"`);
    res.setHeader('Cache-Control', 'no-store');
    return res.send(svg);
  },
};
