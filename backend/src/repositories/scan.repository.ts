import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

export const scanRepository = {
  create(data: Prisma.ScanCreateInput) {
    return prisma.scan.create({ data });
  },

  listByQr(qrCodeId: string, args: { skip: number; take: number }) {
    return prisma.$transaction([
      prisma.scan.findMany({
        where: { qrCodeId },
        orderBy: { scannedAt: 'desc' },
        skip: args.skip,
        take: args.take,
      }),
      prisma.scan.count({ where: { qrCodeId } }),
    ]);
  },

  countByQr(qrCodeId: string) {
    return prisma.scan.count({ where: { qrCodeId } });
  },

  countByQrSince(qrCodeId: string, since: Date) {
    return prisma.scan.count({ where: { qrCodeId, scannedAt: { gte: since } } });
  },

  // Estimated unique scans = distinct visitorHash values.
  async countUnique(qrCodeId: string): Promise<number> {
    const rows = await prisma.scan.findMany({
      where: { qrCodeId, visitorHash: { not: null } },
      distinct: ['visitorHash'],
      select: { visitorHash: true },
    });
    return rows.length;
  },

  groupBy(
    qrCodeId: string,
    field: 'deviceType' | 'browser' | 'operatingSystem' | 'country',
  ) {
    return prisma.scan.groupBy({
      by: [field],
      where: { qrCodeId },
      _count: { _all: true },
      orderBy: { _count: { id: 'desc' } },
    });
  },

  // Raw scans within a range for time-series bucketing.
  scansSince(qrCodeId: string, since: Date) {
    return prisma.scan.findMany({
      where: { qrCodeId, scannedAt: { gte: since } },
      select: { scannedAt: true },
      orderBy: { scannedAt: 'asc' },
    });
  },
};
