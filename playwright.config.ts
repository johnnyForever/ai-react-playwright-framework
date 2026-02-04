import { defineConfig, devices } from '@playwright/test';
import { STORAGE_STATE_PATH } from './tests/auth/constants';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Playwright configuration
 * @see https://playwright.dev/docs/test-configuration
 * 
 * Test Tags:
 *   @smoke - Critical path tests for quick feedback
 *   @regression - Full test suite
 * 
 * Run tagged tests:
 *   npx playwright test --grep @smoke
 *   npx playwright test --grep @regression
 * 
 * Projects:
 *   - setup: Authenticates and saves storage state
 *   - chromium/firefox/webkit: Run tests with pre-authenticated state
 *   - chromium-no-auth: Run tests without authentication (login tests)
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list'],
    // Allure reporter for rich test reporting
    ['allure-playwright', {
      outputFolder: 'allure-results',
      suiteTitle: true,
      categories: [
        { name: 'Passed', matchedStatuses: ['passed'] },
        { name: 'Failed', matchedStatuses: ['failed'] },
        { name: 'Broken', matchedStatuses: ['broken'] },
        { name: 'Skipped', matchedStatuses: ['skipped'] },
      ],
    }],
    // Custom DB reporter for historical test tracking
    ['./tests/reporters/dbReporter.ts', {
      environment: process.env.TEST_ENVIRONMENT || 'local',
      trigger: process.env.TEST_TRIGGER || 'manual'
    }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // === API TESTS ===
    // API tests run independently without browser
    {
      name: 'api',
      testDir: './tests/api',
      testMatch: /\.api\.spec\.ts/,
      use: {
        baseURL: 'http://localhost:3001',
      },
    },

    // === SETUP PROJECT ===
    // Runs first to authenticate and save storage state
    {
      name: 'setup',
      testDir: './tests/auth',
      testMatch: /auth\.setup\.ts/,
    },

    // === UNAUTHENTICATED TESTS ===
    // For login tests that need to start logged out
    {
      name: 'chromium-no-auth',
      testMatch: /login\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // === SMOKE TESTS ===
    // Quick feedback on chromium only
    {
      name: 'smoke',
      grep: /@smoke/,
      grepInvert: /login\.spec\.ts/, // Exclude login tests (they run separately)
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
    },

    // === AUTHENTICATED BROWSER TESTS ===
    // Full regression on all browsers with pre-authenticated state
    {
      name: 'chromium',
      testIgnore: /login\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Chrome'],
        storageState: STORAGE_STATE_PATH,
      },
    },
    {
      name: 'webkit',
      testIgnore: /login\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Desktop Safari'],
        storageState: STORAGE_STATE_PATH,
      },
    },

    // === MOBILE TESTS ===
    // Mobile viewport testing with pre-authenticated state
    {
      name: 'mobile-chrome',
      testIgnore: /login\.spec\.ts/,
      dependencies: ['setup'],
      use: { 
        ...devices['Pixel 7'],
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run api:start',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 10000,
    },
  ],
});
