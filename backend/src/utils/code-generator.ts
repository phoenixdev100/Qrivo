import crypto from 'node:crypto';
import { QR_CODE_ALPHABET, QR_CODE_LENGTH } from '../config/constants.js';

// Generates a cryptographically-random short code from an unambiguous alphabet.
// Uniqueness against the DB is enforced by the caller (retry on collision).
export function generateCode(length = QR_CODE_LENGTH): string {
  const alphabet = QR_CODE_ALPHABET;
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
