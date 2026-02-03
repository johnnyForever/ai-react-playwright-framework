/**
 * SQL Query Constants
 * Centralized SQL queries for the test analytics database
 */

// =============================================================================
// Schema Initialization
// =============================================================================

export const SCHEMA_INIT = `
  CREATE TABLE IF NOT EXISTS test_runs (
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

  CREATE TABLE IF NOT EXISTS test_results (
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

  CREATE TABLE IF NOT EXISTS test_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_id TEXT NOT NULL UNIQUE,
    test_name TEXT NOT NULL,
    test_file TEXT NOT NULL,
    total_runs INTEGER DEFAULT 0,
    pass_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0,
    flaky_count INTEGER DEFAULT 0,
    avg_duration_ms REAL DEFAULT 0,
    min_duration_ms INTEGER DEFAULT 0,
    max_duration_ms INTEGER DEFAULT 0,
    last_status TEXT,
    last_run_at TEXT,
    last_failed_at TEXT,
    first_run_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS log_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    test_id TEXT,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    metadata TEXT,
    FOREIGN KEY (run_id) REFERENCES test_runs(run_id)
  );

  CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
  CREATE INDEX IF NOT EXISTS idx_test_results_test_id ON test_results(test_id);
  CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
  CREATE INDEX IF NOT EXISTS idx_test_history_test_id ON test_history(test_id);
  CREATE INDEX IF NOT EXISTS idx_log_entries_run_id ON log_entries(run_id);
`;

// =============================================================================
// Test Runs Queries
// =============================================================================

export const INSERT_TEST_RUN = `
  INSERT INTO test_runs (
    run_id, started_at, total_tests, passed, failed, skipped, flaky,
    pass_rate, duration_ms, branch, commit_sha, environment, trigger, tags, browser
  ) VALUES (
    @runId, @startedAt, @totalTests, @passed, @failed, @skipped, @flaky,
    @passRate, @durationMs, @branch, @commitSha, @environment, @trigger, @tags, @browser
  )
`;

export const UPDATE_TEST_RUN = `
  UPDATE test_runs SET
    finished_at = @finishedAt,
    total_tests = @totalTests,
    passed = @passed,
    failed = @failed,
    skipped = @skipped,
    flaky = @flaky,
    pass_rate = @passRate,
    duration_ms = @durationMs
  WHERE run_id = @runId
`;

export const SELECT_TEST_RUN_BY_ID = `
  SELECT * FROM test_runs WHERE run_id = ?
`;

export const SELECT_RECENT_RUNS = `
  SELECT * FROM test_runs ORDER BY created_at DESC LIMIT ?
`;

// =============================================================================
// Test Results Queries
// =============================================================================

export const INSERT_TEST_RESULT = `
  INSERT INTO test_results (
    run_id, test_id, test_name, test_file, test_tags, suite_name, browser,
    status, duration_ms, error_message, error_stack, screenshot_path, video_path, trace_path, retry_count
  ) VALUES (
    @runId, @testId, @testName, @testFile, @testTags, @suiteName, @browser,
    @status, @durationMs, @errorMessage, @errorStack, @screenshotPath, @videoPath, @tracePath, @retryCount
  )
`;

export const SELECT_RESULTS_BY_RUN = `
  SELECT * FROM test_results WHERE run_id = ? ORDER BY created_at
`;

export const SELECT_FAILED_TESTS_BY_RUN = `
  SELECT * FROM test_results WHERE run_id = ? AND status = 'failed' ORDER BY created_at
`;

// =============================================================================
// Test History Queries
// =============================================================================

export const SELECT_HISTORY_BY_TEST_ID = `
  SELECT * FROM test_history WHERE test_id = ?
`;

export const UPDATE_TEST_HISTORY = `
  UPDATE test_history SET
    total_runs = total_runs + 1,
    pass_count = pass_count + @passed,
    fail_count = fail_count + @failed,
    skip_count = skip_count + @skipped,
    flaky_count = flaky_count + @flaky,
    avg_duration_ms = (avg_duration_ms * (total_runs) + @durationMs) / (total_runs + 1),
    min_duration_ms = CASE WHEN @durationMs < min_duration_ms OR min_duration_ms = 0 THEN @durationMs ELSE min_duration_ms END,
    max_duration_ms = CASE WHEN @durationMs > max_duration_ms THEN @durationMs ELSE max_duration_ms END,
    last_status = @lastStatus,
    last_run_at = @lastRunAt,
    last_failed_at = CASE WHEN @failed = 1 THEN @lastRunAt ELSE last_failed_at END,
    updated_at = CURRENT_TIMESTAMP
  WHERE test_id = @testId
`;

export const INSERT_TEST_HISTORY = `
  INSERT INTO test_history (
    test_id, test_name, test_file, total_runs, pass_count, fail_count,
    skip_count, flaky_count, avg_duration_ms, min_duration_ms, max_duration_ms,
    last_status, last_run_at, last_failed_at, first_run_at
  ) VALUES (
    @testId, @testName, @testFile, 1, @passed, @failed, @skipped, @flaky,
    @durationMs, @durationMs, @durationMs, @lastStatus, @lastRunAt,
    CASE WHEN @failed = 1 THEN @lastRunAt ELSE NULL END, @lastRunAt
  )
`;

// =============================================================================
// Analytics Queries
// =============================================================================

export const SELECT_FLAKY_TESTS = `
  SELECT *,
    CAST(fail_count AS REAL) / CAST(total_runs AS REAL) * 100 as flakiness_score
  FROM test_history
  WHERE total_runs >= 2 AND fail_count > 0 AND pass_count > 0
  ORDER BY flakiness_score DESC
  LIMIT ?
`;

export const SELECT_SLOWEST_TESTS = `
  SELECT * FROM test_history
  WHERE total_runs > 0
  ORDER BY avg_duration_ms DESC
  LIMIT ?
`;

export const SELECT_MOST_FAILING_TESTS = `
  SELECT *,
    CAST(fail_count AS REAL) / CAST(total_runs AS REAL) * 100 as failure_rate
  FROM test_history
  WHERE total_runs >= 2 AND fail_count > 0
  ORDER BY fail_count DESC
  LIMIT ?
`;

export const SELECT_OVERALL_STATS = `
  SELECT
    COUNT(*) as total_runs,
    COALESCE(SUM(total_tests), 0) as total_tests,
    COALESCE(AVG(pass_rate), 0) as avg_pass_rate,
    COALESCE(AVG(duration_ms), 0) as avg_duration
  FROM test_runs
`;

// =============================================================================
// Log Entries Queries
// =============================================================================

export const INSERT_LOG_ENTRY = `
  INSERT INTO log_entries (run_id, test_id, level, message, timestamp, metadata)
  VALUES (@runId, @testId, @level, @message, @timestamp, @metadata)
`;

export const SELECT_LOGS_BY_RUN = `
  SELECT * FROM log_entries WHERE run_id = ? ORDER BY timestamp
`;

export const SELECT_LOGS_BY_TEST = `
  SELECT * FROM log_entries WHERE run_id = ? AND test_id = ? ORDER BY timestamp
`;
