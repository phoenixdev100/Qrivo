import { userRepository } from '../repositories/user.repository.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { ApiError } from '../utils/api-error.js';
import type { PublicUser } from './auth.service.js';
import type { UpdateProfileInput } from '../validators/user.validator.js';

function toPublicUser(u: {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: Date;
}): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

export const userService = {
  async updateProfile(userId: string, input: UpdateProfileInput): Promise<PublicUser> {
    if (input.email) {
      const existing = await userRepository.findByEmail(input.email);
      if (existing && existing.id !== userId) {
        throw ApiError.conflict('This email is already in use');
      }
    }
    const user = await userRepository.update(userId, {
      ...(input.name ? { name: input.name } : {}),
      ...(input.email ? { email: input.email, emailVerified: false } : {}),
    });
    return toPublicUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    const valid = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) throw ApiError.badRequest('Current password is incorrect');
    const passwordHash = await hashPassword(newPassword);
    await userRepository.update(userId, { passwordHash });
  },

  async deleteAccount(userId: string): Promise<void> {
    await userRepository.delete(userId);
  },
};
