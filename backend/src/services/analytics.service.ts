import { scanRepository } from '../repositories/scan.repository.js';
import { qrRepository } from '../repositories/qr.repository.js';
import { prisma } from '../config/database.js';

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

interface Bucket {
  label: string;
  count: number;
}

function toBuckets(rows: { _count: { _all: number } }[], key: string): Bucket[] {
  return rows
    .map((r) => ({
      label: (r as unknown as Record<string, string | null>)[key] ?? 'Unknown',
      count: r._count._all,
    }))
    .filter((b) => b.count > 0);
}

export const analyticsService = {
  // Per-QR summary: totals, unique estimate, and recent-window counts.
  async qrSummary(qrCodeId: string) {
    const [total, unique, today, week, month] = await Promise.all([
      scanRepository.countByQr(qrCodeId),
      scanRepository.countUnique(qrCodeId),
      scanRepository.countByQrSince(qrCodeId, startOfToday()),
      scanRepository.countByQrSince(qrCodeId, daysAgo(7)),
      scanRepository.countByQrSince(qrCodeId, daysAgo(30)),
    ]);
    return {
      totalScans: total,
      estimatedUniqueScans: unique, // approximation - see docs
      scansToday: today,
      scansThisWeek: week,
      scansThisMonth: month,
    };
  },

  // Daily time-series for the last `days` days (zero-filled).
  async timeseries(qrCodeId: string, days = 30) {
    const since = daysAgo(days - 1);
    const scans = await scanRepository.scansSince(qrCodeId, since);

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const s of scans) {
      const key = s.scannedAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  },

  async devices(qrCodeId: string) {
    return toBuckets(await scanRepository.groupBy(qrCodeId, 'deviceType'), 'deviceType');
  },
  async browsers(qrCodeId: string) {
    return toBuckets(await scanRepository.groupBy(qrCodeId, 'browser'), 'browser');
  },
  async operatingSystems(qrCodeId: string) {
    return toBuckets(await scanRepository.groupBy(qrCodeId, 'operatingSystem'), 'operatingSystem');
  },
  async countries(qrCodeId: string) {
    return toBuckets(await scanRepository.groupBy(qrCodeId, 'country'), 'country');
  },

  // Account-wide dashboard overview.
  async overview(userId: string) {
    const qrIds = await prisma.qRCode.findMany({
      where: { userId, status: { not: 'DELETED' } },
      select: { id: true },
    });
    const ids = qrIds.map((q) => q.id);

    const [totalQrCodes, activeQrCodes, totalScans, scansToday] = await Promise.all([
      qrRepository.countByUser(userId),
      qrRepository.countActiveByUser(userId),
      ids.length ? prisma.scan.count({ where: { qrCodeId: { in: ids } } }) : Promise.resolve(0),
      ids.length
        ? prisma.scan.count({ where: { qrCodeId: { in: ids }, scannedAt: { gte: startOfToday() } } })
        : Promise.resolve(0),
    ]);

    // 14-day account-wide timeseries.
    const since = daysAgo(13);
    const recent = ids.length
      ? await prisma.scan.findMany({
          where: { qrCodeId: { in: ids }, scannedAt: { gte: since } },
          select: { scannedAt: true },
        })
      : [];
    const buckets = new Map<string, number>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }
    for (const s of recent) {
      const key = s.scannedAt.toISOString().slice(0, 10);
      if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }

    return {
      totalQrCodes,
      activeQrCodes,
      totalScans,
      scansToday,
      timeseries: Array.from(buckets.entries()).map(([date, count]) => ({ date, count })),
    };
  },
};
