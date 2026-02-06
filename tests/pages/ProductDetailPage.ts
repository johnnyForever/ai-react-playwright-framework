import type { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Product Detail Page Object Model
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

    this.productDetailPage = page.getByTestId('product-detail-page');
    this.productDetail = page.getByTestId('product-detail');
    this.productName = page.getByTestId('product-detail-name');
    this.productDescription = page.getByTestId('product-detail-description');
    this.productPrice = page.getByTestId('product-detail-price');
    this.productImage = page.getByTestId('product-detail-image');
    this.backButton = page.getByTestId('back-to-products');
    this.basketButton = page.getByTestId('product-detail-basket-btn');
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
