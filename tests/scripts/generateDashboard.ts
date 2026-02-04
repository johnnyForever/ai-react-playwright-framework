#!/usr/bin/env tsx
/**
 * CLI Script to generate test dashboard
 * Usage: npx tsx tests/scripts/generateDashboard.ts
 */

import { generateDashboard } from '../reporters/dashboardGenerator';
import { TestDatabase } from '../db/database';

const args = process.argv.slice(2);
const command = args[0] || 'dashboard';

function printHelp(): void {
  console.log(`
📊 Test Framework CLI

Commands:
  dashboard     Generate HTML dashboard from test results
  stats         Show overall test statistics
  flaky         List flaky tests
  slowest       List slowest tests
  failures      List most failing tests
  runs          List recent test runs
  help          Show this help message

Examples:
  npx ts-node tests/scripts/generateDashboard.ts dashboard
  npx ts-node tests/scripts/generateDashboard.ts stats
  npx ts-node tests/scripts/generateDashboard.ts flaky
  `);
}

function printStats(): void {
  const db = TestDatabase.getInstance();
  const stats = db.getOverallStats();
  
  console.log('\n📊 Overall Test Statistics');
  console.log('═'.repeat(40));
  console.log(`Total Runs:        ${stats.totalRuns}`);
  console.log(`Total Tests:       ${stats.totalTests}`);
  console.log(`Avg Pass Rate:     ${stats.avgPassRate.toFixed(1)}%`);
  console.log(`Avg Duration:      ${formatDuration(stats.avgDuration)}`);
  console.log('═'.repeat(40));
}

function printFlakyTests(): void {
  const db = TestDatabase.getInstance();
  const flakyTests = db.getFlakyTests(5);
  
  console.log('\n⚠️  Flaky Tests (>5% failure rate)');
  console.log('═'.repeat(60));
  
  if (flakyTests.length === 0) {
    console.log('No flaky tests detected! 🎉');
  } else {
    flakyTests.forEach((test, i) => {
      console.log(`${i + 1}. ${test.testName}`);
      console.log(`   Flakiness: ${(test.flakinessScore ?? 0).toFixed(1)}% | Runs: ${test.totalRuns} | Failures: ${test.failCount}`);
    });
  }
  console.log('═'.repeat(60));
}

function printSlowestTests(): void {
  const db = TestDatabase.getInstance();
  const slowTests = db.getSlowestTests(10);
  
  console.log('\n🐢 Slowest Tests');
  console.log('═'.repeat(60));
  
  if (slowTests.length === 0) {
    console.log('No test data available yet.');
  } else {
    slowTests.forEach((test, i) => {
      console.log(`${i + 1}. ${test.testName}`);
      console.log(`   Avg: ${formatDuration(test.avgDurationMs)} | Min: ${formatDuration(test.minDurationMs)} | Max: ${formatDuration(test.maxDurationMs)}`);
    });
  }
  console.log('═'.repeat(60));
}

function printFailures(): void {
  const db = TestDatabase.getInstance();
  const failingTests = db.getMostFailingTests(10);
  
  console.log('\n❌ Most Failing Tests');
  console.log('═'.repeat(60));
  
  if (failingTests.length === 0) {
    console.log('No test failures recorded! 🎉');
  } else {
    failingTests.forEach((test, i) => {
      console.log(`${i + 1}. ${test.testName}`);
      console.log(`   Failures: ${test.failCount} / ${test.totalRuns} runs | Last failed: ${test.lastFailedAt || 'N/A'}`);
    });
  }
  console.log('═'.repeat(60));
}

function printRuns(): void {
  const db = TestDatabase.getInstance();
  const runs = db.getRecentTestRuns(10);
  
  console.log('\n🕐 Recent Test Runs');
  console.log('═'.repeat(80));
  
  if (runs.length === 0) {
    console.log('No test runs recorded yet. Run some tests first!');
  } else {
    console.log('Run ID     | Date                | Duration | Passed | Failed | Pass Rate');
    console.log('-'.repeat(80));
    runs.forEach(run => {
      const date = new Date(run.startedAt).toLocaleString();
      console.log(
        `${run.runId.substring(0, 8)} | ${date.padEnd(19)} | ${formatDuration(run.durationMs).padEnd(8)} | ${String(run.passed).padEnd(6)} | ${String(run.failed).padEnd(6)} | ${run.passRate.toFixed(1)}%`
      );
    });
  }
  console.log('═'.repeat(80));
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

// Main
switch (command) {
  case 'dashboard':
    console.log('🎨 Generating Test Dashboard...\n');
    generateDashboard();
    console.log('\nOpen test-results/dashboard.html to view the dashboard.');
    break;
  case 'stats':
    printStats();
    break;
  case 'flaky':
    printFlakyTests();
    break;
  case 'slowest':
    printSlowestTests();
    break;
  case 'failures':
    printFailures();
    break;
  case 'runs':
    printRuns();
    break;
  case 'help':
  default:
    printHelp();
}
