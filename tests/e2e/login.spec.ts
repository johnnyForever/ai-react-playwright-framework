import { expect, test } from '@tests/fixtures/auth.fixture';
import { invalidCredentials, routes, validUser } from '@tests/fixtures/testData';

/**
 * Login Feature Tests
 *
 * Tests follow journey-based approach: related assertions grouped into meaningful user flows
 */

test.describe('Login Feature', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test(
    'successful login with valid credentials redirects to dashboard',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage, dashboardPage }) => {
      await test.step('Enter valid credentials and submit', async () => {
        await loginPage.login(validUser.email, validUser.password);
      });

      await test.step('Verify redirect to dashboard with user info', async () => {
        await loginPage.waitForPath(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
        await expect(dashboardPage.userEmail).toContainText(validUser.email);
      });
    },
  );

  test(
    'login with remember me option works correctly',
    { tag: ['@regression'] },
    async ({ loginPage, dashboardPage }) => {
      await test.step('Login with remember me checked', async () => {
        await loginPage.login(validUser.email, validUser.password, true);
      });

      await test.step('Verify successful login', async () => {
        await loginPage.waitForPath(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
      });
    },
  );

  test(
    'invalid credentials show appropriate error messages',
    { tag: ['@smoke', '@regression'] },
    async ({ loginPage }) => {
      await test.step('Submit with completely invalid credentials', async () => {
        await loginPage.login(invalidCredentials.email, invalidCredentials.password);
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
      });

      await test.step('Submit with valid email but wrong password', async () => {
        await loginPage.navigate(); // Reset form
        await loginPage.login(validUser.email, 'wrongpassword');
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
      });
    },
  );

  test(
    'frontend validation prevents invalid form submission',
    { tag: ['@regression'] },
    async ({ loginPage, page }) => {
      let apiCalled = false;
      page.on('request', (request) => {
        if (request.url().includes('/api/')) {
          apiCalled = true;
        }
      });

      await test.step('Empty email shows validation error', async () => {
        await loginPage.fillPassword(validUser.password);
        await loginPage.submit();
        await expect(loginPage.page.getByText('Email is required')).toBeVisible();
      });

      await test.step('Empty password shows validation error', async () => {
        await loginPage.navigate(); // Reset form
        await loginPage.fillEmail(validUser.email);
        await loginPage.submit();
        await expect(loginPage.page.getByText('Password is required')).toBeVisible();
      });

      await test.step('Invalid email format shows validation error', async () => {
        await loginPage.navigate(); // Reset form
        await loginPage.fillEmail('notvalidemail');
        await loginPage.fillPassword(validUser.password);
        await loginPage.submit();
        await expect(
          loginPage.page.getByText('Please enter a valid email address'),
        ).toBeVisible();
      });

      await test.step('Verify no API calls were made for invalid forms', async () => {
        expect(apiCalled).toBe(false);
      });
    },
  );

  test(
    'login form elements display and function correctly',
    { tag: ['@regression'] },
    async ({ loginPage }) => {
      await test.step('Verify all form elements are visible', async () => {
        await expect(loginPage.emailInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.submitButton).toBeVisible();
      });

      await test.step('Remember me checkbox is unchecked by default', async () => {
        await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
      });

      await test.step('Remember me checkbox can be toggled', async () => {
        await loginPage.toggleRememberMe(true);
        await expect(loginPage.rememberMeCheckbox).toBeChecked();
        
        await loginPage.toggleRememberMe(false);
        await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
      });
    },
  );

  test(
    'navigation links work correctly from login page',
    { tag: ['@regression'] },
    async ({ loginPage }) => {
      await test.step('Verify navigation is visible', async () => {
        await expect(loginPage.navigation).toBeVisible();
      });

      await test.step('Navigate to forgot password page', async () => {
        await loginPage.clickForgotPassword();
        await loginPage.waitForPath(routes.forgotPassword);
        await expect(
          loginPage.page.getByRole('heading', { name: 'Forgot Password' }),
        ).toBeVisible();
      });

      await test.step('Navigate back to login page', async () => {
        await loginPage.navigate();
        expect(loginPage.getCurrentPath()).toBe(routes.login);
        await expect(loginPage.pageTitle).toHaveText('Login');
      });

      await test.step('Navigate to admin page via nav link', async () => {
        await loginPage.clickAdminNav();
        await loginPage.waitForPath(routes.admin);
        await expect(loginPage.pageTitle).toHaveText('Admin Login');
      });
    },
  );

  test(
    'navigation visibility differs by page type',
    { tag: ['@regression'] },
    async ({ loginPage, page }) => {
      await test.step('Navigation is visible on admin page', async () => {
        await page.goto(routes.admin);
        await expect(loginPage.navigation).toBeVisible();
      });

      await test.step('Navigation is NOT visible on forgot password page', async () => {
        await page.goto(routes.forgotPassword);
        await expect(loginPage.navigation).not.toBeVisible();
      });

      await test.step('Navigation is NOT visible on dashboard (after login)', async () => {
        await loginPage.navigate();
        await loginPage.login(validUser.email, validUser.password);
        await loginPage.waitForPath(routes.dashboard);
        await expect(loginPage.navigation).not.toBeVisible();
      });
    },
  );

  test(
    'page titles display correctly',
    { tag: ['@regression'] },
    async ({ loginPage, page }) => {
      await test.step('Login page shows "Login" title', async () => {
        await expect(loginPage.pageTitle).toHaveText('Login');
      });

      await test.step('Admin page shows "Admin Login" title', async () => {
        await page.goto(routes.admin);
        await expect(loginPage.pageTitle).toHaveText('Admin Login');
      });
    },
  );
});
