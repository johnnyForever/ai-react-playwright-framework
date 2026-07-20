# Logging & Debugging

## What Gets Logged

| Event Type | Details |
|------------|---------|
| Test lifecycle | Test start, end, duration |
| UI actions | High-level actions (click, fill, navigate) |
| Errors | Full stack traces with context |
| Failures | Screenshots captured automatically |
| Retries | Trace enabled on first retry |

---

## Logging Rules

- **No secrets**: Never log passwords, tokens, or sensitive data
- **One log file per execution**: Centralized output for debugging
- **Structured format**: Timestamp, level, and message

---

## Logger Implementation

```typescript
// tests/utils/logger.ts
const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string) => 
    console.log(`[INFO] ${timestamp()} ${message}`),
  
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${timestamp()} ${message}`);
    if (error?.stack) console.error(error.stack);
  },
  
  action: (action: string) => 
    console.log(`[ACTION] ${timestamp()} ${action}`),
  
  step: (step: string) => 
    console.log(`[STEP] ${timestamp()} ${step}`)
};
```

---

## Assertion Best Practices

Use descriptive messages to provide context on failure:

```typescript
// RECOMMENDED - Descriptive assertion messages
await expect(page.getByRole('heading')).toHaveText('Dashboard', {
  message: 'Dashboard heading should be visible after successful login'
});

await expect(basketCount).toHaveText('3', {
  message: 'Basket should show 3 items after adding products'
});

// ACCEPTABLE - Self-documenting assertions
await expect(dashboardPage.headerTitle).toBeVisible();
await expect(loginPage.errorMessage).toContainText('Invalid');

// AVOID - No context on failure
await expect(heading).toBeVisible();
await expect(count).toBe(3);
```

---

## Failure Artifacts

On test failure, Playwright automatically captures:

| Artifact | Location |
|----------|----------|
| Screenshots | `test-results/` |
| Traces | `test-results/` (on retry) |
| Videos | `test-results/` (if enabled) |

---

## Debug Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
});
```
