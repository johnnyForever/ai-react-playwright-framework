import type { LoginCredentials, LoginResponse, User } from '@/types/auth';

// Load credentials from environment variables (VITE_ prefix for browser access)
// These MUST be set in .env file - no fallback values for security
const USER_EMAIL = import.meta.env.VITE_USER_EMAIL || '';
const USER_PASSWORD = import.meta.env.VITE_USER_PASSWORD || '';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

// Warn if credentials are not configured (only in development)
if (import.meta.env.DEV && (!USER_EMAIL || !USER_PASSWORD)) {
  console.warn('⚠️ VITE_USER_EMAIL and VITE_USER_PASSWORD must be set in .env file');
}
if (import.meta.env.DEV && (!ADMIN_EMAIL || !ADMIN_PASSWORD)) {
  console.warn('⚠️ VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD must be set in .env file');
}

// Mock users database - credentials loaded from environment
const MOCK_USERS: Record<string, { password: string; user: User }> = {};

// Only add users if credentials are configured
if (USER_EMAIL && USER_PASSWORD) {
  MOCK_USERS[USER_EMAIL.toLowerCase()] = {
    password: USER_PASSWORD,
    user: {
      id: '1',
      email: USER_EMAIL,
      name: 'Demo User',
      role: 'user',
    },
  };
}

if (ADMIN_EMAIL && ADMIN_PASSWORD) {
  MOCK_USERS[ADMIN_EMAIL.toLowerCase()] = {
    password: ADMIN_PASSWORD,
    user: {
      id: '2',
      email: ADMIN_EMAIL,
      name: 'Admin User',
      role: 'admin',
    },
  };
}

const AUTH_STORAGE_KEY = 'auth_user';
const SESSION_DURATION_KEY = 'auth_session_duration';

/**
 * Simulates authentication API call
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockUser = MOCK_USERS[credentials.email.toLowerCase()];

  if (!mockUser) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  if (mockUser.password !== credentials.password) {
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  // Store user in localStorage
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser.user));

  // Set session duration based on remember me
  const duration = credentials.rememberMe ? 7 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 7 days or 1 hour
  const expiresAt = Date.now() + duration;
  localStorage.setItem(SESSION_DURATION_KEY, expiresAt.toString());

  return {
    success: true,
    user: mockUser.user,
  };
}

/**
 * Logs out the current user
 */
export function logout(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(SESSION_DURATION_KEY);
}

/**
 * Gets the currently authenticated user
 */
export function getCurrentUser(): User | null {
  const expiresAt = localStorage.getItem(SESSION_DURATION_KEY);

  if (expiresAt && Date.now() > parseInt(expiresAt, 10)) {
    logout();
    return null;
  }

  const userJson = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!userJson) {
    return null;
  }

  try {
    return JSON.parse(userJson) as User;
  } catch {
    return null;
  }
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
