/**
 * Test Credentials
 * Loads credentials from environment variables
 * 
 * Required environment variables:
 *   TEST_USER_EMAIL - Standard user email
 *   TEST_USER_PASSWORD - Standard user password
 *   TEST_ADMIN_EMAIL - Admin user email  
 *   TEST_ADMIN_PASSWORD - Admin user password
 * 
 * For encrypted credentials, you can also use ENCRYPTION_KEY with encrypted values
 */

import { decrypt } from '../utils/crypto';

interface UserCredentials {
  username: string;
  password: string;
  role: 'admin' | 'user' | 'guest';
}

// Load credentials from environment variables
const USER_EMAIL = process.env.TEST_USER_EMAIL || '';
const USER_PASSWORD = process.env.TEST_USER_PASSWORD || '';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || '';

// Warn if environment variables are not set
if (!USER_EMAIL || !USER_PASSWORD) {
  console.warn('⚠️ TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables are not set');
}
if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.warn('⚠️ TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD environment variables are not set');
}

/**
 * User credentials configuration
 * Passwords can be encrypted using AES-256-GCM when ENCRYPTION_KEY is set
 */
const USERS: Record<string, { username: string; encryptedPassword: string; role: UserCredentials['role'] }> = {
  standard: {
    username: USER_EMAIL,
    encryptedPassword: '', // Set for encrypted mode, empty for plain env vars
    role: 'user',
  },
  admin: {
    username: ADMIN_EMAIL,
    encryptedPassword: '',
    role: 'admin',
  },
  invalid: {
    username: 'invalid@example.com',
    encryptedPassword: '',
    role: 'guest',
  },
};

// Passwords loaded from environment variables
const ENV_PASSWORDS: Record<string, string> = {
  standard: USER_PASSWORD,
  admin: ADMIN_PASSWORD,
  invalid: 'wrongpassword',
};

/**
 * Get decrypted credentials for a user type
 * Uses environment variables or falls back to encrypted passwords if configured
 */
export function getCredentials(userType: 'standard' | 'admin' | 'invalid' = 'standard'): UserCredentials {
  const user = USERS[userType];
  
  if (!user) {
    throw new Error(`Unknown user type: ${userType}`);
  }
  
  let password: string;
  
  // If encrypted password is set and encryption key exists, decrypt
  if (user.encryptedPassword && process.env.ENCRYPTION_KEY) {
    try {
      password = decrypt(user.encryptedPassword);
    } catch {
      console.warn(`Failed to decrypt password for ${userType}, using env password`);
      password = ENV_PASSWORDS[userType];
    }
  } else {
    // Use passwords from environment variables
    password = ENV_PASSWORDS[userType];
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
  return Object.keys(USERS);
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
