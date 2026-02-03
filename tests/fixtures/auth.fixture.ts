import { test as base } from '@playwright/test';
import { LoginPage, DashboardPage, ProductDetailPage, CheckoutPage } from '@tests/pages';
import { TestLogger, createLogger } from '@tests/utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Get or create run ID for this test session
const RUN_ID = process.env.TEST_RUN_ID || uuidv4();

/**
 * Extended test fixture with Page Objects and Logger
 * Provides pre-instantiated page objects and automatic logging for tests
 */
interface AuthFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  productDetailPage: ProductDetailPage;
  checkoutPage: CheckoutPage;
  logger: TestLogger;
}

export const test = base.extend<AuthFixtures>({
  logger: async ({ }, use, testInfo) => {
    // Create logger for this test
    const logger = createLogger(RUN_ID, testInfo);
    logger.testStart();
    
    await use(logger);
    
    // Log test end
    logger.testEnd();
  },
  loginPage: async ({ page, logger }, use) => {
    logger.info('Initializing LoginPage');
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  dashboardPage: async ({ page, logger }, use) => {
    logger.info('Initializing DashboardPage');
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
  productDetailPage: async ({ page, logger }, use) => {
    logger.info('Initializing ProductDetailPage');
    const productDetailPage = new ProductDetailPage(page);
    await use(productDetailPage);
  },
  checkoutPage: async ({ page, logger }, use) => {
    logger.info('Initializing CheckoutPage');
    const checkoutPage = new CheckoutPage(page);
    await use(checkoutPage);
  },
});

export { expect } from '@playwright/test';
