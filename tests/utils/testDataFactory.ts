/**
 * Test Data Factory
 * Generates dynamic test data for automation tests
 * Credentials are loaded from environment variables
 */

import { randomUUID } from 'crypto';

// Helper to generate random strings
function randomString(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

// Helper to generate random number in range
function randomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper to generate random email
function randomEmail(domain: string = 'test.com'): string {
  return `user_${randomString(6)}@${domain}`;
}

/**
 * User Factory - generates user test data
 */
export const UserFactory = {
  /**
   * Get valid user credentials from environment
   */
  validUser: () => ({
    email: process.env.TEST_USER_EMAIL || 'demo@demo.com',
    password: process.env.TEST_USER_PASSWORD || 'password123',
    name: 'Demo User',
  }),

  /**
   * Get admin user credentials from environment
   */
  validAdmin: () => ({
    email: process.env.TEST_ADMIN_EMAIL || 'admin@demo.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
    name: 'Admin User',
  }),

  /**
   * Generate random invalid credentials
   */
  invalidCredentials: () => ({
    email: randomEmail('invalid.com'),
    password: `wrong_${randomString(8)}`,
  }),

  /**
   * Generate a random user for registration tests
   */
  randomUser: () => ({
    email: randomEmail(),
    password: `Pass${randomString(6)}!${randomNumber(10, 99)}`,
    name: `Test User ${randomString(4)}`,
  }),

  /**
   * Generate invalid email formats for validation tests
   */
  invalidEmails: () => [
    'notanemail',
    'missing@domain',
    '@nodomain.com',
    'spaces in@email.com',
    randomString(10),
    `${randomString(5)}@`,
  ],
};

/**
 * Product Factory - generates product test data
 */
export const ProductFactory = {
  /**
   * Get static test products (matching the app's data)
   */
  testProducts: () => [
    { id: '1', name: 'Laptop Pro', price: 999.99 },
    { id: '2', name: 'Wireless Headphones', price: 149.99 },
    { id: '3', name: 'Smart Watch', price: 299.99 },
    { id: '4', name: 'Mechanical Keyboard', price: 89.99 },
  ],

  /**
   * Get expected sort orders
   */
  sortedByNameAsc: () => ['Laptop Pro', 'Mechanical Keyboard', 'Smart Watch', 'Wireless Headphones'],
  sortedByNameDesc: () => ['Wireless Headphones', 'Smart Watch', 'Mechanical Keyboard', 'Laptop Pro'],
  sortedByPriceAsc: () => ['Mechanical Keyboard', 'Wireless Headphones', 'Smart Watch', 'Laptop Pro'],
  sortedByPriceDesc: () => ['Laptop Pro', 'Smart Watch', 'Wireless Headphones', 'Mechanical Keyboard'],

  /**
   * Generate a random product for dynamic tests
   */
  randomProduct: () => ({
    id: randomUUID(),
    name: `Product ${randomString(6)}`,
    price: parseFloat((Math.random() * 1000).toFixed(2)),
    description: `Description for product ${randomString(10)}`,
    imageUrl: `https://picsum.photos/seed/${randomString(8)}/400/300`,
  }),

  /**
   * Generate multiple random products
   */
  randomProducts: (count: number) => 
    Array.from({ length: count }, () => ProductFactory.randomProduct()),

  /**
   * Calculate expected total for products
   */
  calculateTotal: (productIds: string[]): number => {
    const products = ProductFactory.testProducts();
    return products
      .filter(p => productIds.includes(p.id))
      .reduce((sum, p) => sum + p.price, 0);
  },
};

/**
 * Route Factory - generates route paths
 */
export const RouteFactory = {
  login: () => '/login',
  admin: () => '/admin',
  dashboard: () => '/dashboard',
  productDetail: (id: string) => `/dashboard/product/${id}`,
  forgotPassword: () => '/forgot-password',
  checkout: () => '/checkout',
};

/**
 * String Factory - generates various string formats
 */
export const StringFactory = {
  /**
   * Generate a random string of specified length
   */
  random: (length: number = 8) => randomString(length),

  /**
   * Generate a random email
   */
  email: (domain?: string) => randomEmail(domain),

  /**
   * Generate a random password meeting common requirements
   */
  password: (length: number = 12) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
    return Array.from({ length }, () => chars[randomNumber(0, chars.length - 1)]).join('');
  },

  /**
   * Generate a UUID
   */
  uuid: () => randomUUID(),

  /**
   * Generate a random phone number
   */
  phone: () => `+1${randomNumber(200, 999)}${randomNumber(100, 999)}${randomNumber(1000, 9999)}`,
};

/**
 * Number Factory - generates various number formats
 */
export const NumberFactory = {
  /**
   * Generate a random integer in range
   */
  integer: (min: number = 0, max: number = 100) => randomNumber(min, max),

  /**
   * Generate a random price
   */
  price: (min: number = 1, max: number = 1000) => parseFloat((Math.random() * (max - min) + min).toFixed(2)),

  /**
   * Generate a random quantity
   */
  quantity: (min: number = 1, max: number = 10) => randomNumber(min, max),
};
