# Test Framework Documentation

## Overview

This project includes a comprehensive testing strategy with **unit tests**, **E2E tests**, and **API tests**:

### Unit Testing (Vitest + React Testing Library)
- **173 unit tests** covering components, hooks, services, and utilities
- Fast feedback loop with watch mode
- Component testing with React Testing Library
- Mock utilities for isolated testing

### E2E Testing (Playwright)
- **Page Object Model (POM)** pattern for maintainable tests
- **Custom fixtures** for page objects and logging
- **SQLite database** for historical test tracking
- **Custom HTML dashboard** for test analytics
- **CI/CD pipelines** for automated testing
- **Tag-based test filtering** for smoke and regression tests

### API Testing (Playwright + Express)
- **40 API tests** covering REST endpoints with JWT authentication
- **Performance metrics** with response time tracking (p50, p95, p99)
- **Stress tests** for burst and sustained load scenarios
- **Custom ApiHelper** class with configurable thresholds

## Quick Start

### Unit Tests
```bash
# Run unit tests in watch mode
npm run test

# Run unit tests once
npm run test -- --run

# Run with visual UI
npm run test:ui

# Run with coverage
npm run test -- --coverage
```

### E2E Tests
```bash
# Run all E2E tests
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

### API Tests
```bash
# Start API server standalone
npm run api:start

# Run all API tests
npm run test:api

# Run API performance tests only
npm run test:api:perf

# Run API tests with specific tag
npx playwright test --project=api --grep @smoke
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

### Unit Tests (src/)

Unit tests are co-located with their source files using the `*.test.ts(x)` naming convention:

```
src/
├── lib/
│   ├── validation.ts           # Validation utilities
│   └── validation.test.ts      # 14 tests
├── services/
│   ├── authService.ts          # Auth service
│   └── authService.test.ts     # 15 tests
├── components/
│   ├── Navigation/
│   │   └── Navigation.test.tsx # 12 tests
│   └── ProtectedRoute/
│       └── ProtectedRoute.test.tsx # 5 tests
├── features/
│   ├── auth/components/
│   │   └── LoginForm.test.tsx  # 21 tests
│   ├── basket/
│   │   ├── BasketContext.test.tsx # 13 tests
│   │   └── BasketIcon.test.tsx # 7 tests
│   ├── checkout/
│   │   └── CheckoutContent.test.tsx # 20 tests
│   └── dashboard/components/
│       ├── ProductCard.test.tsx # 14 tests
│       ├── ProductList.test.tsx # 10 tests
│       ├── SortSelector.test.tsx # 8 tests
│       └── DashboardHeader.test.tsx # 10 tests
└── test/
    ├── setup.ts               # Test setup (jest-dom)
    └── testUtils.tsx          # Custom render utilities
```

### E2E Tests (tests/)

```
tests/
├── api/                   # API test specifications
│   ├── auth.api.spec.ts   # Auth API tests (14 tests)
│   ├── products.api.spec.ts # Products API tests (11 tests)
│   └── performance.api.spec.ts # Performance tests (15 tests)
├── auth/                  # Authentication setup
│   ├── auth.setup.ts      # Storage state setup
│   └── constants.ts       # Auth constants
├── config/                # Test configuration
│   └── credentials.ts     # Credential helpers
├── data/                  # Test data
│   └── credentials.ts     # Test credentials
├── db/                    # Database layer
│   ├── database.ts        # SQLite wrapper
│   ├── queries.ts         # SQL queries
│   └── schema.sql         # Database schema
├── e2e/                   # E2E test specifications
│   ├── login.spec.ts      # Login feature tests
│   ├── dashboard.spec.ts  # Dashboard tests
│   └── basket.spec.ts     # Basket/checkout tests
├── fixtures/              # Playwright fixtures
│   ├── auth.fixture.ts    # Page objects + logger
│   ├── api.fixture.ts     # API test fixture
│   └── testData.ts        # Test data
├── pages/                 # Page Object Models
│   ├── BasePage.ts        # Base page class
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   ├── ProductDetailPage.ts
│   ├── CheckoutPage.ts
│   └── index.ts           # Page exports
├── reporters/             # Custom reporters
│   ├── dbReporter.ts      # Database reporter
│   ├── dashboardGenerator.ts
│   └── dashboard/         # Dashboard modules
│       ├── DashboardGenerator.ts
│       ├── DashboardDataService.ts
│       ├── HtmlTemplateEngine.ts
│       └── types.ts
├── scripts/               # CLI utilities
│   └── generateDashboard.ts
└── utils/                 # Utilities
    ├── logger.ts          # Custom logger
    ├── apiHelpers.ts      # API testing utilities
    ├── crypto.ts          # Encryption utilities
    └── testDataFactory.ts # Test data factory
```

## Unit Test Utilities

The project includes custom test utilities in `src/test/testUtils.tsx`:

### Custom Render Functions

```typescript
import { renderWithRouter, renderWithBasket, renderWithProviders } from '@/test/testUtils';

// Render with React Router
renderWithRouter(<MyComponent />, { initialEntries: ['/dashboard'] });

// Render with Basket Context
renderWithBasket(<ProductCard product={mockProduct} />);

// Render with all providers
renderWithProviders(<App />);
```

### Mock Factories

```typescript
import { createMockProduct, createMockUser } from '@/test/testUtils';

// Create mock data with defaults or overrides
const product = createMockProduct({ price: 99.99 });
const admin = createMockUser({ role: 'admin' });
```

### Writing Unit Tests

```typescript
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithBasket } from '@/test/testUtils';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('should add product to basket when clicking add button', async () => {
    const user = userEvent.setup();
    renderWithBasket(<ProductCard product={mockProduct} />);

    await user.click(screen.getByText('Add to Basket'));

    expect(screen.getByText('Remove from Basket')).toBeInTheDocument();
  });
});
```

## API Testing

The project includes a comprehensive API testing framework with performance metrics.

### API Server

The Express.js API server (`api/server.ts`) provides:
- JWT authentication with login/logout/refresh
- Products CRUD operations (admin-only for create/update/delete)
- Health check endpoint
- Performance test endpoints (slow/fast)

### Available Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |
| GET | `/api/products` | No | List all products |
| GET | `/api/products/:id` | No | Get product by ID |
| GET | `/api/products/search` | No | Search products |
| POST | `/api/auth/login` | No | Authenticate user |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |
| POST | `/api/auth/refresh` | Yes | Refresh token |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |

### API Helper Class

The `ApiHelper` class (`tests/utils/apiHelpers.ts`) provides:

```typescript
import { test, expect } from '../fixtures/api.fixture';

test('should return products', async ({ api }) => {
  const { response, data, metrics } = await api.get('/api/products');
  
  expect(response.status()).toBe(200);
  expect(data.data).toBeInstanceOf(Array);
  expect(metrics.responseTime).toBeLessThan(200);
});
```

### Performance Metrics

The API helper tracks response times and calculates percentiles:

```typescript
// After running multiple requests
const stats = api.calculateStats();
// { count, min, max, avg, p50, p95, p99 }

// Assert performance thresholds
const result = api.assertPerformance({
  maxResponseTime: 500,  // Max 500ms
  p95ResponseTime: 200,  // 95th percentile < 200ms
  p99ResponseTime: 400,  // 99th percentile < 400ms
});

expect(result.passed).toBe(true);
```

### Performance Report

Generate a detailed report after tests:

```typescript
const report = api.generateReport();
// === API Performance Report ===
// Total Requests: 50
// Response Times:
//   Min: 5ms, Max: 120ms, Avg: 25ms
//   P50: 20ms, P95: 80ms, P99: 110ms
// By Endpoint:
//   GET /api/products: 20 requests, avg 15ms
//   POST /api/auth/login: 10 requests, avg 45ms
```

### Test Tags for API Tests

| Tag | Description |
|-----|-------------|
| `@api` | All API tests |
| `@smoke` | Critical API tests for quick feedback |
| `@performance` | Performance-focused tests |
| `@stress` | Stress and load tests |

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

### Test Results in GitHub UI

Both pipelines publish JUnit test results directly to GitHub Actions using `dorny/test-reporter`. After each run, you'll see:

- **Check run** with test summary (passed/failed/skipped counts)
- **Clickable test names** linking to failure details
- **Error messages** displayed inline for failed tests

### On PR Merge (`test-on-merge.yml`)

Automatically runs all tests when a PR is merged to main:
- Runs full regression suite
- Publishes JUnit results to GitHub Actions UI
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
- **JUnit publishing**: Results visible in GitHub Actions UI

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
    ['html'],                              // Interactive HTML report
    ['junit', { outputFile: 'test-results/junit.xml' }],  // For CI integration
    ['list'],                              // Console output
    ['./tests/reporters/dbReporter.ts'],   // Custom DB reporter for analytics
  ],
  projects: [
    { name: 'api' },                      // API tests (no browser)
    { name: 'setup' },                    // Auth setup
    { name: 'chromium-no-auth' },         // Login tests
    { name: 'smoke', grep: /@smoke/ },    // Quick smoke tests
    { name: 'chromium' },                 // Desktop Chrome
    { name: 'webkit' },                   // Desktop Safari
    { name: 'mobile-chrome' },            // Mobile Chrome (Pixel 7)
  ],
}
```

## Best Practices

1. **Use test.step()** for readable reports
2. **Tag tests appropriately** (@smoke for critical, @regression for all)
3. **Use Page Objects** for element interactions
4. **Use Test Data Factory** for dynamic data
5. **Check the dashboard** regularly for flaky tests
6. **Monitor API performance** with threshold assertions
7. **Run stress tests** before releases to catch performance regressions

## Business Value

| Feature | Value |
|---------|-------|
| Unit tests (173) | Instant feedback on component changes |
| API tests (40) | Validate backend contracts and performance |
| Performance metrics | Track response times (p50, p95, p99) |
| Stress tests | Ensure stability under load |
| Smoke tests | Quick E2E feedback loop (~2 min) |
| Historical tracking | Identify trends and regressions |
| Flaky test detection | Improve test reliability |
| CI/CD integration | Automated quality gates |
| On-demand testing | Flexible test execution |
| Dashboard analytics | Data-driven decisions |
