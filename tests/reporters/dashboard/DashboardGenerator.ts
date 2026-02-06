/**
 * Dashboard Generator
 * Main orchestrator class that coordinates data fetching, HTML generation, and file output
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestDatabase } from '../../db/database';
import { DashboardDataService } from './DashboardDataService';
import { HtmlTemplateEngine } from './HtmlTemplateEngine';
import type { DashboardConfig } from './types';

/**
 * Main dashboard generator class that orchestrates the entire generation process
 */
export class DashboardGenerator {
  private dbPath: string;
  private outputPath: string;
  private dataService: DashboardDataService | null = null;
  private templateEngine: HtmlTemplateEngine;

  /**
   * Creates a new DashboardGenerator instance
   * @param config - Configuration options
   */
  constructor(config?: DashboardConfig) {
    this.dbPath = config?.dbPath || path.join(process.cwd(), '.test-db', 'test-analytics.db');
    this.outputPath =
      config?.outputPath || path.join(process.cwd(), 'test-results', 'dashboard.html');
    this.templateEngine = new HtmlTemplateEngine();
  }

  /**
   * Generates the dashboard HTML file
   * @returns The path to the generated file
   */
  generate(): string {
    this.logDatabaseInfo();

    const db = this.openDatabase();
    this.dataService = new DashboardDataService(db);

    console.log(`📂 Opened database: ${this.dataService.getDbPath()}`);

    const data = this.dataService.fetchDashboardData();
    this.dataService.logDataSummary(data);

    const html = this.templateEngine.build(data);
    this.writeOutput(html);

    console.log(`📊 Dashboard generated: ${this.outputPath}`);
    return this.outputPath;
  }

  /**
   * Logs information about the database file
   */
  private logDatabaseInfo(): void {
    console.log(`📂 Expected database path: ${this.dbPath}`);

    if (fs.existsSync(this.dbPath)) {
      const stats = fs.statSync(this.dbPath);
      console.log(`📂 Database file exists: ${stats.size} bytes`);
    } else {
      console.warn('⚠️  Database file does not exist!');
      console.warn('   Tests may not have run or dbReporter may not be configured.');
    }
  }

  /**
   * Opens the database connection
   */
  private openDatabase(): TestDatabase {
    return TestDatabase.getInstance(this.dbPath);
  }

  /**
   * Writes the HTML output to file
   */
  private writeOutput(html: string): void {
    // Ensure output directory exists
    const outputDir = path.dirname(this.outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(this.outputPath, html);
  }

  /**
   * Gets the configured database path
   */
  getDbPath(): string {
    return this.dbPath;
  }

  /**
   * Gets the configured output path
   */
  getOutputPath(): string {
    return this.outputPath;
  }

  /**
   * Static factory method for simple generation
   * @param dbPath - Optional database path
   * @param outputPath - Optional output path
   * @returns The path to the generated file
   */
  static generate(dbPath?: string, outputPath?: string): string {
    const generator = new DashboardGenerator({ dbPath, outputPath });
    return generator.generate();
  }
}

export default DashboardGenerator;
