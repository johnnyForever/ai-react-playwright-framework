/**
 * Authentication Setup
 * Performs login and saves storage state for authenticated tests
 *
 * This runs once before all tests that require authentication.
 * The storage state (cookies, localStorage) is saved and reused.
 */

import { expect, test as setup } from '@playwright/test';
import { getCredentials } from '../data/credentials';
import { STORAGE_STATE_PATH } from './constants';

setup('authenticate', async ({ page }) => {
  // Get credentials (decrypted if ENCRYPTION_KEY is set)
  const credentials = getCredentials('standard');

  console.log(`🔐 Setting up authentication for: ${credentials.username}`);

  // Navigate to login page
  await page.goto('/login');

  // Fill login form using data-testid locators (consistent with LoginPage POM)
  await page.getByTestId('email-input').fill(credentials.username);
  await page.getByTestId('password-input').fill(credentials.password);

  // Submit login
  await page.getByTestId('login-submit').click();

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: 10000 });

  // Verify we're logged in by checking for dashboard header element
  await expect(page.getByTestId('dashboard-header')).toBeVisible({ timeout: 5000 });

  console.log('✅ Authentication successful, saving storage state...');

  // Save storage state (cookies, localStorage, sessionStorage)
  await page.context().storageState({ path: STORAGE_STATE_PATH });

  console.log(`💾 Storage state saved to: ${STORAGE_STATE_PATH}`);
});
