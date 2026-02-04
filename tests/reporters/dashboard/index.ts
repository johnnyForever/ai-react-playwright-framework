/**
 * Dashboard Module Index
 * Re-exports all dashboard classes and provides CLI entry point
 */

// Export all classes
export { DashboardGenerator } from './DashboardGenerator';
export { DashboardDataService } from './DashboardDataService';
export { HtmlTemplateEngine } from './HtmlTemplateEngine';
export { DashboardUtils } from './DashboardUtils';

// Export all types
export type { 
  DashboardData, 
  DashboardConfig, 
  DashboardStats, 
  ChartData,
  TestRun,
  TestResult,
  TestHistory 
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
