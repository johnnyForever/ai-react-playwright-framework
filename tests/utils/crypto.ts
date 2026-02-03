/**
 * Encryption Utilities
 * Provides secure encryption/decryption for sensitive test data
 * Uses AES-256-GCM for authenticated encryption
 */

import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;

/**
 * Get encryption key from environment or generate a default for development
 * In production/CI, ENCRYPTION_KEY should be set as a secret
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.ENCRYPTION_KEY;
  
  if (envKey) {
    // If key is provided, derive a proper 32-byte key using PBKDF2
    return crypto.pbkdf2Sync(envKey, 'playwright-test-salt', 100000, 32, 'sha256');
  }
  
  // Development fallback - NOT for production use
  console.warn('⚠️  Using default encryption key. Set ENCRYPTION_KEY for production.');
  return crypto.pbkdf2Sync('dev-default-key-not-for-production', 'playwright-test-salt', 100000, 32, 'sha256');
}

/**
 * Encrypt a plaintext string
 * @param plaintext - The text to encrypt
 * @returns Encrypted string in format: iv:authTag:ciphertext (all base64)
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  // Format: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypt an encrypted string
 * @param encryptedData - Encrypted string in format: iv:authTag:ciphertext
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format. Expected iv:authTag:ciphertext');
  }
  
  const [ivBase64, authTagBase64, ciphertext] = parts;
  const iv = Buffer.from(ivBase64, 'base64');
  const authTag = Buffer.from(authTagBase64, 'base64');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash a password using bcrypt-like approach (for storage, not encryption)
 * @param password - Password to hash
 * @returns Hashed password
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return `${salt.toString('base64')}:${hash.toString('base64')}`;
}

/**
 * Verify a password against a hash
 * @param password - Password to verify
 * @param storedHash - Previously hashed password
 * @returns True if password matches
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [saltBase64, hashBase64] = storedHash.split(':');
  const salt = Buffer.from(saltBase64, 'base64');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512');
  return hash.toString('base64') === hashBase64;
}

/**
 * Generate an encryption key for use in .env
 * Run: npx ts-node -e "import { generateKey } from './tests/utils/crypto'; console.log(generateKey())"
 */
export function generateKey(): string {
  return crypto.randomBytes(32).toString('base64');
}
