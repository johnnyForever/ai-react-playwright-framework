/**
 * Dashboard Module Index
 * Re-exports all dashboard classes and provides CLI entry point
 */

export { DashboardDataService } from './DashboardDataService';
// Export all classes
export { DashboardGenerator } from './DashboardGenerator';
export { DashboardUtils } from './DashboardUtils';
export { HtmlTemplateEngine } from './HtmlTemplateEngine';

// Export all types
export type {
  ChartData,
  DashboardConfig,
  DashboardData,
  DashboardStats,
  TestHistory,
  TestResult,
  TestRun,
} from './types';

// Default export is the main generator
import { DashboardGenerator } from './DashboardGenerator';
export default DashboardGenerator;

// CLI runner (ESM compatible)
const isMainModule = import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  console.log('🎨 Generating Test Dashboard...\n');
  DashboardGenerator.generate();
}
