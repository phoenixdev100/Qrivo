import type { Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';

const withRelations = {
  content: true,
  customization: true,
  folder: true,
} satisfies Prisma.QRCodeInclude;

export const qrRepository = {
  create(data: Prisma.QRCodeCreateInput) {
    return prisma.qRCode.create({ data, include: withRelations });
  },

  findById(id: string) {
    return prisma.qRCode.findUnique({ where: { id }, include: withRelations });
  },

  // Optimized lookup for the hot scan path - selects only what resolution needs.
  findActiveByCode(code: string) {
    return prisma.qRCode.findUnique({
      where: { code },
      include: { content: true },
    });
  },

  codeExists(code: string) {
    return prisma.qRCode.findUnique({ where: { code }, select: { id: true } });
  },

  update(id: string, data: Prisma.QRCodeUpdateInput) {
    return prisma.qRCode.update({ where: { id }, data, include: withRelations });
  },

  incrementScanCount(id: string) {
    return prisma.qRCode.update({
      where: { id },
      data: { scanCount: { increment: 1 } },
      select: { id: true, scanCount: true },
    });
  },

  listByUser(userId: string, args: {
    skip: number;
    take: number;
    search?: string;
    folderId?: string;
    status?: Prisma.QRCodeWhereInput['status'];
  }) {
    const where: Prisma.QRCodeWhereInput = {
      userId,
      status: args.status ?? { not: 'DELETED' },
      ...(args.folderId ? { folderId: args.folderId } : {}),
      ...(args.search
        ? { name: { contains: args.search, mode: 'insensitive' } }
        : {}),
    };
    return prisma.$transaction([
      prisma.qRCode.findMany({
        where,
        include: withRelations,
        orderBy: { createdAt: 'desc' },
        skip: args.skip,
        take: args.take,
      }),
      prisma.qRCode.count({ where }),
    ]);
  },

  countByUser(userId: string) {
    return prisma.qRCode.count({ where: { userId, status: { not: 'DELETED' } } });
  },

  countActiveByUser(userId: string) {
    return prisma.qRCode.count({ where: { userId, status: 'ACTIVE' } });
  },
};
