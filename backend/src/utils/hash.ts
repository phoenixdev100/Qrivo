import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Privacy-safe visitor fingerprint: salted SHA-256 of IP + UA + day bucket.
// The raw IP is never persisted; only this rotating hash is stored.
export function computeVisitorHash(ip: string, userAgent: string, salt: string): string {
  const dayBucket = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return crypto
    .createHash('sha256')
    .update(`${ip}|${userAgent}|${dayBucket}|${salt}`)
    .digest('hex');
}
