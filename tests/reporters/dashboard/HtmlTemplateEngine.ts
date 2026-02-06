/**
 * HTML Template Engine
 * Generates HTML components for the test dashboard
 */

import { DashboardUtils } from './DashboardUtils';
import type { ChartData, DashboardData, TestHistory, TestResult, TestRun } from './types';

/**
 * Template engine class responsible for generating all HTML content
 */
export class HtmlTemplateEngine {
  /**
   * Builds the complete HTML document from dashboard data
   * @param data - Dashboard data to render
   * @returns Complete HTML string
   */
  build(data: DashboardData): string {
    const chartData = this.prepareChartData(data);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Framework Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  ${this.generateStyles()}
</head>
<body>
  <div class="container">
    ${this.generateHeader()}
    ${this.generateStatsGrid(data.stats)}
    ${this.generateChartsGrid()}
    ${this.generateRunsSection(data.runs)}
    ${this.generateFailuresSection(data.latestFailures)}
    ${this.generateFlakyTestsSection(data.flakyTests)}
    ${this.generateSlowestTestsSection(data.slowestTests)}
    ${this.generateFooter()}
  </div>
  ${this.generateChartScripts(chartData)}
</body>
</html>`;
  }

  /**
   * Prepares chart data from dashboard data
   */
  private prepareChartData(data: DashboardData): ChartData {
    const recentRuns = data.runs.slice(0, 10).reverse();
    return {
      labels: recentRuns.map((_, i) => `Run ${i + 1}`),
      passRateTrend: recentRuns.map((r) => r.passRate.toFixed(1)),
      durationTrend: recentRuns.map((r) => (r.durationMs / 1000).toFixed(1)),
    };
  }

  /**
   * Generates the CSS styles
   */
  private generateStyles(): string {
    return `<style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: #e8e8e8;
      min-height: 100vh;
      padding: 20px;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    header h1 {
      font-size: 2.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    
    header p {
      color: #888;
      font-size: 1rem;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: transform 0.3s, box-shadow 0.3s;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }
    
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .stat-label {
      color: #888;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .stat-card.success .stat-value { color: #4ade80; }
    .stat-card.warning .stat-value { color: #fbbf24; }
    .stat-card.error .stat-value { color: #f87171; }
    .stat-card.info .stat-value { color: #60a5fa; }
    
    .section {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .section h2 {
      font-size: 1.4rem;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }
    
    .chart-container {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .chart-container h3 {
      margin-bottom: 16px;
      color: #ccc;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    th {
      color: #888;
      font-weight: 500;
      text-transform: uppercase;
      font-size: 0.8rem;
      letter-spacing: 1px;
    }
    
    tr:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    
    .status {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .status.passed {
      background: rgba(74, 222, 128, 0.15);
      color: #4ade80;
    }
    
    .status.failed {
      background: rgba(248, 113, 113, 0.15);
      color: #f87171;
    }
    
    .status.skipped {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
    }
    
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .badge.flaky {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }
    
    .progress-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }
    
    .progress-bar .fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.5s ease;
    }
    
    .progress-bar .fill.success { background: linear-gradient(90deg, #4ade80, #22c55e); }
    .progress-bar .fill.warning { background: linear-gradient(90deg, #fbbf24, #f59e0b); }
    .progress-bar .fill.error { background: linear-gradient(90deg, #f87171, #ef4444); }
    
    .empty-state {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    
    .empty-state .icon {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    
    footer {
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 0.9rem;
    }
  </style>`;
  }

  /**
   * Generates the page header
   */
  private generateHeader(): string {
    return `
    <header>
      <h1>🧪 Test Framework Dashboard</h1>
      <p>Last updated: ${new Date().toLocaleString()}</p>
    </header>`;
  }

  /**
   * Generates the statistics grid
   */
  private generateStatsGrid(stats: DashboardData['stats']): string {
    const passRateClass = DashboardUtils.getPassRateClass(stats.avgPassRate);

    return `
    <div class="stats-grid">
      <div class="stat-card info">
        <div class="stat-value">${stats.totalRuns}</div>
        <div class="stat-label">Total Runs</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${stats.totalTests}</div>
        <div class="stat-label">Total Tests Executed</div>
      </div>
      <div class="stat-card ${passRateClass}">
        <div class="stat-value">${stats.avgPassRate.toFixed(1)}%</div>
        <div class="stat-label">Avg Pass Rate</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${DashboardUtils.formatDuration(stats.avgDuration)}</div>
        <div class="stat-label">Avg Duration</div>
      </div>
    </div>`;
  }

  /**
   * Generates the charts grid container
   */
  private generateChartsGrid(): string {
    return `
    <div class="charts-grid">
      <div class="chart-container">
        <h3>📈 Pass Rate Trend</h3>
        <canvas id="passRateChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>⏱️ Duration Trend</h3>
        <canvas id="durationChart"></canvas>
      </div>
    </div>`;
  }

  /**
   * Generates the recent test runs section
   */
  private generateRunsSection(runs: TestRun[]): string {
    if (runs.length === 0) {
      return `
    <div class="section">
      <h2>🕐 Recent Test Runs</h2>
      <div class="empty-state">
        <div class="icon">📭</div>
        <p>No test runs yet. Run some tests to see data here.</p>
      </div>
    </div>`;
    }

    const rows = runs.map((run) => this.generateRunRow(run)).join('');

    return `
    <div class="section">
      <h2>🕐 Recent Test Runs</h2>
      <table>
        <thead>
          <tr>
            <th>Run ID</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Pass Rate</th>
            <th>Environment</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generates a single run table row
   */
  private generateRunRow(run: TestRun): string {
    const passRateClass = DashboardUtils.getPassRateClass(run.passRate);
    const failedDisplay =
      run.failed > 0
        ? `<span class="status failed">✗ ${run.failed}</span>`
        : '<span style="color:#666">0</span>';

    return `
          <tr>
            <td><code>${run.runId.substring(0, 8)}</code></td>
            <td>${new Date(run.startedAt).toLocaleString()}</td>
            <td>${DashboardUtils.formatDuration(run.durationMs)}</td>
            <td><span class="status passed">✓ ${run.passed}</span></td>
            <td>${failedDisplay}</td>
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                <div class="progress-bar" style="width:100px;">
                  <div class="fill ${passRateClass}" style="width:${run.passRate}%"></div>
                </div>
                <span>${run.passRate.toFixed(1)}%</span>
              </div>
            </td>
            <td>${run.environment}</td>
          </tr>`;
  }

  /**
   * Generates the latest failures section
   */
  private generateFailuresSection(failures: TestResult[]): string {
    if (failures.length === 0) {
      return '';
    }

    const rows = failures.map((test) => this.generateFailureRow(test)).join('');

    return `
    <div class="section">
      <h2>❌ Latest Failures</h2>
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>File</th>
            <th>Browser</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generates a single failure table row
   */
  private generateFailureRow(test: TestResult): string {
    const filename = DashboardUtils.extractFilename(test.testFile);
    const errorMessage = test.errorMessage
      ? DashboardUtils.escapeHtml(test.errorMessage.split('\n')[0])
      : 'No error message';
    const fullError = test.errorMessage ? DashboardUtils.escapeHtml(test.errorMessage) : '';

    return `
          <tr>
            <td>${test.testName}</td>
            <td><code>${filename}</code></td>
            <td>${test.browser}</td>
            <td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${fullError}">
              ${errorMessage}
            </td>
          </tr>`;
  }

  /**
   * Generates the flaky tests section
   */
  private generateFlakyTestsSection(flakyTests: TestHistory[]): string {
    if (flakyTests.length === 0) {
      return '';
    }

    const rows = flakyTests.map((test) => this.generateFlakyTestRow(test)).join('');

    return `
    <div class="section">
      <h2>⚠️ Flaky Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Total Runs</th>
            <th>Pass / Fail</th>
            <th>Flakiness Score</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generates a single flaky test table row
   */
  private generateFlakyTestRow(test: TestHistory): string {
    const flakinessScore = (test.flakinessScore ?? 0).toFixed(1);

    return `
          <tr>
            <td>${test.testName}</td>
            <td>${test.totalRuns}</td>
            <td>
              <span style="color:#4ade80">${test.passCount}</span> / 
              <span style="color:#f87171">${test.failCount}</span>
            </td>
            <td>
              <span class="badge flaky">${flakinessScore}%</span>
            </td>
          </tr>`;
  }

  /**
   * Generates the slowest tests section
   */
  private generateSlowestTestsSection(slowestTests: TestHistory[]): string {
    if (slowestTests.length === 0) {
      return '';
    }

    const rows = slowestTests
      .slice(0, 10)
      .map((test) => this.generateSlowTestRow(test))
      .join('');

    return `
    <div class="section">
      <h2>🐢 Slowest Tests</h2>
      <table>
        <thead>
          <tr>
            <th>Test Name</th>
            <th>Avg Duration</th>
            <th>Min</th>
            <th>Max</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generates a single slow test table row
   */
  private generateSlowTestRow(test: TestHistory): string {
    return `
          <tr>
            <td>${test.testName}</td>
            <td><strong>${DashboardUtils.formatDuration(test.avgDurationMs)}</strong></td>
            <td>${DashboardUtils.formatDuration(test.minDurationMs)}</td>
            <td>${DashboardUtils.formatDuration(test.maxDurationMs)}</td>
          </tr>`;
  }

  /**
   * Generates the page footer
   */
  private generateFooter(): string {
    return `
    <footer>
      <p>Generated by Test Framework Dashboard • Powered by Playwright</p>
    </footer>`;
  }

  /**
   * Generates the Chart.js scripts
   */
  private generateChartScripts(chartData: ChartData): string {
    return `
  <script>
    // Pass Rate Chart
    new Chart(document.getElementById('passRateChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(chartData.labels)},
        datasets: [{
          label: 'Pass Rate (%)',
          data: ${JSON.stringify(chartData.passRateTrend)},
          borderColor: '#4ade80',
          backgroundColor: 'rgba(74, 222, 128, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } },
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } }
        }
      }
    });
    
    // Duration Chart
    new Chart(document.getElementById('durationChart'), {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(chartData.labels)},
        datasets: [{
          label: 'Duration (s)',
          data: ${JSON.stringify(chartData.durationTrend)},
          backgroundColor: 'rgba(96, 165, 250, 0.6)',
          borderColor: '#60a5fa',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } },
          x: { grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#888' } }
        }
      }
    });
  </script>`;
  }
}

export default HtmlTemplateEngine;
