/**
 * Type definitions for the Test Dashboard
 */

import { TestRun, TestResult, TestHistory } from '../../db/database';

/**
 * Aggregated statistics for the dashboard
 */
export interface DashboardStats {
  totalRuns: number;
  totalTests: number;
  avgPassRate: number;
  avgDuration: number;
}

/**
 * Complete data structure for rendering the dashboard
 */
export interface DashboardData {
  runs: TestRun[];
  stats: DashboardStats;
  flakyTests: TestHistory[];
  slowestTests: TestHistory[];
  mostFailingTests: TestHistory[];
  latestFailures: TestResult[];
}

/**
 * Configuration options for the dashboard generator
 */
export interface DashboardConfig {
  /** Path to the SQLite database file */
  dbPath?: string;
  /** Output path for the generated HTML file */
  outputPath?: string;
  /** Number of recent runs to display */
  recentRunsLimit?: number;
  /** Number of flaky tests to display */
  flakyTestsLimit?: number;
  /** Number of slowest tests to display */
  slowestTestsLimit?: number;
  /** Number of most failing tests to display */
  mostFailingTestsLimit?: number;
}

/**
 * Chart data for trend visualization
 */
export interface ChartData {
  labels: string[];
  passRateTrend: string[];
  durationTrend: string[];
}

// Re-export types from database for convenience
export type { TestRun, TestResult, TestHistory };
