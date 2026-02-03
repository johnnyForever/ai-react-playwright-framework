-- Test Framework Database Schema
-- Stores test run history, results, and metrics for analysis

-- Test Runs Table: Stores information about each test suite execution
CREATE TABLE IF NOT EXISTS test_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT UNIQUE NOT NULL,
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

-- Test Results Table: Individual test case results
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

-- Test History Table: Aggregated metrics per test for trend analysis
CREATE TABLE IF NOT EXISTS test_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    test_name TEXT UNIQUE NOT NULL,
    test_file TEXT NOT NULL,
    total_runs INTEGER DEFAULT 0,
    pass_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    skip_count INTEGER DEFAULT 0,
    avg_duration_ms REAL DEFAULT 0,
    min_duration_ms INTEGER DEFAULT 0,
    max_duration_ms INTEGER DEFAULT 0,
    flakiness_score REAL DEFAULT 0,
    last_status TEXT,
    last_run_at TEXT,
    last_failed_at TEXT,
    consecutive_failures INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Log Entries Table: Stores structured log entries from tests
CREATE TABLE IF NOT EXISTS log_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    run_id TEXT NOT NULL,
    test_id TEXT,
    timestamp TEXT NOT NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    step_name TEXT,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES test_runs(run_id)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_test_results_run_id ON test_results(run_id);
CREATE INDEX IF NOT EXISTS idx_test_results_status ON test_results(status);
CREATE INDEX IF NOT EXISTS idx_test_results_test_name ON test_results(test_name);
CREATE INDEX IF NOT EXISTS idx_test_history_flakiness ON test_history(flakiness_score DESC);
CREATE INDEX IF NOT EXISTS idx_log_entries_run_id ON log_entries(run_id);
CREATE INDEX IF NOT EXISTS idx_log_entries_test_id ON log_entries(test_id);
CREATE INDEX IF NOT EXISTS idx_test_runs_started_at ON test_runs(started_at DESC);
