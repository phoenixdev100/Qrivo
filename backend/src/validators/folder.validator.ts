import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, 'Folder name is required').max(80),
});

export const updateFolderSchema = z.object({
  name: z.string().trim().min(1, 'Folder name is required').max(80),
});

export const folderIdParamSchema = z.object({
  id: z.string().cuid('Invalid id'),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
