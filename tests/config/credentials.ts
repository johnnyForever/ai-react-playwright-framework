/**
 * Test Credentials Configuration
 * All credentials are loaded from environment variables
 * Never hardcode credentials in test files
 */

import 'dotenv/config';

export const testCredentials = {
  user: {
    email: process.env.TEST_USER_EMAIL || '',
    password: process.env.TEST_USER_PASSWORD || '',
    name: 'Demo User',
    role: 'user' as const,
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || '',
    password: process.env.TEST_ADMIN_PASSWORD || '',
    name: 'Admin User',
    role: 'admin' as const,
  },
  invalid: {
    email: 'nonexistent@demo.com',
    password: 'wrongpassword',
  },
};

// Validate that credentials are loaded
if (!testCredentials.user.email || !testCredentials.user.password) {
  console.warn('Warning: TEST_USER_EMAIL or TEST_USER_PASSWORD not set in environment');
}

if (!testCredentials.admin.email || !testCredentials.admin.password) {
  console.warn('Warning: TEST_ADMIN_EMAIL or TEST_ADMIN_PASSWORD not set in environment');
}
