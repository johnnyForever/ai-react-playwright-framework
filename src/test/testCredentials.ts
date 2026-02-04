/**
 * Test credentials configuration for unit tests
 * Loads credentials from import.meta.env (Vite environment variables)
 * 
 * These values MUST be set in .env file with VITE_ prefix:
 * - VITE_USER_EMAIL
 * - VITE_USER_PASSWORD
 * - VITE_ADMIN_EMAIL
 * - VITE_ADMIN_PASSWORD
 */

export const testCredentials = {
  user: {
    email: import.meta.env.VITE_USER_EMAIL || '',
    password: import.meta.env.VITE_USER_PASSWORD || '',
  },
  admin: {
    email: import.meta.env.VITE_ADMIN_EMAIL || '',
    password: import.meta.env.VITE_ADMIN_PASSWORD || '',
  },
  invalid: {
    email: 'nonexistent@example.com',
    password: 'wrongpassword',
  },
};

// Validate credentials are set
if (!testCredentials.user.email || !testCredentials.user.password) {
  console.warn('⚠️ VITE_USER_EMAIL and VITE_USER_PASSWORD must be set in .env file for tests');
}
if (!testCredentials.admin.email || !testCredentials.admin.password) {
  console.warn('⚠️ VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD must be set in .env file for tests');
}
