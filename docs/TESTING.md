# Test Framework Documentation

## Overview

This test framework is built on Playwright and provides a robust, enterprise-grade testing solution with:

- **Page Object Model (POM)** pattern for maintainable tests
- **Custom fixtures** for page objects and logging
- **SQLite database** for historical test tracking
- **Custom HTML dashboard** for test analytics
- **CI/CD pipelines** for automated testing
- **Tag-based test filtering** for smoke and regression tests

## Quick Start

```bash
# Run all tests
npm run test:e2e

# Run smoke tests (quick feedback)
npm run test:smoke

# Run regression tests (full suite)
npm run test:regression

# Run tests with UI
npm run test:e2e:ui

# View test report
npm run test:e2e:report

# Generate analytics dashboard
npm run test:dashboard
```

## Test Tags

Tests are organized with tags for flexible execution:

| Tag | Description | Usage |
|-----|-------------|-------|
| `@smoke` | Critical path tests for quick feedback (~15 tests) | Quick validation |
| `@regression` | Full test suite | Complete validation |

### Running Tagged Tests

```bash
# Run only smoke tests
npx playwright test --grep @smoke

# Run only regression tests
npx playwright test --grep @regression

# Run smoke tests on specific browser
npx playwright test --grep @smoke --project=chromium
```

## Test Structure

```
tests/
├── db/                    # Database layer
│   ├── database.ts        # SQLite wrapper
│   └── schema.sql         # Database schema
├── e2e/                   # Test specifications
│   ├── login.spec.ts      # Login feature tests
│   ├── dashboard.spec.ts  # Dashboard tests
│   └── basket.spec.ts     # Basket/checkout tests
├── fixtures/              # Playwright fixtures
│   ├── auth.fixture.ts    # Page objects + logger
│   └── testData.ts        # Test data
├── pages/                 # Page Object Models
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── ProductDetailPage.ts
│   └── CheckoutPage.ts
├── reporters/             # Custom reporters
│   ├── dbReporter.ts      # Database reporter
│   └── dashboardGenerator.ts
├── scripts/               # CLI utilities
│   └── generateDashboard.ts
└── utils/                 # Utilities
    ├── logger.ts          # Custom logger
    └── testDataFactory.ts # Test data factory
```

## Custom Logger

The framework includes a custom logger fixture that automatically logs:
- Test start/end with status
- Step execution with timing
- Errors with stack traces

### Usage in Tests

```typescript
test('example test', async ({ logger, dashboardPage }) => {
  // Logger is automatically initialized
  
  // Use test.step for readable reports
  await test.step('Navigate to dashboard', async () => {
    await dashboardPage.navigate();
  });
  
  // Manual logging if needed
  logger.info('Custom log message');
  logger.warn('Warning message');
  logger.error('Error occurred', new Error('details'));
});
```

## Database Analytics

Test results are stored in SQLite for historical analysis.

### Available Reports

```bash
# Generate HTML dashboard
npm run test:dashboard

# View test statistics
npm run test:stats

# List flaky tests
npm run test:flaky

# All CLI options
npx ts-node tests/scripts/generateDashboard.ts help
```

### Database Schema

| Table | Description |
|-------|-------------|
| `test_runs` | Test execution metadata (duration, pass rate, etc.) |
| `test_results` | Individual test outcomes |
| `test_history` | Aggregated metrics per test |
| `log_entries` | Structured log entries |

## CI/CD Pipelines

### On PR Merge (`test-on-merge.yml`)

Automatically runs all tests when a PR is merged to main:
- Runs full regression suite
- Generates test dashboard
- Uploads artifacts (reports, screenshots)
- Comments on commit if tests fail

### On Demand (`test-on-demand.yml`)

Manual workflow dispatch with configurable options:
- **Browser**: chromium, firefox, webkit, or all
- **Tags**: @smoke, @regression, or all
- **Environment**: local, staging, production
- **Retries**: 0-3
- **Debug mode**: Enable traces on all tests

## Configuration

### Environment Variables

Create a `.env` file with test credentials:

```env
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=password123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=admin123
```

### Playwright Config

Key settings in `playwright.config.ts`:

```typescript
{
  testDir: './tests/e2e',
  retries: process.env.CI ? 2 : 0,
  reporter: [
    ['html'],
    ['./tests/reporters/dbReporter.ts'],  // Custom DB reporter
  ],
  projects: [
    { name: 'smoke', grep: /@smoke/ },    // Quick smoke tests
    { name: 'chromium' },
    { name: 'firefox' },
    { name: 'webkit' },
  ],
}
```

## Best Practices

1. **Use test.step()** for readable reports
2. **Tag tests appropriately** (@smoke for critical, @regression for all)
3. **Use Page Objects** for element interactions
4. **Use Test Data Factory** for dynamic data
5. **Check the dashboard** regularly for flaky tests

## Business Value

| Feature | Value |
|---------|-------|
| Smoke tests | Quick feedback loop (~2 min) |
| Historical tracking | Identify trends and regressions |
| Flaky test detection | Improve test reliability |
| CI/CD integration | Automated quality gates |
| On-demand testing | Flexible test execution |
| Dashboard analytics | Data-driven decisions |
