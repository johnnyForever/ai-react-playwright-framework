import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Checkout Page Object Model
 * Following POM rules: No assertions, exposes business actions
 */
export class CheckoutPage extends BasePage {
  readonly checkoutPage: Locator;
  readonly checkoutTitle: Locator;
  readonly checkoutEmpty: Locator;
  readonly checkoutSummary: Locator;
  readonly totalQuantity: Locator;
  readonly totalPrice: Locator;
  readonly continueShoppingButton: Locator;
  readonly finishOrderButton: Locator;
  readonly basketIcon: Locator;
  readonly basketCount: Locator;

  constructor(page: Page) {
    super(page);

    this.checkoutPage = page.getByTestId('checkout-page');
    this.checkoutTitle = page.getByTestId('checkout-title');
    this.checkoutEmpty = page.getByTestId('checkout-empty');
    this.checkoutSummary = page.getByTestId('checkout-summary');
    this.totalQuantity = page.getByTestId('checkout-total-quantity');
    this.totalPrice = page.getByTestId('checkout-total-price');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
    this.finishOrderButton = page.getByTestId('finish-order');
    this.basketIcon = page.getByTestId('basket-icon');
    this.basketCount = page.getByTestId('basket-count');
  }

  /**
   * Navigate to checkout page
   */
  async navigate(): Promise<void> {
    await this.goto('/checkout');
  }

  /**
   * Click finish order button to complete the order
   */
  async finishOrder(): Promise<void> {
    await this.finishOrderButton.click();
  }

  /**
   * Get checkout title text
   */
  async getTitle(): Promise<string> {
    return (await this.checkoutTitle.textContent()) || '';
  }

  /**
   * Check if checkout is empty
   */
  async isEmpty(): Promise<boolean> {
    return await this.checkoutEmpty.isVisible();
  }

  /**
   * Get total quantity from summary (waits for summary to be visible)
   */
  async getTotalQuantity(): Promise<number> {
    await this.totalQuantity.waitFor({ state: 'visible', timeout: 5000 });
    const text = await this.totalQuantity.textContent();
    return text ? parseInt(text, 10) : 0;
  }

  /**
   * Get total price from summary
   */
  async getTotalPrice(): Promise<string> {
    return (await this.totalPrice.textContent()) || '';
  }

  /**
   * Get checkout item by product ID
   */
  getCheckoutItem(productId: string): Locator {
    return this.page.getByTestId(`checkout-item-${productId}`);
  }

  /**
   * Get checkout item name by product ID
   */
  async getItemName(productId: string): Promise<string> {
    return (await this.page.getByTestId(`checkout-item-name-${productId}`).textContent()) || '';
  }

  /**
   * Get checkout item price by product ID
   */
  async getItemPrice(productId: string): Promise<string> {
    return (await this.page.getByTestId(`checkout-item-price-${productId}`).textContent()) || '';
  }

  /**
   * Remove item from checkout by product ID
   */
  async removeItem(productId: string): Promise<void> {
    await this.page.getByTestId(`checkout-remove-${productId}`).click();
  }

  /**
   * Get number of items in checkout (waits for items to render)
   */
  async getItemCount(): Promise<number> {
    // Wait for checkout items to appear in the DOM
    const itemLocator = this.page.locator('article[data-testid^="checkout-item-"]');
    await itemLocator.first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => null);
    return await itemLocator.count();
  }

  /**
   * Click continue shopping button
   */
  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Get basket count from icon badge
   */
  async getBasketCount(): Promise<number> {
    const isVisible = await this.basketCount.isVisible();
    if (!isVisible) return 0;
    const text = await this.basketCount.textContent();
    return text ? parseInt(text, 10) : 0;
  }
}
