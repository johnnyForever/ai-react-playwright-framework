# Test Data Management

## Principles

- **Test isolation**: Each test manages its own data, no cross-test dependencies
- **Clean state**: No leftover data after execution
- **Security**: Never hardcode credentials; use environment variables

---

## Data Generation

| Approach | Use Case |
|----------|----------|
| Factory functions | Dynamic test data with defaults |
| Fixtures | Reusable test setup and teardown |
| Environment variables | Credentials and configuration |
| Seeded randomization | Deterministic yet unique data |

---

## Factory Pattern

```typescript
// tests/utils/testDataFactory.ts
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    email: `test-${Date.now()}@example.com`,
    password: generateSecurePassword(),
    role: 'user',
    ...overrides
  };
}

export function createTestProduct(overrides?: Partial<Product>): Product {
  return {
    id: crypto.randomUUID(),
    name: `Test Product ${Date.now()}`,
    price: Math.floor(Math.random() * 100) + 10,
    ...overrides
  };
}
```

---

## Playwright Storage State

Use `storageState` for efficient authenticated test sessions:

```typescript
// tests/auth/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill(process.env.TEST_USER_EMAIL!);
  await page.getByLabel('Password').fill(process.env.TEST_USER_PASSWORD!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('/dashboard');
  
  await page.context().storageState({ path: '.auth/user.json' });
});
```

---

## Environment Variables

```env
# .env.test (not committed to repository)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=encrypted_value
API_BASE_URL=http://localhost:3000
```

---

## Test Data Fixtures

```typescript
// tests/fixtures/testData.ts
export const validUser = {
  email: process.env.TEST_USER_EMAIL!,
  password: process.env.TEST_USER_PASSWORD!,
};

export const testProducts = [
  { id: 'prod-1', name: 'Widget', price: 29.99 },
  { id: 'prod-2', name: 'Gadget', price: 49.99 },
];
```
