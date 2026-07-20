# Reports & CI/CD

## Test Reports

| Report Type | Purpose | Format |
|-------------|---------|--------|
| HTML Report | Visual test results | `playwright-report/` |
| JUnit XML | CI/CD integration | `test-results/junit.xml` |
| Custom Dashboard | Analytics and trends | `test-results/dashboard/` |
| Performance Report | API metrics | `test-results/performance.json` |

**Note**: Reports are generated per execution and not committed to the repository.

---

## CI/CD Pipeline

### Pipeline Stages

1. **Install** — Install dependencies with `npm ci`
2. **Lint** — Run static analysis (Biome)
3. **Unit Tests** — Run Vitest unit tests
4. **API Tests** — Run Playwright API tests
5. **E2E Tests** — Run Playwright E2E tests
6. **Report** — Publish results and upload artifacts

---

## GitHub Actions Workflow

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run Playwright tests
        run: npm run test:e2e
      
      - name: Publish Test Results
        uses: dorny/test-reporter@v1
        if: always()
        with:
          name: Playwright Tests
          path: test-results/junit.xml
          reporter: java-junit
      
      - name: Upload test artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: |
            playwright-report/
            test-results/
          retention-days: 30
```

---

## Test Scripts

```json
{
  "scripts": {
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:api": "playwright test --project=api",
    "test:smoke": "playwright test --grep @smoke",
    "report": "playwright show-report"
  }
}
```

---

## Artifact Retention

| Artifact Type | Retention |
|--------------|-----------|
| HTML Reports | 30 days |
| Screenshots | 30 days |
| Traces | 7 days |
| JUnit XML | Until pipeline cleanup |
