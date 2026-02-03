/**
 * Test data for authentication tests
 * Credentials loaded from environment variables via factory
 */

import { UserFactory, ProductFactory, RouteFactory } from '@tests/utils/testDataFactory';

// Re-export factory functions as static values for backward compatibility
export const validUser = UserFactory.validUser();
export const validAdmin = UserFactory.validAdmin();
export const invalidCredentials = UserFactory.invalidCredentials();
export const invalidEmails = UserFactory.invalidEmails();

export const routes = {
  login: RouteFactory.login(),
  admin: RouteFactory.admin(),
  dashboard: RouteFactory.dashboard(),
  productDetail: RouteFactory.productDetail,
  forgotPassword: RouteFactory.forgotPassword(),
  checkout: RouteFactory.checkout(),
};

/**
 * Test data for product tests
 */
export const testProducts = ProductFactory.testProducts();

export const sortedByNameAsc = ProductFactory.sortedByNameAsc();
export const sortedByNameDesc = ProductFactory.sortedByNameDesc();
export const sortedByPriceAsc = ProductFactory.sortedByPriceAsc();
export const sortedByPriceDesc = ProductFactory.sortedByPriceDesc();

// Re-export factories for advanced usage
export { UserFactory, ProductFactory, RouteFactory, StringFactory, NumberFactory } from '@tests/utils/testDataFactory';
