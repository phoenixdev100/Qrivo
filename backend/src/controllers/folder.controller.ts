import type { Request, Response } from 'express';
import { folderService } from '../services/folder.service.js';
import { sendSuccess } from '../utils/api-response.js';

export const folderController = {
  async create(req: Request, res: Response) {
    const folder = await folderService.create(req.user!.id, req.body.name);
    return sendSuccess(res, { folder }, 201);
  },

  async list(req: Request, res: Response) {
    const folders = await folderService.list(req.user!.id);
    return sendSuccess(res, { folders });
  },

  async getOne(req: Request, res: Response) {
    const folder = await folderService.get(req.user!.id, req.params.id);
    return sendSuccess(res, { folder });
  },

  async update(req: Request, res: Response) {
    const folder = await folderService.update(req.user!.id, req.params.id, req.body.name);
    return sendSuccess(res, { folder });
  },

  async remove(req: Request, res: Response) {
    const result = await folderService.remove(req.user!.id, req.params.id);
    return sendSuccess(res, result);
  },
};
