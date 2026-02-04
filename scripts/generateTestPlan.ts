/**
 * Test Plan Document Generator
 * Generates a comprehensive test plan Word document for the project
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  PageBreak,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// Document metadata
const PROJECT_NAME = 'React Playwright Test Framework';
const VERSION = '1.0';
const DATE = new Date().toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

// Helper to create a styled heading
function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 400, after: 200 },
  });
}

// Helper to create a paragraph
function createParagraph(text: string, options: { bold?: boolean; indent?: number } = {}) {
  return new Paragraph({
    children: [new TextRun({ text, bold: options.bold })],
    spacing: { after: 120 },
    indent: options.indent ? { left: options.indent } : undefined,
  });
}

// Helper to create a bullet point
function createBullet(text: string, level = 0) {
  return new Paragraph({
    children: [new TextRun(text)],
    bullet: { level },
    spacing: { after: 80 },
  });
}

// Helper to create a table
function createTable(headers: string[], rows: string[][]) {
  const borderStyle = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: '000000',
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Header row
      new TableRow({
        tableHeader: true,
        children: headers.map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
              shading: { fill: '4472C4' },
              borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
            })
        ),
      }),
      // Data rows
      ...rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [new Paragraph(cell)],
                  borders: { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle },
                })
            ),
          })
      ),
    ],
  });
}

// Generate the test plan document
async function generateTestPlan() {
  const doc = new Document({
    creator: 'Test Automation Team',
    title: `${PROJECT_NAME} - Test Plan`,
    description: 'Comprehensive test plan for the React Playwright Test Framework',
    styles: {
      paragraphStyles: [
        {
          id: 'Normal',
          name: 'Normal',
          run: { font: 'Calibri', size: 24 },
        },
      ],
    },
    sections: [
      {
        children: [
          // ===== TITLE PAGE =====
          new Paragraph({
            children: [new TextRun({ text: PROJECT_NAME, bold: true, size: 56 })],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 400 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'TEST PLAN', bold: true, size: 48 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 800 },
          }),
          new Paragraph({
            children: [new TextRun({ text: `Version ${VERSION}`, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: DATE, size: 28 })],
            alignment: AlignmentType.CENTER,
            spacing: { after: 2000 },
          }),

          // Document info table
          createTable(
            ['Field', 'Value'],
            [
              ['Document Title', 'Test Plan'],
              ['Project Name', PROJECT_NAME],
              ['Version', VERSION],
              ['Created Date', DATE],
              ['Author', 'Test Automation Team'],
              ['Status', 'Active'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== TABLE OF CONTENTS =====
          createHeading('Table of Contents', HeadingLevel.HEADING_1),
          createParagraph('1. Introduction'),
          createParagraph('2. Test Strategy'),
          createParagraph('3. Test Scope'),
          createParagraph('4. Test Environment'),
          createParagraph('5. Test Categories'),
          createParagraph('6. Test Cases Overview'),
          createParagraph('7. Entry and Exit Criteria'),
          createParagraph('8. Risk Assessment'),
          createParagraph('9. Test Schedule'),
          createParagraph('10. Deliverables'),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 1. INTRODUCTION =====
          createHeading('1. Introduction', HeadingLevel.HEADING_1),

          createHeading('1.1 Purpose', HeadingLevel.HEADING_2),
          createParagraph(
            'This document describes the test plan for the React Playwright Test Framework project. It outlines the testing approach, scope, resources, and schedule for ensuring the quality and reliability of the application.'
          ),

          createHeading('1.2 Project Overview', HeadingLevel.HEADING_2),
          createParagraph(
            'The React Playwright Test Framework is a modern web application built with React 19, TypeScript, and Vite. It features a comprehensive testing strategy including unit tests, end-to-end (E2E) tests, and API tests.'
          ),

          createHeading('1.3 Technology Stack', HeadingLevel.HEADING_2),
          createBullet('Frontend: React 19 + TypeScript + Vite'),
          createBullet('API Server: Express.js with JWT Authentication'),
          createBullet('Unit Testing: Vitest + React Testing Library'),
          createBullet('E2E Testing: Playwright with Page Object Model'),
          createBullet('API Testing: Playwright API testing with performance metrics'),
          createBullet('CI/CD: GitHub Actions'),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 2. TEST STRATEGY =====
          createHeading('2. Test Strategy', HeadingLevel.HEADING_1),

          createHeading('2.1 Testing Levels', HeadingLevel.HEADING_2),
          createTable(
            ['Level', 'Description', 'Tools'],
            [
              ['Unit Testing', 'Testing individual components and functions in isolation', 'Vitest, React Testing Library'],
              ['Integration Testing', 'Testing component interactions and API integrations', 'Vitest, Playwright'],
              ['End-to-End Testing', 'Testing complete user workflows through the UI', 'Playwright'],
              ['API Testing', 'Testing REST endpoints, authentication, and performance', 'Playwright API'],
              ['Performance Testing', 'Measuring response times and system behavior under load', 'Playwright, Custom metrics'],
            ]
          ),

          createHeading('2.2 Test Automation Approach', HeadingLevel.HEADING_2),
          createBullet('Page Object Model (POM) pattern for maintainable E2E tests'),
          createBullet('Custom fixtures for test isolation and reusability'),
          createBullet('Data-driven testing with test data factories'),
          createBullet('Parallel test execution for faster feedback'),
          createBullet('Automatic retry mechanism for flaky tests'),

          createHeading('2.3 Test Tagging Strategy', HeadingLevel.HEADING_2),
          createTable(
            ['Tag', 'Purpose', 'Execution Time'],
            [
              ['@smoke', 'Critical path tests for quick validation', '~2 minutes'],
              ['@regression', 'Full test suite for comprehensive coverage', '~15 minutes'],
              ['@api', 'API-specific tests', '~3 minutes'],
              ['@performance', 'Performance and load tests', '~5 minutes'],
              ['@slow', 'Tests that intentionally test slow operations', 'Variable'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 3. TEST SCOPE =====
          createHeading('3. Test Scope', HeadingLevel.HEADING_1),

          createHeading('3.1 In Scope', HeadingLevel.HEADING_2),
          createBullet('User authentication (login, logout, session management)'),
          createBullet('Dashboard functionality (product listing, sorting, navigation)'),
          createBullet('Shopping basket operations (add, remove, update)'),
          createBullet('Checkout process (order placement, confirmation)'),
          createBullet('Product detail pages'),
          createBullet('Admin functionality (product management)'),
          createBullet('API endpoints (CRUD operations, authentication)'),
          createBullet('Performance metrics and thresholds'),

          createHeading('3.2 Out of Scope', HeadingLevel.HEADING_2),
          createBullet('Payment gateway integration (mocked)'),
          createBullet('Third-party service integrations'),
          createBullet('Mobile native application testing'),
          createBullet('Load testing beyond defined thresholds'),

          createHeading('3.3 Browser Coverage', HeadingLevel.HEADING_2),
          createTable(
            ['Browser', 'Version', 'Priority'],
            [
              ['Chromium', 'Latest', 'Primary'],
              ['WebKit (Safari)', 'Latest', 'Secondary'],
              ['Firefox', 'Latest', 'Secondary'],
              ['Mobile Chrome (Pixel 7)', 'Latest', 'Tertiary'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 4. TEST ENVIRONMENT =====
          createHeading('4. Test Environment', HeadingLevel.HEADING_1),

          createHeading('4.1 Local Development', HeadingLevel.HEADING_2),
          createTable(
            ['Component', 'URL', 'Purpose'],
            [
              ['Frontend (Vite)', 'http://localhost:5173', 'React development server'],
              ['API Server', 'http://localhost:3001', 'Express.js REST API'],
              ['Test Database', 'SQLite (in-memory)', 'Test analytics storage'],
            ]
          ),

          createHeading('4.2 CI/CD Environment', HeadingLevel.HEADING_2),
          createBullet('Platform: GitHub Actions (Ubuntu Latest)'),
          createBullet('Node.js Version: 20.x'),
          createBullet('Playwright Browsers: Installed with dependencies'),
          createBullet('Secrets Management: GitHub Repository Secrets'),

          createHeading('4.3 Required Environment Variables', HeadingLevel.HEADING_2),
          createTable(
            ['Variable', 'Purpose', 'Required'],
            [
              ['TEST_USER_EMAIL', 'Standard user email for testing', 'Yes'],
              ['TEST_USER_PASSWORD', 'Standard user password', 'Yes'],
              ['TEST_ADMIN_EMAIL', 'Admin user email for testing', 'Yes'],
              ['TEST_ADMIN_PASSWORD', 'Admin user password', 'Yes'],
              ['VITE_USER_EMAIL', 'Frontend user email', 'Yes (CI)'],
              ['VITE_USER_PASSWORD', 'Frontend user password', 'Yes (CI)'],
              ['ENCRYPTION_KEY', 'Optional encryption for credentials', 'No'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 5. TEST CATEGORIES =====
          createHeading('5. Test Categories', HeadingLevel.HEADING_1),

          createHeading('5.1 Unit Tests (149 Tests)', HeadingLevel.HEADING_2),
          createParagraph('Unit tests are co-located with source files and cover:'),
          createTable(
            ['Component/Module', 'Test Count', 'Coverage Focus'],
            [
              ['LoginForm', '21', 'Form validation, submission, error handling'],
              ['CheckoutContent', '20', 'Cart display, totals, order flow'],
              ['authService', '15', 'Authentication logic, session management'],
              ['validation', '14', 'Email validation, form validation'],
              ['ProductCard', '14', 'Product display, basket integration'],
              ['BasketContext', '13', 'State management, add/remove items'],
              ['Navigation', '12', 'Menu rendering, active states'],
              ['DashboardHeader', '10', 'User display, logout, admin badge'],
              ['ProductList', '10', 'Product grid, sorting'],
              ['SortSelector', '8', 'Sort options, selection'],
              ['BasketIcon', '7', 'Icon display, count badge'],
              ['ProtectedRoute', '5', 'Route protection, redirects'],
            ]
          ),

          createHeading('5.2 E2E Tests (58 Tests)', HeadingLevel.HEADING_2),
          createTable(
            ['Test File', 'Feature Area', 'Test Count'],
            [
              ['login.spec.ts', 'Authentication & Login', '~20'],
              ['dashboard.spec.ts', 'Dashboard & Products', '~25'],
              ['basket.spec.ts', 'Basket & Checkout', '~13'],
            ]
          ),

          createHeading('5.3 API Tests (40 Tests)', HeadingLevel.HEADING_2),
          createTable(
            ['Test File', 'Coverage', 'Test Count'],
            [
              ['auth.api.spec.ts', 'Authentication endpoints (login, logout, token)', '14'],
              ['products.api.spec.ts', 'Product CRUD operations', '14'],
              ['performance.api.spec.ts', 'Response times, load testing, percentiles', '12'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 6. TEST CASES OVERVIEW =====
          createHeading('6. Test Cases Overview', HeadingLevel.HEADING_1),

          createHeading('6.1 Authentication Tests', HeadingLevel.HEADING_2),
          createTable(
            ['Test ID', 'Description', 'Priority', 'Type'],
            [
              ['AUTH-001', 'Valid user login redirects to dashboard', 'Critical', 'E2E'],
              ['AUTH-002', 'Invalid credentials show error message', 'High', 'E2E'],
              ['AUTH-003', 'Logout clears session and redirects to login', 'Critical', 'E2E'],
              ['AUTH-004', 'Protected routes redirect to login when unauthenticated', 'Critical', 'E2E'],
              ['AUTH-005', 'Remember me extends session duration', 'Medium', 'E2E'],
              ['AUTH-006', 'API login returns valid JWT token', 'Critical', 'API'],
              ['AUTH-007', 'API rejects invalid credentials with 401', 'High', 'API'],
              ['AUTH-008', 'Token refresh extends session', 'High', 'API'],
            ]
          ),

          createHeading('6.2 Dashboard Tests', HeadingLevel.HEADING_2),
          createTable(
            ['Test ID', 'Description', 'Priority', 'Type'],
            [
              ['DASH-001', 'Dashboard displays all products', 'Critical', 'E2E'],
              ['DASH-002', 'Products can be sorted by name A-Z', 'High', 'E2E'],
              ['DASH-003', 'Products can be sorted by name Z-A', 'High', 'E2E'],
              ['DASH-004', 'Products can be sorted by price low-high', 'High', 'E2E'],
              ['DASH-005', 'Products can be sorted by price high-low', 'High', 'E2E'],
              ['DASH-006', 'Clicking product navigates to detail page', 'High', 'E2E'],
              ['DASH-007', 'Admin badge visible for admin users', 'Medium', 'E2E'],
              ['DASH-008', 'User email displayed in header', 'Medium', 'E2E'],
            ]
          ),

          createHeading('6.3 Basket & Checkout Tests', HeadingLevel.HEADING_2),
          createTable(
            ['Test ID', 'Description', 'Priority', 'Type'],
            [
              ['BSKT-001', 'Add product to basket from dashboard', 'Critical', 'E2E'],
              ['BSKT-002', 'Remove product from basket', 'Critical', 'E2E'],
              ['BSKT-003', 'Basket count updates correctly', 'High', 'E2E'],
              ['BSKT-004', 'Basket state syncs between pages', 'High', 'E2E'],
              ['CHKT-001', 'Checkout displays basket items', 'Critical', 'E2E'],
              ['CHKT-002', 'Checkout shows correct total price', 'Critical', 'E2E'],
              ['CHKT-003', 'Finish order navigates to confirmation', 'Critical', 'E2E'],
              ['CHKT-004', 'Order confirmation clears basket', 'High', 'E2E'],
            ]
          ),

          createHeading('6.4 API Performance Tests', HeadingLevel.HEADING_2),
          createTable(
            ['Test ID', 'Description', 'Threshold', 'Type'],
            [
              ['PERF-001', 'Health endpoint responds quickly', '< 50ms', 'API'],
              ['PERF-002', 'Products list responds within threshold', '< 200ms', 'API'],
              ['PERF-003', 'Login completes within threshold', '< 300ms', 'API'],
              ['PERF-004', 'P95 response time under load', '< 200ms', 'API'],
              ['PERF-005', 'System handles 50 concurrent requests', 'Stability', 'Stress'],
              ['PERF-006', 'Sustained load over 3 seconds', '< 200ms avg', 'Stress'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 7. ENTRY AND EXIT CRITERIA =====
          createHeading('7. Entry and Exit Criteria', HeadingLevel.HEADING_1),

          createHeading('7.1 Entry Criteria', HeadingLevel.HEADING_2),
          createBullet('Code is committed and pushed to the repository'),
          createBullet('All dependencies are installed successfully'),
          createBullet('Development and API servers start without errors'),
          createBullet('Required environment variables are configured'),
          createBullet('Previous build (if any) completed successfully'),

          createHeading('7.2 Exit Criteria - Smoke Tests', HeadingLevel.HEADING_2),
          createBullet('All smoke tests pass (100% pass rate required)'),
          createBullet('No critical defects identified'),
          createBullet('Test execution completes within 5 minutes'),

          createHeading('7.3 Exit Criteria - Regression Tests', HeadingLevel.HEADING_2),
          createBullet('Pass rate >= 95%'),
          createBullet('No critical or high priority defects'),
          createBullet('All API performance thresholds met'),
          createBullet('Test execution completes within 30 minutes'),

          createHeading('7.4 Exit Criteria - Release', HeadingLevel.HEADING_2),
          createBullet('All unit tests pass (100%)'),
          createBullet('All E2E regression tests pass (>= 95%)'),
          createBullet('All API tests pass (100%)'),
          createBullet('No known critical defects'),
          createBullet('Performance metrics within acceptable thresholds'),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 8. RISK ASSESSMENT =====
          createHeading('8. Risk Assessment', HeadingLevel.HEADING_1),

          createTable(
            ['Risk', 'Impact', 'Probability', 'Mitigation'],
            [
              ['Flaky tests', 'Medium', 'Medium', 'Automatic retry (2x in CI), flaky test detection dashboard'],
              ['Environment issues', 'High', 'Low', 'Docker containers, consistent CI environment'],
              ['Credential exposure', 'Critical', 'Low', 'Environment variables, GitHub secrets, no hardcoding'],
              ['Browser compatibility', 'Medium', 'Medium', 'Cross-browser testing on Chromium, WebKit, Firefox'],
              ['Performance regression', 'High', 'Medium', 'Performance thresholds, P95/P99 metrics tracking'],
              ['Test data pollution', 'Medium', 'Low', 'Test isolation, cleanup hooks, fresh state per test'],
            ]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 9. TEST SCHEDULE =====
          createHeading('9. Test Schedule', HeadingLevel.HEADING_1),

          createHeading('9.1 Continuous Integration', HeadingLevel.HEADING_2),
          createTable(
            ['Trigger', 'Test Suite', 'Duration', 'Browsers'],
            [
              ['Push to main', 'Full regression', '~15 min', 'All'],
              ['Pull request', 'Smoke tests', '~5 min', 'Chromium only'],
              ['Manual dispatch', 'Configurable', 'Variable', 'Selectable'],
              ['Scheduled (daily)', 'Full regression', '~15 min', 'All'],
            ]
          ),

          createHeading('9.2 Development Workflow', HeadingLevel.HEADING_2),
          createBullet('Unit tests: Run on file save (watch mode)'),
          createBullet('Smoke tests: Run before creating PR'),
          createBullet('Full regression: Run after PR merge'),
          createBullet('Performance tests: Run before release'),

          new Paragraph({ children: [new PageBreak()] }),

          // ===== 10. DELIVERABLES =====
          createHeading('10. Deliverables', HeadingLevel.HEADING_1),

          createHeading('10.1 Test Reports', HeadingLevel.HEADING_2),
          createTable(
            ['Report', 'Format', 'Location'],
            [
              ['Playwright HTML Report', 'HTML', 'playwright-report/index.html'],
              ['Allure Report', 'HTML', 'allure-report/index.html'],
              ['JUnit XML', 'XML', 'test-results/junit.xml'],
              ['Test Dashboard', 'HTML', 'test-results/dashboard.html'],
              ['Test Analytics DB', 'SQLite', 'test-results/test-analytics.db'],
            ]
          ),

          createHeading('10.2 Artifacts', HeadingLevel.HEADING_2),
          createBullet('Screenshots on test failure'),
          createBullet('Video recordings (on demand)'),
          createBullet('Trace files for debugging'),
          createBullet('Console and network logs'),
          createBullet('Performance metrics and percentiles'),

          createHeading('10.3 Documentation', HeadingLevel.HEADING_2),
          createBullet('Test Plan (this document)'),
          createBullet('Testing Guide (docs/TESTING.md)'),
          createBullet('Logger Documentation (docs/LOGGER.md)'),
          createBullet('Database Documentation (docs/DATABASE.md)'),

          // ===== APPROVAL =====
          new Paragraph({ children: [new PageBreak()] }),
          createHeading('Document Approval', HeadingLevel.HEADING_1),

          createTable(
            ['Role', 'Name', 'Signature', 'Date'],
            [
              ['QA Lead', '', '', ''],
              ['Development Lead', '', '', ''],
              ['Project Manager', '', '', ''],
            ]
          ),

          new Paragraph({ spacing: { before: 400 } }),
          createParagraph('--- End of Document ---', { bold: true }),
        ],
      },
    ],
  });

  // Generate the document
  const buffer = await Packer.toBuffer(doc);
  
  // Save to docs folder
  const outputPath = path.join(process.cwd(), 'docs', 'TestPlan.docx');
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Test Plan generated: ${outputPath}`);
  return outputPath;
}

// Run the generator
generateTestPlan().catch(console.error);
