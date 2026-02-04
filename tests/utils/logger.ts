/**
 * Custom Test Logger
 * Provides structured logging for tests with automatic DB integration
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestInfo } from '@playwright/test';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'step';

export interface LogMessage {
  timestamp: string;
  level: LogLevel;
  message: string;
  testName?: string;
  testFile?: string;
  testId?: string;
  runId?: string;
  stepName?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

export class TestLogger {
  private logs: LogMessage[] = [];
  private testInfo?: TestInfo;
  private runId: string;
  private logFilePath?: string;
  private stepStack: { name: string; startTime: number }[] = [];

  constructor(runId: string, testInfo?: TestInfo) {
    this.runId = runId;
    this.testInfo = testInfo;
    
    // Setup log file
    const logsDir = path.join(process.cwd(), 'test-results', 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    this.logFilePath = path.join(logsDir, `${runId}.jsonl`);
  }

  private formatMessage(level: LogLevel, message: string, metadata?: Record<string, unknown>): LogMessage {
    const logMessage: LogMessage = {
      timestamp: new Date().toISOString(),
      level,
      message,
      runId: this.runId,
      testName: this.testInfo?.title,
      testFile: this.testInfo?.file ? path.basename(this.testInfo.file) : undefined,
      testId: this.testInfo?.testId,
      stepName: this.stepStack.length > 0 ? this.stepStack[this.stepStack.length - 1].name : undefined,
      metadata
    };
    return logMessage;
  }

  private writeLog(logMessage: LogMessage): void {
    this.logs.push(logMessage);
    
    // Console output with colors
    const colors = {
      debug: '\x1b[90m',  // Gray
      info: '\x1b[36m',   // Cyan
      warn: '\x1b[33m',   // Yellow
      error: '\x1b[31m',  // Red
      step: '\x1b[35m'    // Magenta
    };
    const reset = '\x1b[0m';
    const color = colors[logMessage.level];
    
    const prefix = logMessage.testName ? `[${logMessage.testName}]` : '[Global]';
    const stepPrefix = logMessage.stepName ? `[${logMessage.stepName}]` : '';
    console.log(`${color}[${logMessage.level.toUpperCase()}]${reset} ${prefix}${stepPrefix} ${logMessage.message}`);
    
    // Write to file
    if (this.logFilePath) {
      fs.appendFileSync(this.logFilePath, JSON.stringify(logMessage) + '\n');
    }
  }

  /**
   * Log a debug message for detailed troubleshooting
   * @param message - The debug message to log
   * @param metadata - Optional additional context data
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog(this.formatMessage('debug', message, metadata));
  }

  /**
   * Log an informational message
   * @param message - The info message to log
   * @param metadata - Optional additional context data
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog(this.formatMessage('info', message, metadata));
  }

  /**
   * Log a warning message for potential issues
   * @param message - The warning message to log
   * @param metadata - Optional additional context data
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog(this.formatMessage('warn', message, metadata));
  }

  /**
   * Log an error message with optional Error object
   * @param message - The error message to log
   * @param error - Optional Error object to extract stack trace from
   * @param metadata - Optional additional context data
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const meta = {
      ...metadata,
      ...(error && {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      })
    };
    this.writeLog(this.formatMessage('error', message, meta));
  }

  /**
   * Start a named step - useful for grouping related operations
   */
  stepStart(name: string): void {
    this.stepStack.push({ name, startTime: Date.now() });
    this.writeLog(this.formatMessage('step', `▶ Starting: ${name}`));
  }

  /**
   * End the current step
   */
  stepEnd(success = true): void {
    const step = this.stepStack.pop();
    if (step) {
      const duration = Date.now() - step.startTime;
      const status = success ? '✓' : '✗';
      this.writeLog(this.formatMessage('step', `${status} Completed: ${step.name} (${duration}ms)`, { duration }));
    }
  }

  /**
   * Log a test step with automatic timing
   */
  async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
    this.stepStart(name);
    try {
      const result = await fn();
      this.stepEnd(true);
      return result;
    } catch (error) {
      this.stepEnd(false);
      throw error;
    }
  }

  /**
   * Log test start
   */
  testStart(): void {
    this.info(`Test started: ${this.testInfo?.title}`, {
      file: this.testInfo?.file,
      line: this.testInfo?.line,
      column: this.testInfo?.column,
      tags: this.testInfo?.tags,
      project: this.testInfo?.project.name
    });
  }

  /**
   * Log test end
   */
  testEnd(): void {
    const duration = this.testInfo?.duration || 0;
    const status = this.testInfo?.status || 'unknown';
    
    if (status === 'passed') {
      this.info(`Test passed: ${this.testInfo?.title} (${duration}ms)`, { duration, status });
    } else if (status === 'failed') {
      const error = this.testInfo?.error;
      this.error(`Test failed: ${this.testInfo?.title} (${duration}ms)`, error as Error, { duration, status });
    } else if (status === 'skipped') {
      this.info(`Test skipped: ${this.testInfo?.title}`, { status });
    } else {
      this.warn(`Test ended with status: ${status}`, { duration, status });
    }
  }

  /**
   * Attach a screenshot path to the current log
   */
  attachScreenshot(screenshotPath: string): void {
    this.info(`Screenshot attached: ${path.basename(screenshotPath)}`, { screenshotPath });
  }

  /**
   * Get all logs for this session
   */
  getLogs(): LogMessage[] {
    return [...this.logs];
  }

  /**
   * Get logs as formatted entries for DB
   */
  getDbEntries(): Array<{
    runId: string;
    testId?: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    stepName?: string;
    metadata?: Record<string, unknown>;
  }> {
    return this.logs.map(log => ({
      runId: log.runId || this.runId,
      testId: log.testId,
      timestamp: log.timestamp,
      level: log.level,
      message: log.message,
      stepName: log.stepName,
      metadata: log.metadata
    }));
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
    this.stepStack = [];
  }
}

// Global logger instance for the current run
let globalLogger: TestLogger | null = null;

export function createLogger(runId: string, testInfo?: TestInfo): TestLogger {
  return new TestLogger(runId, testInfo);
}

export function getGlobalLogger(): TestLogger | null {
  return globalLogger;
}

export function setGlobalLogger(logger: TestLogger): void {
  globalLogger = logger;
}

export default TestLogger;
