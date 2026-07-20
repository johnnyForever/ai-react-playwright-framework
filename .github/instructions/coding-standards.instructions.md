# Coding Standards

> **Note**: TypeScript rules here apply to all code (frontend, API, tests). For test-specific patterns, see [page-object-model.instructions.md](page-object-model.instructions.md).

## Naming Conventions

| Pattern | Usage | Example |
|---------|-------|---------|
| `camelCase` | Variables, functions | `userName`, `fetchProducts()` |
| `PascalCase` | Classes, interfaces, types, components | `LoginPage`, `UserData` |
| `UPPER_CASE` | Global constants | `API_BASE_URL`, `MAX_RETRIES` |
| `*.spec.ts` | Test files | `login.spec.ts`, `basket.spec.ts` |
| `*.test.ts` | Unit test files | `validation.test.ts` |

---

## TypeScript Rules

| Rule | Rationale |
|------|-----------|
| No `any` | Use proper types or `unknown` for safety |
| Explicit return types | Improve readability where useful |
| Prefer interfaces | Over type aliases for object shapes |
| Async/await | No raw Promise chains |
| Try/catch | Wrap risky operations with proper error handling |

---

## Code Examples

```typescript
// RECOMMENDED
interface ProductData {
  id: string;
  name: string;
  price: number;
  category?: string;
}

async function fetchProducts(): Promise<ProductData[]> {
  try {
    const response = await api.get('/products');
    return response.json();
  } catch (error) {
    logger.error('Failed to fetch products', error as Error);
    throw error;
  }
}

// AVOID
async function getData(): Promise<any> {
  const r = await api.get('/products');
  return r.json();
}
```

---

## File Organization

| Rule | Description |
|------|-------------|
| Single responsibility | One component/class per file |
| Feature grouping | Related files in feature folders |
| Import ordering | External → Internal → Relative |
| Barrel exports | Use `index.ts` for clean imports |

```typescript
// Import ordering example
import { expect, test } from '@playwright/test';      // External
import { logger } from '@tests/utils/logger';          // Internal (path alias)
import { LoginPage } from '../pages/LoginPage';        // Relative
```

---

## Error Handling

```typescript
// RECOMMENDED - Specific error handling
try {
  await loginPage.login(email, password);
} catch (error) {
  if (error instanceof TimeoutError) {
    logger.error('Login timed out', error);
    throw new Error('Login failed: page did not respond');
  }
  throw error;
}

// AVOID - Silent failures
try {
  await loginPage.login(email, password);
} catch {
  // Swallowed error - debugging nightmare
}
```
