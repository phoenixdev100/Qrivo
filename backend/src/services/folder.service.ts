import { folderRepository } from '../repositories/folder.repository.js';
import { ApiError } from '../utils/api-error.js';

async function getOwnedFolder(userId: string, id: string) {
  const folder = await folderRepository.findById(id);
  if (!folder || folder.userId !== userId) {
    throw ApiError.notFound('Folder not found');
  }
  return folder;
}

export const folderService = {
  create(userId: string, name: string) {
    return folderRepository.create(userId, name);
  },

  list(userId: string) {
    return folderRepository.listByUser(userId);
  },

  async get(userId: string, id: string) {
    return getOwnedFolder(userId, id);
  },

  async update(userId: string, id: string, name: string) {
    await getOwnedFolder(userId, id);
    return folderRepository.update(id, name);
  },

  async remove(userId: string, id: string) {
    await getOwnedFolder(userId, id);
    // QR codes retain their data; their folderId is set null via onDelete: SetNull.
    await folderRepository.delete(id);
    return { id };
  },
};
