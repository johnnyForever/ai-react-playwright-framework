import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Login Page Object Model
 * Following POM rules: No assertions, exposes business actions
 */
export class LoginPage extends BasePage {
  // Locators - using data-testid first, then accessibility approach
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly submitButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loginNavLink: Locator;
  readonly adminNavLink: Locator;
  readonly navigation: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Form elements - using data-testid
    this.loginForm = page.getByTestId('login-form');
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.rememberMeCheckbox = page.getByTestId('remember-me-checkbox');
    this.submitButton = page.getByTestId('login-submit');
    this.forgotPasswordLink = page.getByTestId('forgot-password-link');

    // Navigation elements - using data-testid
    this.navigation = page.getByTestId('navigation');
    this.loginNavLink = page.getByTestId('nav-login');
    this.adminNavLink = page.getByTestId('nav-admin');

    // Error messages - using data-testid
    this.errorMessage = page.getByTestId('login-error');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');

    // Page elements - using data-testid
    this.pageTitle = page.getByTestId('login-title');
  }

  /**
   * Navigate to login page
   */
  async navigate(): Promise<void> {
    await this.goto('/login');
  }

  /**
   * Fill email field
   */
  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Fill password field
   */
  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe(checked: boolean): Promise<void> {
    if (checked) {
      await this.rememberMeCheckbox.check({ force: true });
    } else {
      await this.rememberMeCheckbox.uncheck({ force: true });
    }
  }

  /**
   * Submit login form
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Perform complete login action
   */
  async login(email: string, password: string, rememberMe = false): Promise<void> {
    await this.fillEmail(email);
    await this.fillPassword(password);
    if (rememberMe) {
      await this.toggleRememberMe(true);
    }
    await this.submit();
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  /**
   * Click admin link in navigation
   */
  async clickAdminNav(): Promise<void> {
    await this.adminNavLink.click();
  }

  /**
   * Click login link in navigation
   */
  async clickLoginNav(): Promise<void> {
    await this.loginNavLink.click();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if navigation is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    return await this.navigation.isVisible();
  }

  /**
   * Get page title text
   */
  async getPageTitle(): Promise<string> {
    return await this.pageTitle.textContent() || '';
  }
}
