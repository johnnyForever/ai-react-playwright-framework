# Test Data Management

## Principles

* Tests must be isolated
* No dependency between tests
* No leftover data after execution

---

## Data Generation

* Use factories and fixtures
* Store data in project database (passwords should be encrypted)
* Randomized but deterministic when required (seeded)
* Never hardcode credentials or IDs (use dotenv)

---

## Playwright Storage State

* Use Playwright `storageState` for authenticated sessions
* Regenerate state when expired
* Store outside repo or regenerate dynamically

---

## Example Factory Pattern

```typescript
// tests/utils/testDataFactory.ts
export function createTestUser(overrides?: Partial<User>): User {
  return {
    id: crypto.randomUUID(),
    email: `test-${Date.now()}@example.com`,
    password: generateSecurePassword(),
    ...overrides
  };
}
```

---

## Environment Variables

```env
# .env.test (not committed)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=encrypted_value
API_BASE_URL=http://localhost:3000
```
