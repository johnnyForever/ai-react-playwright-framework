/**
 * Test Dashboard Generator
 *
 * This module has been refactored into separate classes for better maintainability.
 * This file now serves as a backward-compatible entry point.
 *
 * @see ./dashboard/DashboardGenerator.ts - Main orchestrator class
 * @see ./dashboard/DashboardDataService.ts - Data fetching service
 * @see ./dashboard/HtmlTemplateEngine.ts - HTML generation
 * @see ./dashboard/DashboardUtils.ts - Utility functions
 * @see ./dashboard/types.ts - Type definitions
 */

export type {
  ChartData,
  DashboardConfig,
  DashboardData,
  DashboardStats,
  TestHistory,
  TestResult,
  TestRun,
} from './dashboard';
// Re-export everything from the new module structure
export {
  DashboardDataService,
  DashboardGenerator,
  DashboardUtils,
  HtmlTemplateEngine,
} from './dashboard';

// Import for backward compatibility function
import { DashboardGenerator } from './dashboard';

/**
 * Generates the test dashboard HTML file
 *
 * @deprecated Use `DashboardGenerator.generate()` or `new DashboardGenerator(config).generate()` instead
 * @param dbPath - Optional path to the SQLite database file
 * @param outputPath - Optional path for the output HTML file
 */
export function generateDashboard(dbPath?: string, outputPath?: string): void {
  DashboardGenerator.generate(dbPath, outputPath);
}

// Default export for backward compatibility
export default generateDashboard;

// CLI runner (ESM compatible)
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  console.log('🎨 Generating Test Dashboard...\n');
  generateDashboard();
}
