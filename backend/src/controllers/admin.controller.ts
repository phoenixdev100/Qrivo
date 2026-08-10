import type { Request, Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { sendSuccess } from '../utils/api-response.js';

function pagination(req: Request) {
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const pageSize = Math.min(Math.max(Number(req.query.pageSize ?? 20), 1), 100);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize, search };
}

function envelope(items: unknown[], total: number, page: number, pageSize: number) {
  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) || 1 };
}

export const adminController = {
  async users(req: Request, res: Response) {
    const { page, pageSize, skip, take, search } = pagination(req);
    const { items, total } = await adminService.listUsers({ skip, take, search });
    return sendSuccess(res, envelope(items, total, page, pageSize));
  },

  async qrs(req: Request, res: Response) {
    const { page, pageSize, skip, take, search } = pagination(req);
    const { items, total } = await adminService.listQrs({ skip, take, search });
    return sendSuccess(res, envelope(items, total, page, pageSize));
  },

  async scans(req: Request, res: Response) {
    const { page, pageSize, skip, take } = pagination(req);
    const { items, total } = await adminService.listScans({ skip, take });
    return sendSuccess(res, envelope(items, total, page, pageSize));
  },

  async auditLogs(req: Request, res: Response) {
    const { page, pageSize, skip, take } = pagination(req);
    const { items, total } = await adminService.listAuditLogs({ skip, take });
    return sendSuccess(res, envelope(items, total, page, pageSize));
  },
};
