/**
 * Test Credentials
 * Encrypted credentials for test users
 * 
 * To encrypt new credentials, use:
 *   npx ts-node -e "import { encrypt } from './tests/utils/crypto'; console.log(encrypt('your-password'))"
 */

import { decrypt } from '../utils/crypto';

interface UserCredentials {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
}

/**
 * Encrypted user credentials
 * Passwords are encrypted using AES-256-GCM
 * 
 * These are encrypted versions of the test passwords.
 * The encryption key is stored in ENCRYPTION_KEY environment variable.
 */
const ENCRYPTED_USERS: Record<string, { username: string; encryptedPassword: string; role: UserCredentials['role'] }> = {
  standard: {
    username: 'demo@demo.com',
    // Encrypted version of 'password123'
    encryptedPassword: '', // Will be set dynamically for dev, or use real encrypted value
    role: 'user',
  },
  admin: {
    username: 'admin@demo.com',
    encryptedPassword: '',
    role: 'admin',
  },
  invalid: {
    username: 'invalid@example.com',
    encryptedPassword: '',
    role: 'guest',
  },
};

// Development passwords (used when ENCRYPTION_KEY is not set)
// These match the mock users in src/services/authService.ts
const DEV_PASSWORDS: Record<string, string> = {
  standard: 'password123',
  admin: 'admin123',
  invalid: 'wrongpassword',
};

/**
 * Get decrypted credentials for a user type
 * Falls back to development passwords if encryption is not configured
 */
export function getCredentials(userType: 'standard' | 'admin' | 'invalid' = 'standard'): UserCredentials {
  const user = ENCRYPTED_USERS[userType];
  
  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }
  
  let password: string;
  
  // If encrypted password is set and encryption key exists, decrypt
  if (user.encryptedPassword && process.env.ENCRYPTION_KEY) {
    try {
      password = decrypt(user.encryptedPassword);
    } catch {
      console.warn(`Failed to decrypt password for ${userType}, using dev password`);
      password = DEV_PASSWORDS[userType];
    }
  } else {
    // Development mode - use plain passwords
    password = DEV_PASSWORDS[userType];
  }
  
  return {
    username: user.username,
    password,
    role: user.role,
  };
}

/**
 * Get all available user types
 */
export function getAvailableUsers(): string[] {
  return Object.keys(ENCRYPTED_USERS);
}

/**
 * Standard test user credentials (most common use case)
 */
export const standardUser = () => getCredentials('standard');

/**
 * Admin test user credentials
 */
export const adminUser = () => getCredentials('admin');

/**
 * Invalid credentials for negative testing
 */
export const invalidUser = () => getCredentials('invalid');
