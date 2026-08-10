import { prisma } from '../config/database.js';

export const folderRepository = {
  create(userId: string, name: string) {
    return prisma.folder.create({ data: { userId, name } });
  },

  listByUser(userId: string) {
    return prisma.folder.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { qrCodes: true } } },
    });
  },

  findById(id: string) {
    return prisma.folder.findUnique({ where: { id } });
  },

  update(id: string, name: string) {
    return prisma.folder.update({ where: { id }, data: { name } });
  },

  delete(id: string) {
    return prisma.folder.delete({ where: { id } });
  },
};
