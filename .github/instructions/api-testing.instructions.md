# API Testing

## Principles

- Use Playwright's `APIRequestContext` for all API testing
- Track response times for performance validation
- Combine related API calls into journey tests where appropriate

---

## Performance Thresholds

| Endpoint Type | Target Response Time |
|---------------|---------------------|
| Health check | < 50ms |
| Read operations | < 200ms |
| Write operations | < 300ms |
| Authentication | < 300ms |

Track p50, p95, and p99 percentiles for performance analysis.

---

## Test Tags

| Tag | Purpose |
|-----|---------|
| `@api` | All API tests |
| `@smoke` | Critical path tests (run on every PR) |
| `@regression` | Full regression suite |
| `@performance` | Performance-focused tests |
| `@stress` | Load and stress tests |

---

## API Test Structure

```typescript
test.describe('Products API', () => {
  test('CRUD operations work correctly @api @smoke', async ({ apiHelpers }) => {
    await test.step('GET /products returns product list', async () => {
      const { response, responseTime } = await apiHelpers.get('/products');
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(200);
      
      const products = await response.json();
      expect(products).toBeInstanceOf(Array);
      expect(products.length).toBeGreaterThan(0);
    });

    await test.step('GET /products/:id returns single product', async () => {
      const { response, responseTime } = await apiHelpers.get('/products/1');
      
      expect(response.ok()).toBeTruthy();
      expect(responseTime).toBeLessThan(200);
      
      const product = await response.json();
      expect(product).toHaveProperty('id');
      expect(product).toHaveProperty('name');
      expect(product).toHaveProperty('price');
    });
  });
});
```

---

## API Helper Pattern

```typescript
// tests/utils/apiHelpers.ts
export class ApiHelpers {
  constructor(private request: APIRequestContext) {}

  async get(endpoint: string): Promise<{ response: APIResponse; responseTime: number }> {
    const start = performance.now();
    const response = await this.request.get(endpoint);
    const responseTime = performance.now() - start;
    
    return { response, responseTime };
  }

  async post<T>(endpoint: string, data: T): Promise<{ response: APIResponse; responseTime: number }> {
    const start = performance.now();
    const response = await this.request.post(endpoint, { data });
    const responseTime = performance.now() - start;
    
    return { response, responseTime };
  }
}
```

---

## Error Response Testing

```typescript
test('API returns appropriate error responses', async ({ apiHelpers }) => {
  await test.step('404 for non-existent resource', async () => {
    const { response } = await apiHelpers.get('/products/nonexistent');
    expect(response.status()).toBe(404);
  });

  await test.step('401 for unauthorized access', async () => {
    const { response } = await apiHelpers.get('/admin/users');
    expect(response.status()).toBe(401);
  });

  await test.step('400 for invalid request body', async () => {
    const { response } = await apiHelpers.post('/products', { invalid: 'data' });
    expect(response.status()).toBe(400);
  });
});
```
