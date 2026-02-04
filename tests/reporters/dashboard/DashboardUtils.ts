/**
 * Dashboard Utility Functions
 * Provides common utilities for formatting and escaping
 */

/**
 * Utility class with static helper methods for dashboard generation
 */
export class DashboardUtils {
  /**
   * Formats duration in milliseconds to a human-readable string
   * @param ms - Duration in milliseconds
   * @returns Formatted duration string (e.g., "1.5s", "2m 30s")
   */
  static formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}m ${seconds}s`;
  }

  /**
   * Escapes HTML special characters to prevent XSS
   * @param text - Text to escape
   * @returns Escaped HTML-safe string
   */
  static escapeHtml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Determines CSS class based on pass rate percentage
   * @param passRate - Pass rate as a percentage (0-100)
   * @returns CSS class name for styling
   */
  static getPassRateClass(passRate: number): string {
    if (passRate >= 90) return 'success';
    if (passRate >= 70) return 'warning';
    return 'error';
  }

  /**
   * Truncates a string to a maximum length with ellipsis
   * @param text - Text to truncate
   * @param maxLength - Maximum length before truncation
   * @returns Truncated string with ellipsis if needed
   */
  static truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  /**
   * Extracts filename from a file path
   * @param filePath - Full file path
   * @returns Just the filename
   */
  static extractFilename(filePath: string): string {
    return filePath.split(/[/\\]/).pop() || filePath;
  }
}

export default DashboardUtils;
