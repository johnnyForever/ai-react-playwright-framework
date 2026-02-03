import { type Page } from '@playwright/test';

/**
 * Base Page Object with common functionality
 * Following POM rules: No assertions, only actions and locators
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL path
   */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current URL path
   */
  getCurrentPath(): string {
    return new URL(this.page.url()).pathname;
  }

  /**
   * Wait for URL to contain specific path
   */
  async waitForPath(path: string): Promise<void> {
    await this.page.waitForURL(`**${path}`);
  }
}
