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
 * Most tests use storageState (pre-authenticated via auth.setup.ts)
 * Tests that need unauthenticated state use: test.use({ storageState: { cookies: [], origins: [] } })
 * Admin tests still use manual login (different credentials than storageState)
 */

test.describe('Dashboard - Protected Route (Unauthenticated)', () => {
  // These tests need to start logged OUT
  test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'should redirect unauthenticated user to login page',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Navigate to dashboard without login', async () => {
        await dashboardPage.navigate();
      });

      await test.step('Verify redirect to login', async () => {
        await expect(dashboardPage.page).toHaveURL(/\/login/, { timeout: 10000 });
      });
    },
  );

  test(
    'should redirect to login if accessing detail page while not authenticated',
    { tag: ['@regression'] },
    async ({ page }) => {
      await page.goto('/dashboard/product/1');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    },
  );
});

test.describe('Dashboard - Authenticated User', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    // Just navigate - already authenticated via storageState
    await dashboardPage.navigate();
  });

  test(
    'should display dashboard after successful login',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Verify dashboard is displayed', async () => {
        await expect(dashboardPage.page).toHaveURL(routes.dashboard);
        await expect(dashboardPage.headerTitle).toBeVisible();
        await expect(dashboardPage.headerTitle).toHaveText('React Demo App');
      });
    },
  );

  test(
    'should redirect to login after logout',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Logout and verify redirect', async () => {
        await dashboardPage.logout();
        await expect(dashboardPage.page).toHaveURL(/\/login/);
      });
    },
  );
});

test.describe('Dashboard - Header', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'should display React Demo App title in header',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.headerTitle).toBeVisible();
      await expect(dashboardPage.headerTitle).toHaveText('React Demo App');
    },
  );

  test(
    'should display user email in header',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.userEmail).toBeVisible();
      const userEmail = await dashboardPage.getUserEmail();
      expect(userEmail).toBe(validUser.email);
    },
  );

  test(
    'should NOT display admin badge for regular user',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.adminBadge).not.toBeVisible();
    },
  );

  test('should display logout button', { tag: ['@regression'] }, async ({ dashboardPage }) => {
    await expect(dashboardPage.logoutButton).toBeVisible();
  });
});

test.describe('Dashboard - Admin User', () => {
  // Admin needs different credentials - use manual login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login(validAdmin.email, validAdmin.password);
  });

  test(
    'should display admin badge for admin user',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.adminBadge).toBeVisible();
      await expect(dashboardPage.adminBadge).toHaveText('Admin');
    },
  );

  test(
    'should display admin email in header',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.userEmail).toBeVisible();
      const userEmail = await dashboardPage.getUserEmail();
      expect(userEmail).toBe(validAdmin.email);
    },
  );
});

test.describe('Dashboard - Product List', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'should display 4 products',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await expect(dashboardPage.productGrid).toBeVisible();
      const count = await dashboardPage.getProductCount();
      expect(count).toBe(4);
    },
  );

  test('should display all product names', { tag: ['@regression'] }, async ({ dashboardPage }) => {
    for (const product of testProducts) {
      await expect(dashboardPage.page.getByTestId(`product-link-${product.id}`)).toBeVisible();
    }
  });

  test('should display all product prices', { tag: ['@regression'] }, async ({ dashboardPage }) => {
    for (const product of testProducts) {
      const price = await dashboardPage.getProductPrice(product.id);
      expect(price).toContain(product.price.toString());
    }
  });

  test('should display Products heading', { tag: ['@regression'] }, async ({ dashboardPage }) => {
    await expect(dashboardPage.productsTitle).toBeVisible();
  });
});

test.describe('Dashboard - Sorting', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'should sort products by name A-Z',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Select sort by name A-Z', async () => {
        await dashboardPage.selectSortOption('name-asc');
      });

      await test.step('Verify products are sorted correctly', async () => {
        const names = await dashboardPage.getProductNames();
        expect(names).toEqual(sortedByNameAsc);
      });
    },
  );

  test('should sort products by name Z-A', { tag: ['@regression'] }, async ({ dashboardPage }) => {
    await dashboardPage.selectSortOption('name-desc');
    const names = await dashboardPage.getProductNames();
    expect(names).toEqual(sortedByNameDesc);
  });

  test(
    'should sort products by price low to high',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await dashboardPage.selectSortOption('price-asc');
      const names = await dashboardPage.getProductNames();
      expect(names).toEqual(sortedByPriceAsc);
    },
  );

  test(
    'should sort products by price high to low',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await dashboardPage.selectSortOption('price-desc');
      const names = await dashboardPage.getProductNames();
      expect(names).toEqual(sortedByPriceDesc);
    },
  );
});

test.describe('Dashboard - Product Navigation', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'should navigate to product detail when clicking product name',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Click on product name', async () => {
        await dashboardPage.clickProduct(testProducts[0].name);
      });

      await test.step('Verify navigation to product detail', async () => {
        await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[0].id));
      });
    },
  );

  test(
    'should navigate to product detail using product link',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProductById(testProducts[1].id);
      await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[1].id));
    },
  );

  test(
    'should navigate to product detail when clicking product image',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProductImage(testProducts[2].id);
      await expect(productDetailPage.page).toHaveURL(routes.productDetail(testProducts[2].id));
    },
  );
});

test.describe('Product Detail Page', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'should display product name',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProduct(testProducts[0].name);
      await expect(productDetailPage.productName).toBeVisible();
      const name = await productDetailPage.getProductName();
      expect(name).toBe(testProducts[0].name);
    },
  );

  test(
    'should display product price',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProduct(testProducts[0].name);
      await expect(productDetailPage.productPrice).toBeVisible();
      const price = await productDetailPage.getProductPrice();
      expect(price).toContain(testProducts[0].price.toString());
    },
  );

  test(
    'should display product image',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProduct(testProducts[0].name);
      await expect(productDetailPage.productImage).toBeVisible();
    },
  );

  test(
    'should display product description',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProduct(testProducts[0].name);
      await expect(productDetailPage.productDescription).toBeVisible();
    },
  );

  test(
    'should navigate back to product list when clicking back button',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate to product detail', async () => {
        await dashboardPage.clickProduct(testProducts[0].name);
      });

      await test.step('Click back button', async () => {
        await productDetailPage.clickBackToProducts();
      });

      await test.step('Verify return to dashboard', async () => {
        await expect(dashboardPage.page).toHaveURL(routes.dashboard);
        await expect(dashboardPage.productGrid).toBeVisible();
      });
    },
  );
});
