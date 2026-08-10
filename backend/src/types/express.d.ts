import type { Role } from '@prisma/client';

// Augment Express Request with the authenticated user context set by auth middleware.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: Role;
        email: string;
      };
    }
  }
}

export {};
