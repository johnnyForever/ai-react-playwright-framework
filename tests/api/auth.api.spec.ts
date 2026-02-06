import { testCredentials } from '../config/credentials';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Authentication API @api @smoke @regression', () => {
  test.describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async ({ api }) => {
      const { response, data, metrics } = await api.post<{
        success: boolean;
        user: { id: string; email: string; name: string; role: string };
        token: string;
        expiresIn: number;
      }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });

      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.email).toBe(testCredentials.user.email);
      expect(data.user.role).toBe('user');
      expect(data.token).toBeTruthy();
      expect(data.expiresIn).toBe(3600);
      expect(metrics.responseTime).toBeLessThan(500);
    });

    test('should login as admin with valid credentials', async ({ api }) => {
      const { response, data } = await api.post<{
        success: boolean;
        user: { role: string };
        token: string;
      }>('/api/auth/login', {
        email: testCredentials.admin.email,
        password: testCredentials.admin.password,
      });

      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user.role).toBe('admin');
      expect(data.token).toBeTruthy();
    });

    test('should reject invalid password', async ({ api }) => {
      const { response, data } = await api.post<{ error: string }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.invalid.password,
      });

      expect(response.status()).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    test('should reject non-existent user', async ({ api }) => {
      const { response, data } = await api.post<{ error: string }>('/api/auth/login', {
        email: testCredentials.invalid.email,
        password: testCredentials.user.password,
      });

      expect(response.status()).toBe(401);
      expect(data.error).toBe('Invalid email or password');
    });

    test('should require email and password', async ({ api }) => {
      const { response, data } = await api.post<{ error: string }>('/api/auth/login', {});

      expect(response.status()).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });

    test('should handle missing password', async ({ api }) => {
      const { response, data } = await api.post<{ error: string }>('/api/auth/login', {
        email: testCredentials.user.email,
      });

      expect(response.status()).toBe(400);
      expect(data.error).toBe('Email and password are required');
    });
  });

  test.describe('GET /api/auth/me', () => {
    test('should return current user when authenticated', async ({ api }) => {
      // First login
      const { data: loginData } = await api.post<{ token: string }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });
      api.setAuthToken(loginData.token);

      // Get current user
      const { response, data } = await api.get<{ user: { email: string; name: string } }>(
        '/api/auth/me',
      );

      expect(response.status()).toBe(200);
      expect(data.user.email).toBe(testCredentials.user.email);
      expect(data.user.name).toBe('Demo User');
    });

    test('should return 401 without authentication', async ({ api }) => {
      const { response, data } = await api.get<{ error: string }>('/api/auth/me');

      expect(response.status()).toBe(401);
      expect(data.error).toBe('Authentication required');
    });

    test('should return 403 with invalid token', async ({ api }) => {
      api.setAuthToken('invalid-token-here');
      const { response, data } = await api.get<{ error: string }>('/api/auth/me');

      expect(response.status()).toBe(403);
      expect(data.error).toBe('Invalid or expired token');
    });
  });

  test.describe('POST /api/auth/logout', () => {
    test('should logout successfully when authenticated', async ({ api }) => {
      // Login first
      const { data: loginData } = await api.post<{ token: string }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });
      api.setAuthToken(loginData.token);

      // Logout
      const { response, data } = await api.post<{ success: boolean; message: string }>(
        '/api/auth/logout',
      );

      expect(response.status()).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Logged out successfully');
    });

    test('should require authentication for logout', async ({ api }) => {
      const { response } = await api.post('/api/auth/logout');

      expect(response.status()).toBe(401);
    });
  });

  test.describe('POST /api/auth/refresh', () => {
    test('should refresh token when authenticated', async ({ api }) => {
      // Login first
      const { data: loginData } = await api.post<{ token: string }>('/api/auth/login', {
        email: testCredentials.user.email,
        password: testCredentials.user.password,
      });
      api.setAuthToken(loginData.token);

      // Refresh token
      const { response, data } = await api.post<{ token: string; expiresIn: number }>(
        '/api/auth/refresh',
      );

      expect(response.status()).toBe(200);
      expect(data.token).toBeTruthy();
      // Token should be a valid JWT (has 3 parts separated by dots)
      expect(data.token.split('.').length).toBe(3);
      expect(data.expiresIn).toBe(3600);
    });

    test('should require authentication for refresh', async ({ api }) => {
      const { response } = await api.post('/api/auth/refresh');

      expect(response.status()).toBe(401);
    });
  });
});

test.describe('Health Check API @api @smoke', () => {
  test('should return healthy status', async ({ api }) => {
    const { response, data, metrics } = await api.get<{
      status: string;
      timestamp: string;
      uptime: number;
    }>('/api/health');

    expect(response.status()).toBe(200);
    expect(data.status).toBe('healthy');
    expect(data.timestamp).toBeTruthy();
    expect(data.uptime).toBeGreaterThan(0);
    expect(metrics.responseTime).toBeLessThan(100); // Health check should be fast
  });
});
