import { api } from './client';
import type { User } from '@/types/user';

export const authApi = {
  register: (input: { name: string; email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/register', input),

  login: (input: { email: string; password: string }) =>
    api.post<{ user: User; accessToken: string }>('/auth/login', input),

  logout: () => api.post<{ message: string }>('/auth/logout'),

  me: () => api.get<{ user: User }>('/auth/me'),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }),
};
