import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Product Detail Page Object Model
 * Locator priority: getByRole → getByLabel → getByText → getByTestId → CSS
 * Following POM rules: No assertions, exposes business actions
 */
export class ProductDetailPage extends BasePage {
  readonly productDetailPage: Locator;
  readonly productDetail: Locator;
  readonly productName: Locator;
  readonly productDescription: Locator;
  readonly productPrice: Locator;
  readonly productImage: Locator;
  readonly backButton: Locator;
  readonly basketButton: Locator;

  constructor(page: Page) {
    super(page);

    // Using getByRole where possible (Priority 1)
    this.backButton = page.getByRole('link', { name: '← Back to Products' });
    // Note: basketButton text is dynamic ('Add to Basket' or 'Remove from Basket')
    this.basketButton = page.getByTestId('product-detail-basket-btn');

    // Product name is an h1 heading - using getByRole
    // Note: Can't use getByRole('heading') without name as product name is dynamic
    this.productName = page.getByTestId('product-detail-name');

    // Elements without semantic roles - using data-testid (Priority 5)
    this.productDetailPage = page.getByTestId('product-detail-page');
    this.productDetail = page.getByTestId('product-detail');
    this.productDescription = page.getByTestId('product-detail-description');
    this.productPrice = page.getByTestId('product-detail-price');
    this.productImage = page.getByTestId('product-detail-image');
  }

  /**
   * Navigate to product detail page by ID
   */
  async navigate(productId: string): Promise<void> {
    await this.goto(`/dashboard/product/${productId}`);
  }

  /**
   * Get product name text
   */
  async getProductName(): Promise<string> {
    return (await this.productName.textContent()) || '';
  }

  /**
   * Get product description text
   */
  async getProductDescription(): Promise<string> {
    return (await this.productDescription.textContent()) || '';
  }

  /**
   * Get product price text
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.textContent()) || '';
  }

  /**
   * Get product image src attribute
   */
  async getProductImageSrc(): Promise<string> {
    return (await this.productImage.getAttribute('src')) || '';
  }

  /**
   * Click back button to return to product list
   */
  async clickBackToProducts(): Promise<void> {
    await this.backButton.click();
  }

  /**
   * Click add/remove from basket button
   */
  async clickBasketButton(): Promise<void> {
    await this.basketButton.click();
  }

  /**
   * Get basket button text
   */
  async getBasketButtonText(): Promise<string> {
    return (await this.basketButton.textContent()) || '';
  }
}
