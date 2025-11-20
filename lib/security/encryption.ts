/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for encryption with proper key derivation
 */

import crypto from 'crypto';

// Get encryption secrets from environment
const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET;
const ENCRYPTION_SALT = process.env.API_KEY_ENCRYPTION_SALT;

if (!ENCRYPTION_SECRET || ENCRYPTION_SECRET.length < 32) {
  console.warn(
    '⚠️  ENCRYPTION_SECRET is not set or too short. Using default (INSECURE for production).'
  );
}

if (!ENCRYPTION_SALT) {
  console.warn(
    '⚠️  ENCRYPTION_SALT is not set. Using default (INSECURE for production).'
  );
}

/**
 * Derives a 32-byte encryption key from the secret using PBKDF2
 */
function deriveKey(secret: string, salt: string): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha256');
}

/**
 * Encrypt data using AES-256-GCM
 * Returns base64 encoded string in format: iv:authTag:encryptedData
 */
export async function encryptData(data: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Encryption should only be used server-side');
  }

  const secret = ENCRYPTION_SECRET || 'default-moby-secret-key-32chars-min';
  const salt = ENCRYPTION_SALT || 'default-moby-salt';

  const key = deriveKey(secret, salt);
  const iv = crypto.randomBytes(16); // 128-bit IV for GCM

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData (all base64)
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt data using AES-256-GCM
 * Expects format: iv:authTag:encryptedData (all base64)
 */
export async function decryptData(encryptedData: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('Decryption should only be used server-side');
  }

  const secret = ENCRYPTION_SECRET || 'default-moby-secret-key-32chars-min';
  const salt = ENCRYPTION_SALT || 'default-moby-salt';

  const key = deriveKey(secret, salt);

  // Parse the encrypted data
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [ivBase64, authTagBase64, encrypted] = parts;

  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Hash sensitive data (one-way, for comparison only)
 * Useful for storing passwords, API keys for validation
 */
export function hashData(data: string): string {
  const salt = ENCRYPTION_SALT || 'default-moby-salt';
  return crypto
    .createHmac('sha256', salt)
    .update(data)
    .digest('base64');
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('base64url');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
export function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);

  return crypto.timingSafeEqual(bufA, bufB);
}
