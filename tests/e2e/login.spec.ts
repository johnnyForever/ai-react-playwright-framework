import { test, expect } from '@tests/fixtures/auth.fixture';
import { validUser, invalidCredentials, routes } from '@tests/fixtures/testData';

test.describe('Login Feature', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  test.describe('Successful Login', () => {
    test('should redirect to dashboard with valid credentials', { tag: ['@smoke', '@regression'] }, async ({ loginPage, dashboardPage }) => {
      await test.step('Enter valid credentials', async () => {
        await loginPage.login(validUser.email, validUser.password);
      });

      await test.step('Verify redirect to dashboard', async () => {
        await loginPage.waitForPath(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
      });
    });

    test('should display user email on dashboard after login', { tag: ['@regression'] }, async ({ loginPage, dashboardPage }) => {
      await test.step('Login with valid user', async () => {
        await loginPage.login(validUser.email, validUser.password);
      });

      await test.step('Verify user email is displayed', async () => {
        await loginPage.waitForPath(routes.dashboard);
        await expect(dashboardPage.userEmail).toContainText(validUser.email);
      });
    });

    test('should work with remember me checked', { tag: ['@regression'] }, async ({ loginPage, dashboardPage }) => {
      await test.step('Login with remember me checked', async () => {
        await loginPage.login(validUser.email, validUser.password, true);
      });

      await test.step('Verify successful login', async () => {
        await loginPage.waitForPath(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
      });
    });
  });

  test.describe('Failed Login', () => {
    test('should show error message with invalid credentials', { tag: ['@smoke', '@regression'] }, async ({ loginPage }) => {
      await test.step('Attempt login with invalid credentials', async () => {
        await loginPage.login(invalidCredentials.email, invalidCredentials.password);
      });

      await test.step('Verify error message is displayed', async () => {
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
      });
    });

    test('should show error with valid email but wrong password', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Attempt login with wrong password', async () => {
        await loginPage.login(validUser.email, 'wrongpassword');
      });

      await test.step('Verify error message', async () => {
        await expect(loginPage.errorMessage).toBeVisible();
        await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
      });
    });
  });

  test.describe('Frontend Validation', () => {
    test('should show error when email is empty', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Submit form with only password', async () => {
        await loginPage.fillPassword(validUser.password);
        await loginPage.submit();
      });

      await test.step('Verify email required error', async () => {
        await expect(loginPage.page.getByText('Email is required')).toBeVisible();
      });
    });

    test('should show error when password is empty', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Submit form with only email', async () => {
        await loginPage.fillEmail(validUser.email);
        await loginPage.submit();
      });

      await test.step('Verify password required error', async () => {
        await expect(loginPage.page.getByText('Password is required')).toBeVisible();
      });
    });

    test('should show error for invalid email format', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Enter invalid email format', async () => {
        await loginPage.fillEmail('notvalidemail');
        await loginPage.fillPassword(validUser.password);
        await loginPage.submit();
      });

      await test.step('Verify email format error', async () => {
        await expect(loginPage.page.getByText('Please enter a valid email address')).toBeVisible();
      });
    });

    test('should not make backend call when form is invalid', { tag: ['@regression'] }, async ({ loginPage, page }) => {
      let apiCalled = false;
      
      await test.step('Set up API listener', async () => {
        page.on('request', (request) => {
          if (request.url().includes('/api/')) {
            apiCalled = true;
          }
        });
      });

      await test.step('Submit empty form', async () => {
        await loginPage.submit();
      });

      await test.step('Verify validation prevents API call', async () => {
        await expect(loginPage.page.getByText('Email is required')).toBeVisible();
        expect(apiCalled).toBe(false);
      });
    });
  });

  test.describe('Form Elements', () => {
    test('should have remember me checkbox unchecked by default', { tag: ['@regression'] }, async ({ loginPage }) => {
      await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
    });

    test('should toggle remember me checkbox', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Check the checkbox', async () => {
        await loginPage.toggleRememberMe(true);
        await expect(loginPage.rememberMeCheckbox).toBeChecked();
      });

      await test.step('Uncheck the checkbox', async () => {
        await loginPage.toggleRememberMe(false);
        await expect(loginPage.rememberMeCheckbox).not.toBeChecked();
      });
    });

    test('should have correct form labels', { tag: ['@regression'] }, async ({ loginPage }) => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });
  });

  test.describe('Navigation Links', () => {
    test('should navigate to forgot password page', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Click forgot password link', async () => {
        await loginPage.clickForgotPassword();
      });

      await test.step('Verify navigation to forgot password', async () => {
        await loginPage.waitForPath(routes.forgotPassword);
        await expect(loginPage.page.getByRole('heading', { name: 'Forgot Password' })).toBeVisible();
      });
    });

    test('should navigate to admin page via nav link', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Click admin nav link', async () => {
        await loginPage.clickAdminNav();
      });

      await test.step('Verify navigation to admin page', async () => {
        await loginPage.waitForPath(routes.admin);
        await expect(loginPage.pageTitle).toHaveText('Admin Login');
      });
    });

    test('should stay on login page when clicking login nav link', { tag: ['@regression'] }, async ({ loginPage }) => {
      await loginPage.clickLoginNav();

      expect(loginPage.getCurrentPath()).toBe(routes.login);
      await expect(loginPage.pageTitle).toHaveText('Login');
    });
  });

  test.describe('Navigation Visibility', () => {
    test('should show navigation on login page', { tag: ['@regression'] }, async ({ loginPage }) => {
      await expect(loginPage.navigation).toBeVisible();
    });

    test('should show navigation on admin page', { tag: ['@regression'] }, async ({ loginPage, page }) => {
      await page.goto(routes.admin);
      await expect(loginPage.navigation).toBeVisible();
    });

    test('should NOT show navigation on dashboard page', { tag: ['@regression'] }, async ({ loginPage }) => {
      await test.step('Login to dashboard', async () => {
        await loginPage.login(validUser.email, validUser.password);
        await loginPage.waitForPath(routes.dashboard);
      });

      await test.step('Verify navigation is hidden', async () => {
        await expect(loginPage.navigation).not.toBeVisible();
      });
    });

    test('should NOT show navigation on forgot password page', { tag: ['@regression'] }, async ({ loginPage, page }) => {
      await page.goto(routes.forgotPassword);
      await expect(loginPage.navigation).not.toBeVisible();
    });
  });

  test.describe('Page Title', () => {
    test('should display "Login" title on login page', { tag: ['@regression'] }, async ({ loginPage }) => {
      await expect(loginPage.pageTitle).toHaveText('Login');
    });

    test('should display "Admin Login" title on admin page', { tag: ['@regression'] }, async ({ loginPage, page }) => {
      await page.goto(routes.admin);
      await expect(loginPage.pageTitle).toHaveText('Admin Login');
    });
  });
});
