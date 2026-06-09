# Coding Standards

## Naming Conventions

| Pattern      | Usage                              |
|--------------|------------------------------------|
| camelCase    | variables, functions               |
| PascalCase   | classes, interfaces, types         |
| UPPER_CASE   | global constants                   |
| *.spec.ts    | test files                         |

---

## TypeScript Rules

* No `any` - use proper types or `unknown`
* Explicit return types where useful
* Prefer interfaces over types
* Use `async/await` - no raw Promises
* Use try/catch for risky operations

---

## Examples

```typescript
// ✅ Good - explicit types, clear naming
interface ProductData {
  id: string;
  name: string;
  price: number;
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

// ❌ Avoid - any type, unclear naming
async function getData(): Promise<any> {
  const r = await api.get('/products');
  return r.json();
}
```

---

## File Organization

* One component/class per file
* Group related files in feature folders
* Keep imports organized (external → internal → relative)
