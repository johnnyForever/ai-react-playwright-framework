import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard Page Object Model
 * Following POM rules: No assertions, exposes business actions
 */
export class DashboardPage extends BasePage {
  // Header elements
  readonly header: Locator;
  readonly headerTitle: Locator;
  readonly userEmail: Locator;
  readonly adminBadge: Locator;
  readonly logoutButton: Locator;
  readonly basketIcon: Locator;
  readonly basketCount: Locator;

  // Product list elements
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly sortSelector: Locator;
  readonly productsTitle: Locator;

  constructor(page: Page) {
    super(page);

    // Header - using data-testid
    this.header = page.getByTestId('dashboard-header');
    this.headerTitle = page.getByTestId('dashboard-title');
    this.userEmail = page.getByTestId('user-email');
    this.adminBadge = page.getByTestId('admin-badge');
    this.logoutButton = page.getByTestId('logout-button');
    this.basketIcon = page.getByTestId('basket-icon');
    this.basketCount = page.getByTestId('basket-count');

    // Product list - using data-testid
    this.productGrid = page.getByTestId('product-grid');
    this.productCards = page.locator('[data-testid^="product-card-"]');
    this.sortSelector = page.getByLabel('Sort by:');
    this.productsTitle = page.getByRole('heading', { name: 'Products' });
  }

  /**
   * Navigate to dashboard page
   */
  async navigate(): Promise<void> {
    await this.goto('/dashboard');
  }

  /**
   * Click logout button
   */
  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /**
   * Get user email from header
   */
  async getUserEmail(): Promise<string> {
    return (await this.userEmail.textContent()) || '';
  }

  /**
   * Get number of products displayed
   */
  async getProductCount(): Promise<number> {
    return await this.productCards.count();
  }

  /**
   * Click on product image by ID
   */
  async clickProductImage(id: string): Promise<void> {
    await this.page.getByTestId(`product-image-link-${id}`).click();
  }

  /**
   * Select sort option
   */
  async selectSortOption(option: string): Promise<void> {
    await this.sortSelector.selectOption(option);
  }

  /**
   * Get all product names in current order
   */
  async getProductNames(): Promise<string[]> {
    const names: string[] = [];
    const count = await this.productCards.count();
    for (let i = 0; i < count; i++) {
      const nameLink = this.productCards.nth(i).locator('[data-testid^="product-link-"]');
      const text = await nameLink.textContent();
      if (text) names.push(text);
    }
    return names;
  }

  /**
   * Click on product by name (uses the text link, not image)
   */
  async clickProduct(productName: string): Promise<void> {
    await this.page.getByRole('link', { name: productName }).first().click();
  }

  /**
   * Click on product by ID
   */
  async clickProductById(id: string): Promise<void> {
    await this.page.getByTestId(`product-link-${id}`).click();
  }

  /**
   * Get product price by ID
   */
  async getProductPrice(id: string): Promise<string> {
    return (await this.page.getByTestId(`product-price-${id}`).textContent()) || '';
  }

  /**
   * Click add to basket button for product by ID and wait for state update
   */
  async addToBasket(id: string): Promise<void> {
    const button = this.page.getByTestId(`product-basket-btn-${id}`);
    await button.click();
    // Wait for the button text to change to "Remove from Basket" confirming state update
    await button
      .filter({ hasText: 'Remove from Basket' })
      .waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Click remove from basket button for product by ID and wait for state update
   */
  async removeFromBasket(id: string): Promise<void> {
    const button = this.page.getByTestId(`product-basket-btn-${id}`);
    await button.click();
    // Wait for the button text to change to "Add to Basket" confirming state update
    await button.filter({ hasText: 'Add to Basket' }).waitFor({ state: 'visible', timeout: 5000 });
  }

  /**
   * Get basket button text for product by ID
   */
  async getBasketButtonText(id: string): Promise<string> {
    return (await this.page.getByTestId(`product-basket-btn-${id}`).textContent()) || '';
  }

  /**
   * Click basket icon to go to checkout
   */
  async goToCheckout(): Promise<void> {
    await this.basketIcon.click();
  }

  /**
   * Get basket count from icon badge (waits briefly for badge to appear)
   */
  async getBasketCount(): Promise<number> {
    // Wait a moment for React state to propagate
    await this.basketCount.waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    const isVisible = await this.basketCount.isVisible();
    if (!isVisible) return 0;
    const text = await this.basketCount.textContent();
    return text ? parseInt(text, 10) : 0;
  }
}
