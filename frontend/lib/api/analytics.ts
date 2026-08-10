import { api } from './client';
import type {
  Bucket,
  DashboardOverview,
  QRAnalyticsSummary,
  Scan,
  TimeseriesPoint,
} from '@/types/analytics';
import type { Paginated } from '@/types/api';

export const analyticsApi = {
  overview: (signal?: AbortSignal) => api.get<DashboardOverview>('/analytics/overview', signal),

  summary: (qrId: string, signal?: AbortSignal) =>
    api.get<QRAnalyticsSummary>(`/qr/${qrId}/analytics`, signal),

  timeseries: (qrId: string, days = 30, signal?: AbortSignal) =>
    api.get<TimeseriesPoint[]>(`/qr/${qrId}/analytics/timeseries?days=${days}`, signal),

  devices: (qrId: string, signal?: AbortSignal) =>
    api.get<Bucket[]>(`/qr/${qrId}/analytics/devices`, signal),

  browsers: (qrId: string, signal?: AbortSignal) =>
    api.get<Bucket[]>(`/qr/${qrId}/analytics/browsers`, signal),

  operatingSystems: (qrId: string, signal?: AbortSignal) =>
    api.get<Bucket[]>(`/qr/${qrId}/analytics/os`, signal),

  countries: (qrId: string, signal?: AbortSignal) =>
    api.get<Bucket[]>(`/qr/${qrId}/analytics/countries`, signal),

  scans: (qrId: string, page = 1, pageSize = 20, signal?: AbortSignal) =>
    api.get<Paginated<Scan>>(`/qr/${qrId}/scans?page=${page}&pageSize=${pageSize}`, signal),
};
