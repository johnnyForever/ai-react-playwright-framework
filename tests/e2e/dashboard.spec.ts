import { expect, test } from '@tests/fixtures/auth.fixture';
import {
  routes,
  sortedByNameAsc,
  sortedByNameDesc,
  sortedByPriceAsc,
  sortedByPriceDesc,
  testProducts,
  validAdmin,
  validUser,
} from '@tests/fixtures/testData';

/**
 * Dashboard Tests
 *
 * Tests follow journey-based approach: related assertions grouped into meaningful user flows
 * Uses storageState for authentication (pre-authenticated via auth.setup.ts)
 */

test.describe('Dashboard - Access Control', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'unauthenticated users are redirected to login',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, page }) => {
      await test.step('Access dashboard without authentication', async () => {
        await dashboardPage.navigate();
        await expect(dashboardPage.page).toHaveURL(/\/login/, { timeout: 10000 });
      });

      await test.step('Access product detail without authentication', async () => {
        await page.goto('/dashboard/product/1');
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      });
    },
  );
});

test.describe('Dashboard - Authenticated User', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'dashboard displays correctly with user information',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Verify dashboard URL and main elements', async () => {
        await expect(dashboardPage.page).toHaveURL(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
        await expect(dashboardPage.headerTitle).toHaveText('React Demo App');
      });

      await test.step('Verify user email is displayed in header', async () => {
        await expect(dashboardPage.userEmail).toBeVisible();
        expect(await dashboardPage.getUserEmail()).toBe(validUser.email);
      });

      await test.step('Verify standard user does not see admin badge', async () => {
        await expect(dashboardPage.adminBadge).not.toBeVisible();
      });

      await test.step('Verify logout button is available', async () => {
        await expect(dashboardPage.logoutButton).toBeVisible();
      });
    },
  );

  test(
    'logout redirects user to login page',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await dashboardPage.logout();
      await expect(dashboardPage.page).toHaveURL(/\/login/);
    },
  );
});

test.describe('Dashboard - Admin User', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'admin user sees admin badge and correct information',
    { tag: ['@regression'] },
    async ({ loginPage, dashboardPage }) => {
      await test.step('Login as admin', async () => {
        await loginPage.navigate();
        await loginPage.login(validAdmin.email, validAdmin.password);
      });

      await test.step('Verify admin badge is displayed', async () => {
        await expect(dashboardPage.adminBadge).toBeVisible();
        await expect(dashboardPage.adminBadge).toHaveText('Admin');
      });

      await test.step('Verify admin email is displayed', async () => {
        await expect(dashboardPage.userEmail).toBeVisible();
        expect(await dashboardPage.getUserEmail()).toBe(validAdmin.email);
      });
    },
  );
});

test.describe('Dashboard - Product List', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'product grid displays all products with correct information',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Verify Products heading and grid are visible', async () => {
        await expect(dashboardPage.productsTitle).toBeVisible();
        await expect(dashboardPage.productGrid).toBeVisible();
      });

      await test.step('Verify correct number of products displayed', async () => {
        expect(await dashboardPage.getProductCount()).toBe(4);
      });

      await test.step('Verify all product names are visible', async () => {
        for (const product of testProducts) {
          await expect(dashboardPage.page.getByTestId(`product-link-${product.id}`)).toBeVisible();
        }
      });

      await test.step('Verify all product prices are displayed correctly', async () => {
        for (const product of testProducts) {
          const price = await dashboardPage.getProductPrice(product.id);
          expect(price).toContain(product.price.toString());
        }
      });
    },
  );

  test(
    'product sorting works correctly for all options',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Sort by name A-Z', async () => {
        await dashboardPage.selectSortOption('name-asc');
        expect(await dashboardPage.getProductNames()).toEqual(sortedByNameAsc);
      });

      await test.step('Sort by name Z-A', async () => {
        await dashboardPage.selectSortOption('name-desc');
        expect(await dashboardPage.getProductNames()).toEqual(sortedByNameDesc);
      });

      await test.step('Sort by price low to high', async () => {
        await dashboardPage.selectSortOption('price-asc');
        expect(await dashboardPage.getProductNames()).toEqual(sortedByPriceAsc);
      });

      await test.step('Sort by price high to low', async () => {
        await dashboardPage.selectSortOption('price-desc');
        expect(await dashboardPage.getProductNames()).toEqual(sortedByPriceDesc);
      });
    },
  );
});

test.describe('Dashboard - Product Navigation', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'user can navigate to product detail via multiple methods',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate via product name link', async () => {
        await dashboardPage.clickProduct(testProducts[0].name);
        await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[0].id));
        await productDetailPage.clickBackToProducts();
      });

      await test.step('Navigate via product ID link', async () => {
        await dashboardPage.clickProductById(testProducts[1].id);
        await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[1].id));
        await productDetailPage.clickBackToProducts();
      });

      await test.step('Navigate via product image', async () => {
        await dashboardPage.clickProductImage(testProducts[2].id);
        await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[2].id));
      });
    },
  );
});

test.describe('Product Detail Page', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'product detail page displays complete product information',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate to product detail', async () => {
        await dashboardPage.clickProduct(testProducts[0].name);
      });

      await test.step('Verify product name', async () => {
        await expect(productDetailPage.productName).toBeVisible();
        expect(await productDetailPage.getProductName()).toBe(testProducts[0].name);
      });

      await test.step('Verify product price', async () => {
        await expect(productDetailPage.productPrice).toBeVisible();
        expect(await productDetailPage.getProductPrice()).toContain(testProducts[0].price.toString());
      });

      await test.step('Verify product image and description', async () => {
        await expect(productDetailPage.productImage).toBeVisible();
        await expect(productDetailPage.productDescription).toBeVisible();
      });
    },
  );

  test(
    'back button returns user to dashboard',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate to product detail', async () => {
        await dashboardPage.clickProduct(testProducts[0].name);
      });

      await test.step('Click back and verify return to dashboard', async () => {
        await productDetailPage.clickBackToProducts();
        await expect(dashboardPage.page).toHaveURL(routes.dashboard);
        await expect(dashboardPage.productGrid).toBeVisible();
      });
    },
  );
});
