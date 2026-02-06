import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testCredentials } from '@/test/testCredentials';
import { getCurrentUser, isAuthenticated, login, logout } from './authService';

describe('authService', () => {
  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    };
  })();

  beforeEach(() => {
    // Replace localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('login', () => {
    it('should return success for valid demo user credentials', async () => {
      const result = await login({
        email: testCredentials.user.email,
        password: testCredentials.user.password,
        rememberMe: false,
      });

      expect(result.success).toBe(true);
      expect(result.user).toEqual({
        id: '1',
        email: testCredentials.user.email,
        name: 'Demo User',
        role: 'user',
      });
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should return success for valid admin credentials', async () => {
      const result = await login({
        email: testCredentials.admin.email,
        password: testCredentials.admin.password,
        rememberMe: false,
      });

      expect(result.success).toBe(true);
      expect(result.user?.role).toBe('admin');
    });

    it('should be case insensitive for email', async () => {
      const result = await login({
        email: testCredentials.user.email.toUpperCase(),
        password: testCredentials.user.password,
        rememberMe: false,
      });

      expect(result.success).toBe(true);
    });

    it('should return error for invalid email', async () => {
      const result = await login({
        email: testCredentials.invalid.email,
        password: testCredentials.user.password,
        rememberMe: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should return error for invalid password', async () => {
      const result = await login({
        email: testCredentials.user.email,
        password: testCredentials.invalid.password,
        rememberMe: false,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should set longer session duration when rememberMe is true', async () => {
      await login({
        email: testCredentials.user.email,
        password: testCredentials.user.password,
        rememberMe: true,
      });

      // Check that setItem was called with session duration key
      const sessionDurationCall = localStorageMock.setItem.mock.calls.find(
        (call) => call[0] === 'auth_session_duration',
      );
      expect(sessionDurationCall).toBeDefined();

      const expiresAt = parseInt(sessionDurationCall![1], 10);
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
      // Allow 5 second tolerance
      expect(expiresAt).toBeGreaterThan(sevenDaysFromNow - 5000);
    });

    it('should set shorter session duration when rememberMe is false', async () => {
      await login({
        email: testCredentials.user.email,
        password: testCredentials.user.password,
        rememberMe: false,
      });

      const sessionDurationCall = localStorageMock.setItem.mock.calls.find(
        (call) => call[0] === 'auth_session_duration',
      );
      expect(sessionDurationCall).toBeDefined();

      const expiresAt = parseInt(sessionDurationCall![1], 10);
      const oneHourFromNow = Date.now() + 60 * 60 * 1000;
      const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000;
      // Should be around 1 hour, not 7 days
      expect(expiresAt).toBeLessThan(sevenDaysFromNow - 1000);
      expect(expiresAt).toBeGreaterThan(oneHourFromNow - 5000);
    });
  });

  describe('logout', () => {
    it('should remove user and session from localStorage', () => {
      logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_user');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_session_duration');
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when no user is stored', () => {
      const user = getCurrentUser();
      expect(user).toBeNull();
    });

    it('should return user when valid user is stored', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'user',
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user') return JSON.stringify(mockUser);
        if (key === 'auth_session_duration') return (Date.now() + 60000).toString();
        return null;
      });

      const user = getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it('should return null and logout when session is expired', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'user',
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user') return JSON.stringify(mockUser);
        if (key === 'auth_session_duration') return (Date.now() - 1000).toString(); // Expired
        return null;
      });

      const user = getCurrentUser();
      expect(user).toBeNull();
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('should return null for invalid JSON in localStorage', () => {
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user') return 'invalid-json';
        if (key === 'auth_session_duration') return (Date.now() + 60000).toString();
        return null;
      });

      const user = getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no user is logged in', () => {
      expect(isAuthenticated()).toBe(false);
    });

    it('should return true when user is logged in', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'user',
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user') return JSON.stringify(mockUser);
        if (key === 'auth_session_duration') return (Date.now() + 60000).toString();
        return null;
      });

      expect(isAuthenticated()).toBe(true);
    });

    it('should return false when session is expired', () => {
      const mockUser = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
        role: 'user',
      };
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === 'auth_user') return JSON.stringify(mockUser);
        if (key === 'auth_session_duration') return (Date.now() - 1000).toString();
        return null;
      });

      expect(isAuthenticated()).toBe(false);
    });
  });
});
