import { userRepository } from '../repositories/user.repository.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { hashPassword, verifyPassword } from '../utils/hash.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/tokens.js';
import { ApiError } from '../utils/api-error.js';
import type { LoginInput, RegisterInput } from '../validators/auth.validator.js';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: Date;
}

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

async function issueTokens(user: { id: string; role: 'USER' | 'ADMIN'; email: string }): Promise<AuthTokens> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role, email: user.email });
  const refreshToken = signRefreshToken(user.id);
  
  // Calculate expiration date for refresh token (7 days from now)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  // Store refresh token in database
  await refreshTokenRepository.create({
    user: { connect: { id: user.id } },
    token: refreshToken,
    expiresAt,
  });
  
  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }
    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });
    const tokens = await issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  async login(input: LoginInput): Promise<{ user: PublicUser; tokens: AuthTokens }> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      // Same message as bad password to avoid user enumeration.
      throw ApiError.unauthorized('Invalid email or password');
    }
    const valid = await verifyPassword(input.password, user.passwordHash);
    if (!valid) {
      throw ApiError.unauthorized('Invalid email or password');
    }
    const tokens = await issueTokens(user);
    return { user: toPublicUser(user), tokens };
  },

  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Verify JWT signature first
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired session');
    }
    
    // Check if token exists in database and is not revoked
    const storedToken = await refreshTokenRepository.findByToken(refreshToken);
    if (!storedToken || storedToken.revoked) {
      throw ApiError.unauthorized('Invalid or expired session');
    }
    
    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      throw ApiError.unauthorized('Invalid or expired session');
    }
    
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw ApiError.unauthorized('Invalid session');
    }
    
    // Revoke old refresh token (token rotation)
    await refreshTokenRepository.revoke(refreshToken);
    
    // Issue new tokens
    return issueTokens(user);
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) throw ApiError.notFound('User not found');
    return toPublicUser(user);
  },
};
