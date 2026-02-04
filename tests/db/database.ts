/**
 * Test Analytics Database
 * SQLite database for storing and querying test results, history, and logs
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import * as queries from './queries';

// =============================================================================
// Interfaces
// =============================================================================

export interface TestRun {
  runId: string;
  startedAt: string;
  finishedAt?: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  flaky: number;
  passRate: number;
  durationMs: number;
  branch?: string;
  commitSha?: string;
  environment: string;
  trigger: string;
  tags?: string;
  browser?: string;
  createdAt?: string;
}

export interface TestResult {
  id?: number;
  runId: string;
  testId: string;
  testName: string;
  testFile: string;
  testTags?: string;
  suiteName?: string;
  browser: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut' | 'interrupted';
  durationMs: number;
  errorMessage?: string;
  errorStack?: string;
  screenshotPath?: string;
  videoPath?: string;
  tracePath?: string;
  retryCount: number;
  createdAt?: string;
}

export interface TestHistory {
  id?: number;
  testId: string;
  testName: string;
  testFile: string;
  totalRuns: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  flakyCount: number;
  avgDurationMs: number;
  minDurationMs: number;
  maxDurationMs: number;
  lastStatus?: string;
  lastRunAt?: string;
  lastFailedAt?: string;
  firstRunAt?: string;
  flakinessScore?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LogEntry {
  id?: number;
  runId: string;
  testId?: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  metadata?: string;
}

export interface OverallStats {
  totalRuns: number;
  totalTests: number;
  avgPassRate: number;
  avgDuration: number;
}

// =============================================================================
// Database Class
// =============================================================================

export class TestDatabase {
  private static instance: TestDatabase | null = null;
  private db: Database.Database;
  private dbPath: string;

  private constructor(dbPath?: string) {
    // Use .test-db directory to avoid Playwright cleaning the test-results directory
    this.dbPath = dbPath || path.join(process.cwd(), '.test-db', 'test-analytics.db');

    // Debug: Log the path being used
    console.log(`[DB] Initializing database at: ${this.dbPath}`);
    console.log(`[DB] Current working directory: ${process.cwd()}`);

    // Ensure directory exists
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`[DB] Created directory: ${dir}`);
    } else {
      console.log(`[DB] Directory exists: ${dir}`);
    }

    this.db = new Database(this.dbPath);
    
    // Disable foreign key enforcement to avoid issues with parallel test execution
    // We maintain data integrity programmatically (always insert run before results)
    this.db.pragma('foreign_keys = OFF');
    console.log('[DB] Foreign keys disabled for compatibility');
    
    // Use DELETE journal mode in CI for better compatibility, WAL locally for performance
    const isCI = process.env.CI === 'true';
    if (isCI) {
      this.db.pragma('journal_mode = DELETE');
      // Force synchronous writes in CI to ensure data is persisted
      this.db.pragma('synchronous = FULL');
      console.log('[DB] Using DELETE journal mode with FULL sync (CI environment)');
    } else {
      this.db.pragma('journal_mode = WAL');
      console.log('[DB] Using WAL journal mode (local environment)');
    }
    
    this.initSchema();
    
    // Debug: Verify file exists after initialization
    if (fs.existsSync(this.dbPath)) {
      const stats = fs.statSync(this.dbPath);
      console.log(`[DB] Database file created: ${stats.size} bytes`);
    } else {
      console.error(`[DB] ERROR: Database file NOT found after initialization!`);
    }
  }

  static getInstance(dbPath?: string): TestDatabase {
    if (!TestDatabase.instance) {
      TestDatabase.instance = new TestDatabase(dbPath);
    }
    return TestDatabase.instance;
  }

  static resetInstance(): void {
    if (TestDatabase.instance) {
      TestDatabase.instance.close();
      TestDatabase.instance = null;
    }
  }

  private initSchema(): void {
    this.db.exec(queries.SCHEMA_INIT);
  }

  // ===========================================================================
  // Test Run Operations
  // ===========================================================================

  insertTestRun(run: TestRun): void {
    const stmt = this.db.prepare(queries.INSERT_TEST_RUN);
    stmt.run({
      runId: run.runId,
      startedAt: run.startedAt,
      totalTests: run.totalTests,
      passed: run.passed,
      failed: run.failed,
      skipped: run.skipped,
      flaky: run.flaky,
      passRate: run.passRate,
      durationMs: run.durationMs,
      branch: run.branch || null,
      commitSha: run.commitSha || null,
      environment: run.environment || 'local',
      trigger: run.trigger || 'manual',
      tags: run.tags || null,
      browser: run.browser || null,
    });
  }

  updateTestRun(runId: string, updates: Partial<TestRun>): void {
    const stmt = this.db.prepare(queries.UPDATE_TEST_RUN);
    stmt.run({
      runId,
      finishedAt: updates.finishedAt || null,
      totalTests: updates.totalTests ?? 0,
      passed: updates.passed ?? 0,
      failed: updates.failed ?? 0,
      skipped: updates.skipped ?? 0,
      flaky: updates.flaky ?? 0,
      passRate: updates.passRate ?? 0,
      durationMs: updates.durationMs ?? 0,
    });
  }

  getTestRun(runId: string): TestRun | undefined {
    const stmt = this.db.prepare(queries.SELECT_TEST_RUN_BY_ID);
    const row = stmt.get(runId) as Record<string, unknown> | undefined;
    return row ? this.mapToTestRun(row) : undefined;
  }

  getRecentTestRuns(limit = 10): TestRun[] {
    const stmt = this.db.prepare(queries.SELECT_RECENT_RUNS);
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestRun(row));
  }

  // ===========================================================================
  // Test Result Operations
  // ===========================================================================

  insertTestResult(result: TestResult): void {
    const stmt = this.db.prepare(queries.INSERT_TEST_RESULT);
    stmt.run({
      runId: result.runId,
      testId: result.testId,
      testName: result.testName,
      testFile: result.testFile,
      testTags: result.testTags || null,
      suiteName: result.suiteName || null,
      browser: result.browser || 'unknown',
      status: result.status,
      durationMs: result.durationMs,
      errorMessage: result.errorMessage || null,
      errorStack: result.errorStack || null,
      screenshotPath: result.screenshotPath || null,
      videoPath: result.videoPath || null,
      tracePath: result.tracePath || null,
      retryCount: result.retryCount,
    });
  }

  getTestResults(runId: string): TestResult[] {
    const stmt = this.db.prepare(queries.SELECT_RESULTS_BY_RUN);
    const rows = stmt.all(runId) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestResult(row));
  }

  getFailedTests(runId: string): TestResult[] {
    const stmt = this.db.prepare(queries.SELECT_FAILED_TESTS_BY_RUN);
    const rows = stmt.all(runId) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestResult(row));
  }

  // ===========================================================================
  // Test History Operations
  // ===========================================================================

  updateTestHistory(result: TestResult): void {
    const existing = this.db.prepare(queries.SELECT_HISTORY_BY_TEST_ID).get(result.testId) as Record<string, unknown> | undefined;

    const params = {
      testId: result.testId,
      testName: result.testName,
      testFile: result.testFile,
      passed: result.status === 'passed' ? 1 : 0,
      failed: result.status === 'failed' ? 1 : 0,
      skipped: result.status === 'skipped' ? 1 : 0,
      flaky: result.retryCount > 0 && result.status === 'passed' ? 1 : 0,
      durationMs: result.durationMs,
      lastStatus: result.status,
      lastRunAt: new Date().toISOString(),
    };

    if (existing) {
      const stmt = this.db.prepare(queries.UPDATE_TEST_HISTORY);
      stmt.run(params);
    } else {
      const stmt = this.db.prepare(queries.INSERT_TEST_HISTORY);
      stmt.run(params);
    }
  }

  getTestHistory(testId: string): TestHistory | undefined {
    const stmt = this.db.prepare(queries.SELECT_HISTORY_BY_TEST_ID);
    const row = stmt.get(testId) as Record<string, unknown> | undefined;
    return row ? this.mapToTestHistory(row) : undefined;
  }

  // ===========================================================================
  // Analytics Operations
  // ===========================================================================

  getFlakyTests(limit = 10): TestHistory[] {
    const stmt = this.db.prepare(queries.SELECT_FLAKY_TESTS);
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestHistory(row));
  }

  getSlowestTests(limit = 10): TestHistory[] {
    const stmt = this.db.prepare(queries.SELECT_SLOWEST_TESTS);
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestHistory(row));
  }

  getMostFailingTests(limit = 10): TestHistory[] {
    const stmt = this.db.prepare(queries.SELECT_MOST_FAILING_TESTS);
    const rows = stmt.all(limit) as Record<string, unknown>[];
    return rows.map(row => this.mapToTestHistory(row));
  }

  getOverallStats(): OverallStats {
    const stmt = this.db.prepare(queries.SELECT_OVERALL_STATS);
    const row = stmt.get() as Record<string, unknown>;
    return {
      totalRuns: (row.total_runs as number) || 0,
      totalTests: (row.total_tests as number) || 0,
      avgPassRate: (row.avg_pass_rate as number) || 0,
      avgDuration: (row.avg_duration as number) || 0,
    };
  }

  // ===========================================================================
  // Log Entry Operations
  // ===========================================================================

  insertLogEntry(entry: LogEntry): void {
    const stmt = this.db.prepare(queries.INSERT_LOG_ENTRY);
    stmt.run({
      runId: entry.runId,
      testId: entry.testId || null,
      level: entry.level,
      message: entry.message,
      timestamp: entry.timestamp,
      metadata: entry.metadata || null,
    });
  }

  getLogEntries(runId: string, testId?: string): LogEntry[] {
    if (testId) {
      const stmt = this.db.prepare(queries.SELECT_LOGS_BY_TEST);
      return stmt.all(runId, testId) as LogEntry[];
    }
    const stmt = this.db.prepare(queries.SELECT_LOGS_BY_RUN);
    return stmt.all(runId) as LogEntry[];
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================

  /**
   * Checkpoint WAL to ensure all data is written to the main database file.
   * This is important for CI where another process reads the database.
   */
  checkpoint(): void {
    console.log('[DB] Checkpointing database...');
    
    // Check current journal mode
    const journalMode = this.db.pragma('journal_mode', { simple: true }) as string;
    console.log(`[DB] Current journal mode: ${journalMode}`);
    
    // Only checkpoint if using WAL mode
    if (journalMode.toLowerCase() === 'wal') {
      this.db.pragma('wal_checkpoint(TRUNCATE)');
    } else {
      // For DELETE/other modes, just ensure all writes are flushed
      console.log('[DB] Using non-WAL mode, ensuring writes are flushed...');
    }
    
    // Debug: Verify file exists after checkpoint
    if (fs.existsSync(this.dbPath)) {
      const stats = fs.statSync(this.dbPath);
      console.log(`[DB] After checkpoint - file size: ${stats.size} bytes`);
      // Also check for WAL files
      const walPath = this.dbPath + '-wal';
      const shmPath = this.dbPath + '-shm';
      if (fs.existsSync(walPath)) {
        console.log(`[DB] WAL file exists: ${fs.statSync(walPath).size} bytes`);
      }
      if (fs.existsSync(shmPath)) {
        console.log(`[DB] SHM file exists: ${fs.statSync(shmPath).size} bytes`);
      }
    } else {
      console.error(`[DB] ERROR: Database file NOT found after checkpoint!`);
      // List directory contents for debugging
      const dir = path.dirname(this.dbPath);
      console.log(`[DB] Contents of ${dir}:`);
      try {
        const files = fs.readdirSync(dir);
        files.forEach(f => console.log(`[DB]   - ${f}`));
      } catch (e) {
        console.error(`[DB] Cannot list directory: ${e}`);
      }
    }
  }

  close(): void {
    console.log('[DB] Closing database...');
    // Checkpoint WAL before closing to ensure all data is in main DB file
    this.checkpoint();
    this.db.close();
    
    // Final verification
    if (fs.existsSync(this.dbPath)) {
      const stats = fs.statSync(this.dbPath);
      console.log(`[DB] After close - file exists: ${stats.size} bytes`);
    } else {
      console.error(`[DB] ERROR: Database file NOT found after close!`);
    }
  }

  getDbPath(): string {
    return this.dbPath;
  }

  // ===========================================================================
  // Mapper Functions
  // ===========================================================================

  private mapToTestRun(row: Record<string, unknown>): TestRun {
    return {
      runId: row.run_id as string,
      startedAt: row.started_at as string,
      finishedAt: row.finished_at as string | undefined,
      totalTests: row.total_tests as number,
      passed: row.passed as number,
      failed: row.failed as number,
      skipped: row.skipped as number,
      flaky: row.flaky as number,
      passRate: row.pass_rate as number,
      durationMs: row.duration_ms as number,
      branch: row.branch as string | undefined,
      commitSha: row.commit_sha as string | undefined,
      environment: row.environment as string,
      trigger: row.trigger as string,
      tags: row.tags as string | undefined,
      browser: row.browser as string | undefined,
      createdAt: row.created_at as string | undefined,
    };
  }

  private mapToTestResult(row: Record<string, unknown>): TestResult {
    return {
      id: row.id as number,
      runId: row.run_id as string,
      testId: row.test_id as string,
      testName: row.test_name as string,
      testFile: row.test_file as string,
      testTags: row.test_tags as string | undefined,
      suiteName: row.suite_name as string | undefined,
      browser: row.browser as string,
      status: row.status as TestResult['status'],
      durationMs: row.duration_ms as number,
      errorMessage: row.error_message as string | undefined,
      errorStack: row.error_stack as string | undefined,
      screenshotPath: row.screenshot_path as string | undefined,
      videoPath: row.video_path as string | undefined,
      tracePath: row.trace_path as string | undefined,
      retryCount: row.retry_count as number,
      createdAt: row.created_at as string | undefined,
    };
  }

  private mapToTestHistory(row: Record<string, unknown>): TestHistory {
    return {
      id: row.id as number,
      testId: row.test_id as string,
      testName: row.test_name as string,
      testFile: row.test_file as string,
      totalRuns: row.total_runs as number,
      passCount: row.pass_count as number,
      failCount: row.fail_count as number,
      skipCount: row.skip_count as number,
      flakyCount: row.flaky_count as number,
      avgDurationMs: row.avg_duration_ms as number,
      minDurationMs: row.min_duration_ms as number,
      maxDurationMs: row.max_duration_ms as number,
      lastStatus: row.last_status as string | undefined,
      lastRunAt: row.last_run_at as string | undefined,
      lastFailedAt: row.last_failed_at as string | undefined,
      firstRunAt: row.first_run_at as string | undefined,
      flakinessScore: row.flakiness_score as number | undefined,
      createdAt: row.created_at as string | undefined,
      updatedAt: row.updated_at as string | undefined,
    };
  }
}
