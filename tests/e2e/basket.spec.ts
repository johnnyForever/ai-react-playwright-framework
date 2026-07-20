import { expect, test } from '@tests/fixtures/auth.fixture';
import { routes, testProducts } from '@tests/fixtures/testData';

/**
 * Shopping Basket and Checkout Tests
 *
 * Uses storageState for authentication (pre-authenticated via auth.setup.ts)
 * Tests follow journey-based approach: related assertions grouped into meaningful user flows
 */

test.describe('Shopping Basket', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'basket icon displays correctly and navigates to checkout',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, checkoutPage }) => {
      await test.step('Verify basket icon is visible in header', async () => {
        await expect(dashboardPage.basketIcon).toBeVisible();
      });

      await test.step('Verify empty basket shows no count badge', async () => {
        await expect(dashboardPage.basketCount).not.toBeVisible();
      });

      await test.step('Click basket icon and verify navigation to checkout', async () => {
        await dashboardPage.goToCheckout();
        await expect(checkoutPage.page).toHaveURL(/\/checkout/);
        await expect(checkoutPage.checkoutTitle).toBeVisible();
      });
    },
  );

  test(
    'user can add and remove products from basket on dashboard',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Add first product and verify basket updates', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        
        const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
        expect(buttonText).toBe('Remove from Basket');
        expect(await dashboardPage.getBasketCount()).toBe(1);
      });

      await test.step('Add second product and verify count increases', async () => {
        await dashboardPage.addToBasket(testProducts[1].id);
        expect(await dashboardPage.getBasketCount()).toBe(2);
      });

      await test.step('Remove first product and verify basket updates', async () => {
        await dashboardPage.removeFromBasket(testProducts[0].id);
        
        const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
        expect(buttonText).toBe('Add to Basket');
        expect(await dashboardPage.getBasketCount()).toBe(1);
      });

      await test.step('Remove last product and verify basket is empty', async () => {
        await dashboardPage.removeFromBasket(testProducts[1].id);
        await expect(dashboardPage.basketCount).not.toBeVisible();
      });
    },
  );

  test(
    'basket button prevents duplicate product additions',
    { tag: ['@regression'] },
    async ({ dashboardPage }) => {
      await test.step('Add product to basket', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
      });

      await test.step('Verify button shows Remove (not Add) preventing duplicates', async () => {
        const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
        expect(buttonText).toBe('Remove from Basket');
        expect(await dashboardPage.getBasketCount()).toBe(1);
      });
    },
  );

  test(
    'user can manage basket from product detail page',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate to product detail page', async () => {
        await dashboardPage.clickProductById(testProducts[0].id);
      });

      await test.step('Add product to basket from detail page', async () => {
        await productDetailPage.clickBasketButton();
        expect(await productDetailPage.getBasketButtonText()).toBe('Remove from Basket');
      });

      await test.step('Remove product from basket on detail page', async () => {
        await productDetailPage.clickBasketButton();
        expect(await productDetailPage.getBasketButtonText()).toBe('Add to Basket');
      });
    },
  );

  test(
    'basket state syncs between dashboard and product detail page',
    { tag: ['@regression'] },
    async ({ dashboardPage, productDetailPage }) => {
      await test.step('Add product from dashboard', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        expect(await dashboardPage.getBasketCount()).toBe(1);
      });

      await test.step('Navigate to product detail and verify state is synced', async () => {
        await dashboardPage.clickProductById(testProducts[0].id);
        expect(await productDetailPage.getBasketButtonText()).toBe('Remove from Basket');
      });
    },
  );
});

test.describe('Checkout Page', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test(
    'empty checkout displays appropriate message and navigation',
    { tag: ['@regression'] },
    async ({ dashboardPage, checkoutPage }) => {
      await test.step('Navigate to checkout with empty basket', async () => {
        await dashboardPage.goToCheckout();
      });

      await test.step('Verify empty basket message is displayed', async () => {
        await expect(checkoutPage.checkoutEmpty).toBeVisible();
        await expect(checkoutPage.checkoutPage).toContainText('Your basket is empty');
      });

      await test.step('Verify continue shopping button is visible', async () => {
        await expect(checkoutPage.continueShoppingButton).toBeVisible();
      });

      await test.step('Click continue shopping and verify navigation to dashboard', async () => {
        await checkoutPage.continueShopping();
        await expect(dashboardPage.page).toHaveURL(routes.dashboard);
      });
    },
  );

  test(
    'checkout displays items and correct totals',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, checkoutPage }) => {
      await test.step('Add products to basket', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        await dashboardPage.addToBasket(testProducts[1].id);
      });

      await test.step('Navigate to checkout', async () => {
        await dashboardPage.goToCheckout();
      });

      await test.step('Verify checkout title and items', async () => {
        expect(await checkoutPage.getTitle()).toBe('Checkout');
        expect(await checkoutPage.getItemCount()).toBe(2);
      });

      await test.step('Verify product details in checkout', async () => {
        await expect(checkoutPage.getCheckoutItem(testProducts[0].id)).toBeVisible();
        const name = await checkoutPage.getItemName(testProducts[0].id);
        expect(name).toContain(testProducts[0].name);
      });

      await test.step('Verify totals are calculated correctly', async () => {
        expect(await checkoutPage.getTotalQuantity()).toBe(2);
        expect(await checkoutPage.getTotalPrice()).toContain('1,149.98');
      });

      await test.step('Verify basket icon shows count on checkout page', async () => {
        await expect(checkoutPage.basketIcon).toBeVisible();
        expect(await checkoutPage.getBasketCount()).toBe(2);
      });
    },
  );

  test(
    'user can remove items from checkout and totals update correctly',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, checkoutPage }) => {
      await test.step('Add products and navigate to checkout', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        await dashboardPage.addToBasket(testProducts[1].id);
        await dashboardPage.goToCheckout();
      });

      await test.step('Remove first item and verify updates', async () => {
        await checkoutPage.removeItem(testProducts[0].id);
        expect(await checkoutPage.getItemCount()).toBe(1);
        expect(await checkoutPage.getBasketCount()).toBe(1);
        expect(await checkoutPage.getTotalQuantity()).toBe(1);
      });

      await test.step('Remove last item and verify empty state', async () => {
        await checkoutPage.removeItem(testProducts[1].id);
        await expect(checkoutPage.checkoutEmpty).toBeVisible();
      });
    },
  );

  test(
    'checkout redirects to login when not authenticated',
    { tag: ['@regression'] },
    async ({ page }) => {
      // Need to start logged OUT for this test
      await page.context().clearCookies();
      await page.goto('/checkout');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    },
  );

  test(
    'complete checkout flow from order to confirmation',
    { tag: ['@smoke', '@regression'] },
    async ({ dashboardPage, checkoutPage, page }) => {
      await test.step('Add products and go to checkout', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        await dashboardPage.addToBasket(testProducts[1].id);
        await dashboardPage.goToCheckout();
      });

      await test.step('Verify finish order button is visible', async () => {
        await expect(checkoutPage.finishOrderButton).toBeVisible();
      });

      await test.step('Complete order and verify confirmation page', async () => {
        await checkoutPage.finishOrder();
        await expect(page).toHaveURL(/\/order-confirmation/);
        await expect(page.getByTestId('order-confirmation-title')).toContainText('Thank You');
        await expect(page.getByTestId('order-number')).toBeVisible();
      });

      await test.step('Verify return to dashboard button and navigation', async () => {
        await expect(page.getByTestId('return-to-dashboard')).toBeVisible();
        await page.getByTestId('return-to-dashboard').click();
        await expect(page).toHaveURL(/\/dashboard/);
      });

      await test.step('Verify basket is cleared after order', async () => {
        await expect(dashboardPage.basketCount).not.toBeVisible();
      });
    },
  );
});
