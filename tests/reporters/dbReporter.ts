/**
 * Custom Playwright Reporter for Database Integration
 * Stores test results in SQLite for historical analysis
 */

import type {
  FullConfig,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import { execSync } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import { TestDatabase, TestRun, TestResult as DbTestResult } from '../db/database';

interface DbReporterOptions {
  dbPath?: string;
  environment?: string;
  trigger?: string;
}

class DbReporter implements Reporter {
  private db: TestDatabase | null = null;
  private runId: string;
  private startTime: Date;
  private results: DbTestResult[] = [];
  private config?: FullConfig;
  private options: DbReporterOptions;
  private initError: Error | null = null;

  constructor(options: DbReporterOptions = {}) {
    this.options = options;
    this.runId = uuidv4();
    this.startTime = new Date();

    try {
      console.log('📊 DbReporter: Initializing database...');
      this.db = TestDatabase.getInstance(options.dbPath);
      console.log(`📊 DbReporter: Database initialized at ${this.db.getDbPath()}`);
    } catch (error) {
      this.initError = error as Error;
      console.error('❌ DbReporter: Failed to initialize database:', error);
      console.error('   Test results will NOT be stored in database.');
    }
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.config = config;

    // Get git info if available
    const branch = process.env.GITHUB_REF_NAME || process.env.GIT_BRANCH || this.getGitBranch();
    const commitSha = process.env.GITHUB_SHA || process.env.GIT_COMMIT || this.getGitCommit();

    // Count total tests
    const totalTests = this.countTests(suite);

    // Determine environment and trigger
    const environment = this.options.environment || process.env.TEST_ENVIRONMENT || 'local';
    const trigger = this.options.trigger || process.env.TEST_TRIGGER || 'manual';

    // Get browser and tags from config
    const browsers = config.projects.map(p => p.name).join(',');
    const grepTag = config.grep?.toString() || '';

    const testRun: TestRun = {
      runId: this.runId,
      startedAt: this.startTime.toISOString(),
      totalTests,
      passed: 0,
      failed: 0,
      skipped: 0,
      flaky: 0,
      passRate: 0,
      durationMs: 0,
      branch,
      commitSha,
      environment,
      trigger,
      tags: grepTag,
      browser: browsers
    };

    if (this.db) {
      this.db.insertTestRun(testRun);
    }

    console.log('\n📊 DB Reporter initialized');
    console.log(`   Run ID: ${this.runId}`);
    console.log(`   Environment: ${environment}`);
    console.log(`   Total tests: ${totalTests}\n`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testResult: DbTestResult = {
      runId: this.runId,
      testId: test.id,
      testName: test.title,
      testFile: test.location.file,
      testTags: test.tags.join(','),
      suiteName: test.parent?.title,
      browser: test.parent?.project()?.name || 'unknown',
      status: result.status,
      durationMs: result.duration,
      errorMessage: result.error?.message,
      errorStack: result.error?.stack,
      screenshotPath: result.attachments.find(a => a.name === 'screenshot')?.path,
      videoPath: result.attachments.find(a => a.name === 'video')?.path,
      tracePath: result.attachments.find(a => a.name === 'trace')?.path,
      retryCount: result.retry
    };

    this.results.push(testResult);
    if (this.db) {
      this.db.insertTestResult(testResult);
      this.db.updateTestHistory(testResult);
    }

    // Log progress
    const statusIcon = {
      passed: '✓',
      failed: '✗',
      skipped: '○',
      timedOut: '⏱',
      interrupted: '!'
    }[result.status] || '?';

    const statusColor = {
      passed: '\x1b[32m',
      failed: '\x1b[31m',
      skipped: '\x1b[33m',
      timedOut: '\x1b[31m',
      interrupted: '\x1b[31m'
    }[result.status] || '';

    console.log(`${statusColor}${statusIcon}\x1b[0m ${test.title} (${result.duration}ms)`);
  }

  async onEnd(): Promise<void> {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    // Calculate summary
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const flaky = this.results.filter(r => r.retryCount > 0 && r.status === 'passed').length;
    const total = this.results.length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    // Update test run with final stats
    if (this.db) {
      this.db.updateTestRun(this.runId, {
        finishedAt: endTime.toISOString(),
        totalTests: total,
        passed,
        failed,
        skipped,
        flaky,
        passRate,
        durationMs: duration
      });
    }

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST RUN SUMMARY');
    console.log('═'.repeat(60));
    console.log(`   Run ID:     ${this.runId}`);
    console.log(`   Duration:   ${this.formatDuration(duration)}`);
    console.log(`   Total:      ${total} tests`);
    console.log(`   \x1b[32mPassed:     ${passed}\x1b[0m`);
    console.log(`   \x1b[31mFailed:     ${failed}\x1b[0m`);
    console.log(`   \x1b[33mSkipped:    ${skipped}\x1b[0m`);
    console.log(`   \x1b[35mFlaky:      ${flaky}\x1b[0m`);
    console.log(`   Pass Rate:  ${passRate.toFixed(1)}%`);
    console.log('═'.repeat(60));

    // Show failed tests
    if (failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      const failedTests = this.results.filter(r => r.status === 'failed');
      failedTests.forEach(t => {
        console.log(`   • ${t.testName}`);
        if (t.errorMessage) {
          console.log(`     ${t.errorMessage.split('\n')[0]}`);
        }
      });
    }

    // Show flaky tests
    if (flaky > 0) {
      console.log('\n⚠️  FLAKY TESTS (passed on retry):');
      const flakyTests = this.results.filter(r => r.retryCount > 0 && r.status === 'passed');
      flakyTests.forEach(t => {
        console.log(`   • ${t.testName} (${t.retryCount} retries)`);
      });
    }

    // Handle database operations
    if (this.db) {
      console.log('\n📁 Results stored in database');
      console.log(`   Database: ${this.db.getDbPath()}`);
      console.log(`   View report: npm run test:dashboard\n`);

      // Checkpoint and close database to ensure data is flushed for CI
      // This is critical for the dashboard generator to read the data
      this.db.checkpoint();

      // Verify data was written by querying the count
      const verifyRuns = this.db.getRecentTestRuns(1);
      console.log(`✓ Database checkpointed - verified ${verifyRuns.length} run(s) in database`);

      // Close the database to ensure all data is written to disk
      // This resets the singleton so the next process gets fresh data
      TestDatabase.resetInstance();
      console.log('✓ Database closed for dashboard generation');
    } else {
      console.error('❌ Database was not initialized - no results stored!');
      if (this.initError) {
        console.error(`   Error: ${this.initError.message}`);
      }
    }
  }

  private countTests(suite: Suite): number {
    let count = suite.tests.length;
    for (const child of suite.suites) {
      count += this.countTests(child);
    }
    return count;
  }

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }

  private getGitBranch(): string | undefined {
    try {
      return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return undefined;
    }
  }

  private getGitCommit(): string | undefined {
    try {
      return execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
    } catch {
      return undefined;
    }
  }
}

export default DbReporter;
