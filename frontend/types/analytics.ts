export interface QRAnalyticsSummary {
  totalScans: number;
  estimatedUniqueScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
}

export interface TimeseriesPoint {
  date: string;
  count: number;
}

export interface Bucket {
  label: string;
  count: number;
}

export interface DashboardOverview {
  totalQrCodes: number;
  activeQrCodes: number;
  totalScans: number;
  scansToday: number;
  timeseries: TimeseriesPoint[];
}

export interface Scan {
  id: string;
  qrCodeId: string;
  scannedAt: string;
  deviceType?: string | null;
  browser?: string | null;
  operatingSystem?: string | null;
  country?: string | null;
  region?: string | null;
  city?: string | null;
}
