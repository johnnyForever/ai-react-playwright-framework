/**
 * Test Dashboard Generator
 * Creates an HTML dashboard from test results stored in the database
 */

import * as fs from 'fs';
import * as path from 'path';
import { TestDatabase, TestRun, TestResult, TestHistory } from '../db/database';

interface DashboardData {
  runs: TestRun[];
  stats: {
    totalRuns: number;
    totalTests: number;
    avgPassRate: number;
    avgDuration: number;
  };
  flakyTests: TestHistory[];
  slowestTests: TestHistory[];
  mostFailingTests: TestHistory[];
  latestFailures: TestResult[];
}

export function generateDashboard(dbPath?: string, outputPath?: string): void {
  const db = TestDatabase.getInstance(dbPath);
  
  const data: DashboardData = {
    runs: db.getRecentTestRuns(20),
    stats: db.getOverallStats(),
    flakyTests: db.getFlakyTests(10),
    slowestTests: db.getSlowestTests(10),
    mostFailingTests: db.getMostFailingTests(10),
    latestFailures: []
  };

  // Get failures from latest run
  if (data.runs.length > 0) {
    data.latestFailures = db.getFailedTests(data.runs[0].runId);
  }

  const html = generateHtml(data);
  
  const finalOutputPath = outputPath || path.join(process.cwd(), 'test-results', 'dashboard.html');
  fs.writeFileSync(finalOutputPath, html);
  
  console.log(`📊 Dashboard generated: ${finalOutputPath}`);
}

function generateHtml(data: DashboardData): string {
  const passRateTrend = data.runs.slice(0, 10).reverse().map(r => r.passRate.toFixed(1));
  const durationTrend = data.runs.slice(0, 10).reverse().map(r => (r.durationMs / 1000).toFixed(1));
  const labels = data.runs.slice(0, 10).reverse().map((_, i) => `Run ${i + 1}`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Framework Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
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
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🧪 Test Framework Dashboard</h1>
      <p>Last updated: ${new Date().toLocaleString()}</p>
    </header>
    
    <div class="stats-grid">
      <div class="stat-card info">
        <div class="stat-value">${data.stats.totalRuns}</div>
        <div class="stat-label">Total Runs</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${data.stats.totalTests}</div>
        <div class="stat-label">Total Tests Executed</div>
      </div>
      <div class="stat-card ${data.stats.avgPassRate >= 90 ? 'success' : data.stats.avgPassRate >= 70 ? 'warning' : 'error'}">
        <div class="stat-value">${data.stats.avgPassRate.toFixed(1)}%</div>
        <div class="stat-label">Avg Pass Rate</div>
      </div>
      <div class="stat-card info">
        <div class="stat-value">${formatDuration(data.stats.avgDuration)}</div>
        <div class="stat-label">Avg Duration</div>
      </div>
    </div>
    
    <div class="charts-grid">
      <div class="chart-container">
        <h3>📈 Pass Rate Trend</h3>
        <canvas id="passRateChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>⏱️ Duration Trend</h3>
        <canvas id="durationChart"></canvas>
      </div>
    </div>
    
    <div class="section">
      <h2>🕐 Recent Test Runs</h2>
      ${data.runs.length > 0 ? `
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
            ${data.runs.map(run => `
              <tr>
                <td><code>${run.runId.substring(0, 8)}</code></td>
                <td>${new Date(run.startedAt).toLocaleString()}</td>
                <td>${formatDuration(run.durationMs)}</td>
                <td><span class="status passed">✓ ${run.passed}</span></td>
                <td>${run.failed > 0 ? `<span class="status failed">✗ ${run.failed}</span>` : '<span style="color:#666">0</span>'}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div class="progress-bar" style="width:100px;">
                      <div class="fill ${run.passRate >= 90 ? 'success' : run.passRate >= 70 ? 'warning' : 'error'}" style="width:${run.passRate}%"></div>
                    </div>
                    <span>${run.passRate.toFixed(1)}%</span>
                  </div>
                </td>
                <td>${run.environment}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : `
        <div class="empty-state">
          <div class="icon">📭</div>
          <p>No test runs yet. Run some tests to see data here.</p>
        </div>
      `}
    </div>
    
    ${data.latestFailures.length > 0 ? `
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
            ${data.latestFailures.map(test => `
              <tr>
                <td>${test.testName}</td>
                <td><code>${test.testFile.split(/[/\\]/).pop()}</code></td>
                <td>${test.browser}</td>
                <td style="max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(test.errorMessage || '')}">
                  ${escapeHtml(test.errorMessage?.split('\\n')[0] || 'No error message')}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
    
    ${data.flakyTests.length > 0 ? `
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
            ${data.flakyTests.map(test => `
              <tr>
                <td>${test.testName}</td>
                <td>${test.totalRuns}</td>
                <td>
                  <span style="color:#4ade80">${test.passCount}</span> / 
                  <span style="color:#f87171">${test.failCount}</span>
                </td>
                <td>
                  <span class="badge flaky">${(test.flakinessScore ?? 0).toFixed(1)}%</span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
    
    ${data.slowestTests.length > 0 ? `
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
            ${data.slowestTests.slice(0, 10).map(test => `
              <tr>
                <td>${test.testName}</td>
                <td><strong>${formatDuration(test.avgDurationMs)}</strong></td>
                <td>${formatDuration(test.minDurationMs)}</td>
                <td>${formatDuration(test.maxDurationMs)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}
    
    <footer>
      <p>Generated by Test Framework Dashboard • Powered by Playwright</p>
    </footer>
  </div>
  
  <script>
    // Pass Rate Chart
    new Chart(document.getElementById('passRateChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: 'Pass Rate (%)',
          data: ${JSON.stringify(passRateTrend)},
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
        labels: ${JSON.stringify(labels)},
        datasets: [{
          label: 'Duration (s)',
          data: ${JSON.stringify(durationTrend)},
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
  </script>
</body>
</html>`;
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// CLI runner
if (require.main === module) {
  console.log('🎨 Generating Test Dashboard...\n');
  generateDashboard();
}

export default generateDashboard;
