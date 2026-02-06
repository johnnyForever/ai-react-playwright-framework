import { testCredentials } from '../config/credentials';
import { expect, test } from '../fixtures/api.fixture';

test.describe('Products API @api @regression', () => {
  test.describe('GET /api/products', () => {
    test('should return all products', async ({ api }) => {
      const { response, data, metrics } = await api.get<{ data: unknown[]; total: number }>(
        '/api/products',
      );

      expect(response.status()).toBe(200);
      expect(data.data).toBeInstanceOf(Array);
      expect(data.total).toBeGreaterThan(0);
      expect(data.data.length).toBe(data.total);
      expect(metrics.responseTime).toBeLessThan(500);
    });

    test('should return products with correct structure', async ({ api }) => {
      const { data } = await api.get<{ data: Array<{ id: string; name: string; price: number }> }>(
        '/api/products',
      );

      const product = data.data[0];
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('description');
      expect(product).toHaveProperty('price');
      expect(product).toHaveProperty('imageUrl');
      expect(typeof product.price).toBe('number');
    });
  });

  test.describe('GET /api/products/:id', () => {
    test('should return a single product by ID', async ({ api }) => {
      const { response, data } = await api.get<{ data: { id: string; name: string } }>(
        '/api/products/1',
      );

      expect(response.status()).toBe(200);
      expect(data.data.id).toBe('1');
      expect(data.data.name).toBeTruthy();
    });

    test('should return 404 for non-existent product', async ({ api }) => {
      const { response, data } = await api.get<{ error: string }>('/api/products/999');

      expect(response.status()).toBe(404);
      expect(data.error).toBe('Product not found');
    });

    test('should handle invalid product ID gracefully', async ({ api }) => {
      const { response } = await api.get('/api/products/invalid-id');

      expect(response.status()).toBe(404);
    });
  });

  test.describe('Product search', () => {
    test('should search products by name', async ({ api }) => {
      const { response, data } = await api.get<{
        data: Array<{ name: string }>;
        query: { q: string };
      }>('/api/products/search?q=laptop');

      expect(response.status()).toBe(200);
      expect(data.data.some((p) => p.name.toLowerCase().includes('laptop'))).toBeTruthy();
    });

    test('should filter products by price range', async ({ api }) => {
      const { response, data } = await api.get<{ data: Array<{ price: number }> }>(
        '/api/products/search?minPrice=100&maxPrice=300',
      );

      expect(response.status()).toBe(200);
      for (const product of data.data) {
        expect(product.price).toBeGreaterThanOrEqual(100);
        expect(product.price).toBeLessThanOrEqual(300);
      }
    });
  });
});

test.describe('Product CRUD operations @api @regression', () => {
  let adminToken: string;

  test.beforeEach(async ({ api }) => {
    // Login as admin for CRUD operations
    const { data } = await api.post<{ token: string }>('/api/auth/login', {
      email: testCredentials.admin.email,
      password: testCredentials.admin.password,
    });
    adminToken = data.token;
    api.setAuthToken(adminToken);
  });

  test('should create a new product (admin only)', async ({ api }) => {
    const newProduct = {
      name: 'Test Product',
      description: 'A test product for API testing',
      price: 49.99,
      imageUrl: 'https://picsum.photos/400/300',
    };

    const { response, data } = await api.post<{
      data: { id: string; name: string };
      message: string;
    }>('/api/products', newProduct);

    expect(response.status()).toBe(201);
    expect(data.data.name).toBe(newProduct.name);
    expect(data.message).toBe('Product created successfully');
  });

  test('should update an existing product (admin only)', async ({ api }) => {
    const updates = { name: 'Updated Product Name' };

    const { response, data } = await api.put<{ data: { name: string }; message: string }>(
      '/api/products/1',
      updates,
    );

    expect(response.status()).toBe(200);
    expect(data.data.name).toBe(updates.name);
    expect(data.message).toBe('Product updated successfully');
  });

  test('should require admin role for product creation', async ({ api }) => {
    // Login as regular user
    const { data: loginData } = await api.post<{ token: string }>('/api/auth/login', {
      email: testCredentials.user.email,
      password: testCredentials.user.password,
    });
    api.setAuthToken(loginData.token);

    const { response, data } = await api.post<{ error: string }>('/api/products', {
      name: 'Unauthorized Product',
      description: 'Should fail',
      price: 10,
    });

    expect(response.status()).toBe(403);
    expect(data.error).toBe('Admin access required');
  });

  test('should return 404 when updating non-existent product', async ({ api }) => {
    const { response } = await api.put('/api/products/999', { name: 'Test' });

    expect(response.status()).toBe(404);
  });
});
