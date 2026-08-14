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
    }).then(folders => folders.map(folder => ({
      ...folder,
      qrCodeCount: folder._count.qrCodes,
      _count: undefined,
    })));
  },

  findById(id: string) {
    return prisma.folder.findUnique({
      where: { id },
      include: { _count: { select: { qrCodes: true } } },
    }).then(folder => folder ? {
      ...folder,
      qrCodeCount: folder._count.qrCodes,
      _count: undefined,
    } : null);
  },

  update(id: string, name: string) {
    return prisma.folder.update({ where: { id }, data: { name } });
  },

  delete(id: string) {
    return prisma.folder.delete({ where: { id } });
  },
};
