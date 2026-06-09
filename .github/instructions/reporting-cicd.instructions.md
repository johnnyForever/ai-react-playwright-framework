# Reports & CI/CD

## Reports & Artifacts

* HTML report generated per run
* Reports are not committed
* Stored per execution
* JUnit XML for CI integration (published to GitHub Actions UI via `dorny/test-reporter`)
* Custom HTML dashboard for analytics
* API performance reports with metrics

---

## CI/CD Pipeline Steps

1. Install dependencies
2. Run static analysis
3. Execute tests (unit, API, E2E)
4. Publish JUnit results to GitHub Actions UI
5. Generate test dashboard
6. Upload artifacts (reports, screenshots)
7. Archive logs

---

## GitHub Actions Example

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
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: |
            playwright-report/
            test-results/
```
