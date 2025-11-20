/**
 * Encryption utilities for sensitive data
 * Uses AES-256-GCM for encryption
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt data (placeholder - use crypto in production)
 */
export async function encryptData(data: string): Promise<string> {
  // TODO: Implement proper encryption with crypto module
  // For now, just base64 encode (NOT SECURE - for development only)
  if (typeof window === 'undefined') {
    // Server-side
    return Buffer.from(data).toString('base64');
  } else {
    // Client-side
    return btoa(data);
  }
}

/**
 * Decrypt data (placeholder - use crypto in production)
 */
export async function decryptData(encryptedData: string): Promise<string> {
  // TODO: Implement proper decryption with crypto module
  // For now, just base64 decode (NOT SECURE - for development only)
  if (typeof window === 'undefined') {
    // Server-side
    return Buffer.from(encryptedData, 'base64').toString('utf8');
  } else {
    // Client-side
    return atob(encryptedData);
  }
}
