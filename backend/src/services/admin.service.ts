import { prisma } from '../config/database.js';

interface Page {
  skip: number;
  take: number;
  search?: string;
}

export const adminService = {
  async listUsers({ skip, take, search }: Page) {
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { qrCodes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  },

  async listQrs({ skip, take, search }: Page) {
    const where = search ? { name: { contains: search, mode: 'insensitive' as const } } : {};
    const [items, total] = await prisma.$transaction([
      prisma.qRCode.findMany({
        where,
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
          status: true,
          scanCount: true,
          createdAt: true,
          user: { select: { id: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.qRCode.count({ where }),
    ]);
    return { items, total };
  },

  async listScans({ skip, take }: Page) {
    const [items, total] = await prisma.$transaction([
      prisma.scan.findMany({
        select: {
          id: true,
          qrCodeId: true,
          scannedAt: true,
          deviceType: true,
          browser: true,
          operatingSystem: true,
          country: true,
        },
        orderBy: { scannedAt: 'desc' },
        skip,
        take,
      }),
      prisma.scan.count(),
    ]);
    return { items, total };
  },

  async listAuditLogs({ skip, take }: Page) {
    const [items, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        include: { user: { select: { id: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.auditLog.count(),
    ]);
    return { items, total };
  },

  // Records a security/administrative action.
  async recordAudit(params: {
    userId?: string;
    action: string;
    entityType?: string;
    entityId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata as object | undefined,
      },
    });
  },
};
