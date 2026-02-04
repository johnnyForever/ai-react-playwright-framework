# Custom Test Logger Documentation

## Overview

The `TestLogger` is a structured logging utility designed for Playwright tests. It provides color-coded console output, automatic file persistence, step tracking with timing, and integration with the test database.

## Features

- **Multi-level logging**: debug, info, warn, error, step
- **Color-coded console output**: Easy visual distinction between log levels
- **Automatic file persistence**: JSONL format for easy parsing
- **Step tracking**: Group related operations with automatic timing
- **Test lifecycle integration**: Automatic logging of test start/end
- **Database integration**: Logs can be exported for DB storage

## Installation

The logger is included in the test framework. Import it from the test utilities:

```typescript
import { TestLogger } from '../utils/logger';
```

Or use it via the custom fixture:

```typescript
import { test } from '../fixtures/base.fixture';

test('example test', async ({ page, logger }) => {
  logger.info('Starting test');
  // ... test code
});
```

## Usage

### Basic Logging

```typescript
const logger = new TestLogger(runId, testInfo);

// Different log levels
logger.debug('Detailed debugging information');
logger.info('General information');
logger.warn('Warning - potential issue');
logger.error('Error occurred', new Error('Something went wrong'));
```

### Logging with Metadata

Pass additional context as the second parameter:

```typescript
logger.info('User logged in', { 
  userId: 123, 
  email: 'user@example.com' 
});

logger.error('API request failed', error, { 
  endpoint: '/api/users',
  statusCode: 500 
});
```

### Step Tracking

Group related operations and automatically track timing:

```typescript
// Manual step management
logger.stepStart('Fill login form');
await page.fill('#email', 'user@example.com');
await page.fill('#password', 'password');
logger.stepEnd(true); // true = success

// Automatic step with async function
await logger.step('Submit and verify', async () => {
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Test Lifecycle Logging

```typescript
test.beforeEach(async ({ logger }) => {
  logger.testStart();
});

test.afterEach(async ({ logger }) => {
  logger.testEnd();
});
```

### Screenshot Attachment

```typescript
const screenshotPath = await page.screenshot({ path: 'error.png' });
logger.attachScreenshot(screenshotPath);
```

## Log Levels

| Level | Color | Description |
|-------|-------|-------------|
| `debug` | Gray | Detailed debugging information |
| `info` | Cyan | General informational messages |
| `warn` | Yellow | Warning conditions |
| `error` | Red | Error conditions with optional stack trace |
| `step` | Magenta | Step start/end markers with timing |

## Log Message Structure

Each log message contains:

```typescript
interface LogMessage {
  timestamp: string;      // ISO 8601 timestamp
  level: LogLevel;        // debug | info | warn | error | step
  message: string;        // The log message
  testName?: string;      // Current test name
  testFile?: string;      // Test file name
  testId?: string;        // Playwright test ID
  runId?: string;         // Test run ID
  stepName?: string;      // Current step name (if in a step)
  duration?: number;      // Step duration in ms
  metadata?: object;      // Additional context data
}
```

## File Output

Logs are automatically written to JSONL files:

```
test-results/
└── logs/
    └── {runId}.jsonl
```

Each line is a valid JSON object, making it easy to parse and analyze:

```bash
# View logs for a specific run
cat test-results/logs/abc123.jsonl | jq .

# Filter errors only
cat test-results/logs/abc123.jsonl | jq 'select(.level == "error")'
```

## Console Output

Console output is color-coded and formatted:

```
[INFO] [should login successfully] Initializing LoginPage
[STEP] [should login successfully][Fill credentials] ▶ Starting: Fill credentials
[DEBUG] [should login successfully][Fill credentials] Filling email field
[STEP] [should login successfully][Fill credentials] ✓ Completed: Fill credentials (234ms)
[INFO] [should login successfully] Test passed: should login successfully (1523ms)
```

## Integration with Test Fixtures

The logger is automatically available in tests via fixtures:

```typescript
// tests/fixtures/base.fixture.ts
import { test as base } from '@playwright/test';
import { TestLogger } from '../utils/logger';

export const test = base.extend<{ logger: TestLogger }>({
  logger: async ({ }, use, testInfo) => {
    const runId = process.env.RUN_ID || 'local';
    const logger = new TestLogger(runId, testInfo);
    logger.testStart();
    
    await use(logger);
    
    logger.testEnd();
  },
});
```

## Database Export

Get logs formatted for database insertion:

```typescript
const dbEntries = logger.getDbEntries();
// Returns array of log entries ready for DB insertion
```

## Best Practices

1. **Use appropriate log levels**: Debug for detailed troubleshooting, info for general flow, warn for recoverable issues, error for failures.

2. **Include context**: Always add relevant metadata to help with debugging.

3. **Use steps for grouping**: Wrap related operations in steps for clear timing and organization.

4. **Don't log sensitive data**: Avoid logging passwords, tokens, or PII.

5. **Clear logs when needed**: Use `logger.clear()` to reset logs if needed between tests.

## Example Test

```typescript
import { test, expect } from '../fixtures/base.fixture';

test('complete checkout flow', async ({ page, logger }) => {
  await logger.step('Add item to cart', async () => {
    await page.click('[data-testid="add-to-cart"]');
    logger.info('Item added', { productId: 'ABC123' });
  });

  await logger.step('Proceed to checkout', async () => {
    await page.click('[data-testid="checkout-button"]');
    await expect(page).toHaveURL(/checkout/);
  });

  await logger.step('Complete payment', async () => {
    await page.fill('#card-number', '4111111111111111');
    await page.click('#submit-payment');
    
    try {
      await expect(page.locator('.success')).toBeVisible();
      logger.info('Payment successful');
    } catch (error) {
      logger.error('Payment failed', error as Error);
      throw error;
    }
  });
});
```
