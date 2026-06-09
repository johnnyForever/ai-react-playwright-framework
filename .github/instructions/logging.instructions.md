# Logging & Debugging (Mandatory)

## What Is Logged

* High-level UI actions
* Test start / end
* Errors with stack traces
* Screenshots on UI failures
* Trace enabled on first retry

---

## Rules

* No secrets in logs
* One log file per execution

---

## Assertions & Error Handling

### Assertion Guidelines

* Use Playwright `expect`
* One logical assertion per check
* Descriptive assertion messages

### On Failure

* Screenshot captured
* Trace available

---

## Example Logging

```typescript
// tests/utils/logger.ts
export const logger = {
  info: (message: string) => console.log(`[INFO] ${timestamp()} ${message}`),
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${timestamp()} ${message}`);
    if (error?.stack) console.error(error.stack);
  },
  action: (action: string) => console.log(`[ACTION] ${timestamp()} ${action}`)
};
```

---

## Example Assertion

```typescript
// ✅ Good - descriptive message
await expect(page.getByRole('heading')).toHaveText('Dashboard', {
  message: 'Dashboard heading should be visible after login'
});

// ❌ Avoid - no context on failure
await expect(heading).toBeVisible();
```
