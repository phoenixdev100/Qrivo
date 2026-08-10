import { api } from './client';
import type { User } from '@/types/user';

export const usersApi = {
  me: () => api.get<{ user: User }>('/users/me'),
  updateProfile: (input: { name?: string; email?: string }) =>
    api.patch<{ user: User }>('/users/me', input),
  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    api.post<{ message: string }>('/users/me/password', input),
  deleteAccount: () => api.delete<{ message: string }>('/users/me'),
};
