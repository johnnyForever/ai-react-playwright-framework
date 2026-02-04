# Test Analytics Database Documentation

## Overview

The Test Analytics Database is a SQLite-based storage system for tracking test results, history, and performance metrics over time. It enables historical analysis, flakiness detection, and trend visualization.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Playwright     │────▶│   DB Reporter    │────▶│   SQLite DB     │
│  Test Runner    │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────────┐
                                                 │  Dashboard UI   │
                                                 │  (HTML/JS)      │
                                                 └─────────────────┘
```

## Components

### 1. Database (`tests/db/database.ts`)

The `TestDatabase` class provides:
- Singleton pattern for consistent access
- Schema initialization and migrations
- CRUD operations for all entities
- Analytics queries

### 2. DB Reporter (`tests/reporters/dbReporter.ts`)

Custom Playwright reporter that:
- Captures test results in real-time
- Stores metadata (git branch, commit, environment)
- Calculates pass rates and flakiness

### 3. Dashboard Module (`tests/reporters/dashboard/`)

Modular dashboard generator with separated concerns:

| File | Class | Responsibility |
|------|-------|----------------|
| `types.ts` | - | Type definitions (`DashboardData`, `DashboardConfig`, etc.) |
| `DashboardUtils.ts` | `DashboardUtils` | Static utilities: `formatDuration()`, `escapeHtml()`, etc. |
| `DashboardDataService.ts` | `DashboardDataService` | Data fetching from database |
| `HtmlTemplateEngine.ts` | `HtmlTemplateEngine` | HTML generation with section methods |
| `DashboardGenerator.ts` | `DashboardGenerator` | Main orchestrator class |
| `index.ts` | - | Module exports and CLI entry |

#### Usage

```typescript
// Simple usage (backward compatible)
import { generateDashboard } from './reporters/dashboardGenerator';
generateDashboard();

// Class-based usage
import { DashboardGenerator } from './reporters/dashboard';

// Static method
DashboardGenerator.generate(dbPath, outputPath);

// Instance with config
const generator = new DashboardGenerator({
  dbPath: './custom-path/analytics.db',
  outputPath: './reports/dashboard.html',
  recentRunsLimit: 30,
  flakyTestsLimit: 15,
});
generator.generate();
```

Interactive HTML dashboard showing:
- Recent test runs
- Pass rate trends
- Flaky tests
- Slowest tests
- Most failing tests

## Database Schema

### Test Runs Table

```sql
CREATE TABLE test_runs (
  run_id TEXT PRIMARY KEY,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  total_tests INTEGER DEFAULT 0,
  passed INTEGER DEFAULT 0,
  failed INTEGER DEFAULT 0,
  skipped INTEGER DEFAULT 0,
  flaky INTEGER DEFAULT 0,
  pass_rate REAL DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  branch TEXT,
  commit_sha TEXT,
  environment TEXT DEFAULT 'local',
  trigger TEXT DEFAULT 'manual',
  tags TEXT,
  browser TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Test Results Table

```sql
CREATE TABLE test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  test_id TEXT NOT NULL,
  test_name TEXT NOT NULL,
  test_file TEXT NOT NULL,
  test_tags TEXT,
  suite_name TEXT,
  browser TEXT,
  status TEXT NOT NULL,
  duration_ms INTEGER DEFAULT 0,
  error_message TEXT,
  error_stack TEXT,
  screenshot_path TEXT,
  video_path TEXT,
  trace_path TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES test_runs(run_id)
);
```

### Test History Table

```sql
CREATE TABLE test_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT UNIQUE NOT NULL,
  test_name TEXT NOT NULL,
  test_file TEXT NOT NULL,
  total_runs INTEGER DEFAULT 0,
  pass_count INTEGER DEFAULT 0,
  fail_count INTEGER DEFAULT 0,
  skip_count INTEGER DEFAULT 0,
  flaky_count INTEGER DEFAULT 0,
  avg_duration_ms REAL DEFAULT 0,
  min_duration_ms INTEGER,
  max_duration_ms INTEGER,
  last_status TEXT,
  last_run_at TEXT,
  last_failed_at TEXT,
  first_run_at TEXT,
  flakiness_score REAL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Log Entries Table

```sql
CREATE TABLE log_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id TEXT NOT NULL,
  test_id TEXT,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  metadata TEXT,
  FOREIGN KEY (run_id) REFERENCES test_runs(run_id)
);
```

## Usage

### Configuration

The DB Reporter is configured in `playwright.config.ts`:

```typescript
reporter: [
  // ... other reporters
  ['./tests/reporters/dbReporter.ts', {
    environment: process.env.TEST_ENVIRONMENT || 'local',
    trigger: process.env.TEST_TRIGGER || 'manual'
  }],
],
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TEST_ENVIRONMENT` | Environment name (local, staging, production) | `local` |
| `TEST_TRIGGER` | How tests were triggered (manual, ci, scheduled) | `manual` |
| `GITHUB_REF_NAME` | Git branch (auto-detected in CI) | - |
| `GITHUB_SHA` | Git commit SHA (auto-detected in CI) | - |

### Programmatic Access

```typescript
import { TestDatabase } from '../db/database';

// Get singleton instance
const db = TestDatabase.getInstance();

// Get recent test runs
const runs = db.getRecentTestRuns(10);

// Get test results for a run
const results = db.getTestResults(runId);

// Get failed tests
const failed = db.getFailedTests(runId);

// Get test history
const history = db.getTestHistory(testId);

// Analytics
const flakyTests = db.getFlakyTests(10);
const slowestTests = db.getSlowestTests(10);
const mostFailing = db.getMostFailingTests(10);
const stats = db.getOverallStats();
```

## Analytics Features

### Pass Rate Trends

Track pass rates over time:

```typescript
const runs = db.getRecentTestRuns(30);
const passRates = runs.map(r => ({
  date: r.startedAt,
  passRate: r.passRate
}));
```

### Flaky Test Detection

Tests are marked as flaky when they:
- Fail on first attempt
- Pass on retry

The flakiness score is calculated as:

```
flakinessScore = flakyCount / totalRuns * 100
```

### Slowest Tests

Identify performance bottlenecks:

```typescript
const slowest = db.getSlowestTests(10);
// Returns tests sorted by avgDurationMs descending
```

### Most Failing Tests

Identify problematic tests:

```typescript
const failing = db.getMostFailingTests(10);
// Returns tests sorted by failCount descending
```

## Dashboard

### Viewing Results

```bash
# Generate and open dashboard
npm run test:dashboard
```

The dashboard shows:

1. **Summary Cards**: Total runs, tests, avg pass rate, avg duration
2. **Recent Runs**: Table of last 20 test runs
3. **Flaky Tests**: Top 10 flakiest tests
4. **Slowest Tests**: Top 10 slowest tests
5. **Most Failing**: Top 10 most failing tests

### Dashboard Screenshot

```
┌─────────────────────────────────────────────────────────┐
│  📊 Test Analytics Dashboard                             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 156 Runs │ │ 8,234    │ │ 94.2%    │ │ 45.3s    │  │
│  │          │ │ Tests    │ │ Pass Rate│ │ Avg Time │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  Recent Test Runs                                       │
│  ───────────────────────────────────────────────────── │
│  Run ID    │ Date       │ Passed │ Failed │ Pass Rate │
│  abc123... │ 2026-02-04 │ 57     │ 1      │ 98.3%     │
│  def456... │ 2026-02-04 │ 58     │ 0      │ 100%      │
└─────────────────────────────────────────────────────────┘
```

## Database Location

```
test-results/
├── test-analytics.db    # SQLite database file
├── logs/
│   └── {runId}.jsonl    # Log files
└── junit.xml            # JUnit report
```

## Maintenance

### Clearing Old Data

```typescript
// Clear runs older than 30 days
db.clearOldRuns(30);
```

### Resetting Database

```bash
# Delete database file
rm .test-db/test-analytics.db

# Database will be recreated on next test run
```

### Backup

```bash
# Simple backup
cp .test-db/test-analytics.db .test-db/backup.db

# With timestamp
cp .test-db/test-analytics.db ".test-db/backup-$(date +%Y%m%d).db"
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run E2E Tests
  env:
    TEST_ENVIRONMENT: staging
    TEST_TRIGGER: ci
  run: npm run test:e2e

- name: Upload Test Results
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: test-analytics-db
    path: .test-db/test-analytics.db
    retention-days: 30
```

### Aggregating Results

For multi-job pipelines, aggregate databases:

```typescript
import Database from 'better-sqlite3';

// Attach and merge databases
const main = new Database('test-analytics.db');
main.exec('ATTACH "shard1.db" AS shard1');
main.exec('INSERT INTO test_runs SELECT * FROM shard1.test_runs');
main.exec('INSERT INTO test_results SELECT * FROM shard1.test_results');
```

## Querying with SQL

Direct SQL access for custom queries:

```bash
# Open database
sqlite3 .test-db/test-analytics.db

# Recent failures
SELECT test_name, error_message 
FROM test_results 
WHERE status = 'failed' 
ORDER BY created_at DESC 
LIMIT 10;

# Flaky test report
SELECT test_name, flaky_count, total_runs,
       ROUND(flaky_count * 100.0 / total_runs, 1) as flakiness
FROM test_history 
WHERE flaky_count > 0 
ORDER BY flakiness DESC;

# Pass rate by browser
SELECT browser, 
       COUNT(*) as total,
       SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) as passed,
       ROUND(SUM(CASE WHEN status = 'passed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as pass_rate
FROM test_results 
GROUP BY browser;
```

## Best Practices

1. **Keep history manageable**: Regularly clean old data to prevent database bloat.

2. **Use meaningful environments**: Distinguish between local, staging, and production runs.

3. **Track CI vs manual**: Use the `trigger` field to differentiate automated vs manual runs.

4. **Monitor flakiness**: Regularly review and fix flaky tests to maintain test reliability.

5. **Archive important runs**: Back up database before major cleanup operations.
