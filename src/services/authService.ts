import type { LoginCredentials, LoginResponse, User } from '@/types/auth';

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: User }> = {
  'demo@demo.com': {
    password: 'password123',
    user: {
      id: '1',
      email: 'demo@demo.com',
      name: 'Demo User',
      role: 'user',
    },
  },
  'admin@demo.com': {
    password: 'admin123',
    user: {
      id: '2',
      email: 'admin@demo.com',
      name: 'Admin User',
      role: 'admin',
    },
  },
};

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
