import { api } from './client';
import { config } from '../config';
import type { CreateQRInput, QRCode, QRContentInput, QRCustomization } from '@/types/qr';
import type { Paginated } from '@/types/api';

interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  folderId?: string;
  status?: string;
}

function buildQuery(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : '';
}

export const qrApi = {
  create: (input: CreateQRInput) => api.post<{ qr: QRCode }>('/qr', input),

  list: (params: ListParams = {}) =>
    api.get<Paginated<QRCode>>(
      `/qr${buildQuery({
        page: params.page,
        pageSize: params.pageSize,
        search: params.search,
        folderId: params.folderId,
        status: params.status,
      })}`,
    ),

  get: (id: string) => api.get<{ qr: QRCode }>(`/qr/${id}`),

  update: (id: string, input: { name?: string; folderId?: string | null; expiresAt?: string | null }) =>
    api.patch<{ qr: QRCode }>(`/qr/${id}`, input),

  remove: (id: string) => api.delete<{ id: string }>(`/qr/${id}`),

  duplicate: (id: string) => api.post<{ qr: QRCode }>(`/qr/${id}/duplicate`),
  enable: (id: string) => api.post<{ qr: QRCode }>(`/qr/${id}/enable`),
  disable: (id: string) => api.post<{ qr: QRCode }>(`/qr/${id}/disable`),

  updateDestination: (id: string, content: QRContentInput) =>
    api.patch<{ qr: QRCode }>(`/qr/${id}/destination`, { content }),

  updateCustomization: (id: string, customization: Partial<QRCustomization>) =>
    api.patch<{ qr: QRCode }>(`/qr/${id}/customization`, customization),

  // Direct download URLs (browser navigations, include cookies automatically).
  downloadPngUrl: (id: string) => `${config.apiUrl}/qr/${id}/download/png`,
  downloadSvgUrl: (id: string) => `${config.apiUrl}/qr/${id}/download/svg`,
};
