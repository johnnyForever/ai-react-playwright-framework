# API Testing (Mandatory)

## Principles

* Use Playwright's `APIRequestContext` for API testing
* Track response times for all requests
* Assert performance thresholds

---

## Performance Metrics

Track p50, p95, p99 response times.

### Thresholds per Endpoint Type

| Endpoint Type    | Threshold |
|------------------|-----------|
| Health check     | < 50ms    |
| Read operations  | < 200ms   |
| Write operations | < 300ms   |
| Auth operations  | < 300ms   |

---

## Test Categories

Use tags to categorize API tests:

* `@api` - All API tests
* `@smoke` - Critical path API tests
* `@performance` - Performance focused tests
* `@stress` - Load and stress tests

---

## Example API Test

```typescript
test('GET /products returns within threshold @api @smoke', async ({ apiHelpers }) => {
  const { response, responseTime } = await apiHelpers.get('/products');
  
  expect(response.ok()).toBeTruthy();
  expect(responseTime).toBeLessThan(200);
  
  const products = await response.json();
  expect(products).toBeInstanceOf(Array);
});
```
