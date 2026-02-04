/**
 * Dashboard Data Service
 * Handles fetching and aggregating test data from the database
 */

import { TestDatabase } from '../../db/database';
import { DashboardData, DashboardConfig } from './types';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Required<Omit<DashboardConfig, 'dbPath' | 'outputPath'>> = {
  recentRunsLimit: 20,
  flakyTestsLimit: 10,
  slowestTestsLimit: 10,
  mostFailingTestsLimit: 10,
};

/**
 * Service class responsible for fetching dashboard data from the database
 */
export class DashboardDataService {
  private db: TestDatabase;
  private config: Required<Omit<DashboardConfig, 'dbPath' | 'outputPath'>>;

  /**
   * Creates a new DashboardDataService instance
   * @param db - TestDatabase instance to query
   * @param config - Optional configuration for data limits
   */
  constructor(db: TestDatabase, config?: Partial<DashboardConfig>) {
    this.db = db;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Fetches all data needed for the dashboard
   * @returns Complete DashboardData object
   */
  fetchDashboardData(): DashboardData {
    const runs = this.db.getRecentTestRuns(this.config.recentRunsLimit);
    const stats = this.db.getOverallStats();
    const flakyTests = this.db.getFlakyTests(this.config.flakyTestsLimit);
    const slowestTests = this.db.getSlowestTests(this.config.slowestTestsLimit);
    const mostFailingTests = this.db.getMostFailingTests(this.config.mostFailingTestsLimit);
    
    // Get failures from the latest run
    const latestFailures = runs.length > 0 
      ? this.db.getFailedTests(runs[0].runId)
      : [];

    return {
      runs,
      stats,
      flakyTests,
      slowestTests,
      mostFailingTests,
      latestFailures,
    };
  }

  /**
   * Logs debug information about the fetched data
   * @param data - The dashboard data to log info about
   */
  logDataSummary(data: DashboardData): void {
    console.log(`📊 Found ${data.runs.length} test runs in database`);
    console.log(`📊 Overall stats: ${data.stats.totalTests} total tests, ${data.stats.avgPassRate.toFixed(1)}% avg pass rate`);

    if (data.runs.length === 0) {
      console.warn('⚠️  No test runs found in database. Dashboard will be empty.');
      console.warn('   Make sure tests were run with the dbReporter enabled.');
    } else {
      console.log(`📊 Latest run: ${data.runs[0].runId} - ${data.runs[0].passed} passed, ${data.runs[0].failed} failed`);
    }

    if (data.flakyTests.length > 0) {
      console.log(`📊 Found ${data.flakyTests.length} flaky tests`);
    }

    if (data.slowestTests.length > 0) {
      console.log(`📊 Top slowest test: ${data.slowestTests[0].testName}`);
    }
  }

  /**
   * Gets the database path being used
   * @returns The database file path
   */
  getDbPath(): string {
    return this.db.getDbPath();
  }
}

export default DashboardDataService;
