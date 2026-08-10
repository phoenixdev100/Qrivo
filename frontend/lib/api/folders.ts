import { api } from './client';
import type { Folder } from '@/types/qr';

export const foldersApi = {
  list: () => api.get<{ folders: Folder[] }>('/folders'),
  create: (name: string) => api.post<{ folder: Folder }>('/folders', { name }),
  get: (id: string) => api.get<{ folder: Folder }>(`/folders/${id}`),
  update: (id: string, name: string) => api.patch<{ folder: Folder }>(`/folders/${id}`, { name }),
  remove: (id: string) => api.delete<{ id: string }>(`/folders/${id}`),
};
