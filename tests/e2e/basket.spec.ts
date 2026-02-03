import { test, expect } from '@tests/fixtures/auth.fixture';
import { routes, testProducts } from '@tests/fixtures/testData';

/**
 * Shopping Basket and Checkout Tests
 * 
 * Uses storageState for authentication (pre-authenticated via auth.setup.ts)
 * Tests that need unauthenticated state use: test.use({ storageState: { cookies: [], origins: [] } })
 */

test.describe('Shopping Basket', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    // Just navigate - already authenticated via storageState
    await dashboardPage.navigate();
  });

  test.describe('Basket Icon', () => {
    test('should display basket icon in header', { tag: ['@regression'] }, async ({ dashboardPage }) => {
      await expect(dashboardPage.basketIcon).toBeVisible();
    });

    test('should not show count badge when basket is empty', { tag: ['@regression'] }, async ({ dashboardPage }) => {
      await expect(dashboardPage.basketCount).not.toBeVisible();
    });

    test('should navigate to checkout when clicking basket icon', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      await expect(checkoutPage.page).toHaveURL(/\/checkout/);
      await expect(checkoutPage.checkoutTitle).toBeVisible();
    });
  });

  test.describe('Add to Basket - Dashboard', () => {
    test('should add product to basket from dashboard', { tag: ['@smoke', '@regression'] }, async ({ dashboardPage }) => {
      await test.step('Add product to basket', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
      });
      
      await test.step('Verify button changed to Remove', async () => {
        const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
        expect(buttonText).toBe('Remove from Basket');
      });
      
      await test.step('Verify basket count is 1', async () => {
        const count = await dashboardPage.getBasketCount();
        expect(count).toBe(1);
      });
    });

    test('should show correct count when adding multiple products', { tag: ['@regression'] }, async ({ dashboardPage }) => {
      await test.step('Add two products', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        await dashboardPage.addToBasket(testProducts[1].id);
      });
      
      await test.step('Verify basket count is 2', async () => {
        const count = await dashboardPage.getBasketCount();
        expect(count).toBe(2);
      });
    });

    test('should remove product from basket when clicking Remove from Basket', { tag: ['@smoke', '@regression'] }, async ({ dashboardPage }) => {
      await test.step('Add product to basket', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
        expect(await dashboardPage.getBasketCount()).toBe(1);
      });
      
      await test.step('Remove product from basket', async () => {
        await dashboardPage.removeFromBasket(testProducts[0].id);
      });
      
      await test.step('Verify button changed back to Add', async () => {
        const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
        expect(buttonText).toBe('Add to Basket');
      });
      
      await test.step('Verify basket is empty', async () => {
        await expect(dashboardPage.basketCount).not.toBeVisible();
      });
    });

    test('should prevent adding same product twice', { tag: ['@regression'] }, async ({ dashboardPage }) => {
      await dashboardPage.addToBasket(testProducts[0].id);
      
      const buttonText = await dashboardPage.getBasketButtonText(testProducts[0].id);
      expect(buttonText).toBe('Remove from Basket');
      
      const count = await dashboardPage.getBasketCount();
      expect(count).toBe(1);
    });
  });

  test.describe('Add to Basket - Product Detail', () => {
    test('should add product to basket from product detail page', { tag: ['@regression'] }, async ({ dashboardPage, productDetailPage }) => {
      await test.step('Navigate to product detail', async () => {
        await dashboardPage.clickProductById(testProducts[0].id);
      });
      
      await test.step('Add to basket from detail page', async () => {
        await productDetailPage.clickBasketButton();
      });
      
      await test.step('Verify button shows Remove', async () => {
        const buttonText = await productDetailPage.getBasketButtonText();
        expect(buttonText).toBe('Remove from Basket');
      });
    });

    test('should remove product from basket on product detail page', { tag: ['@regression'] }, async ({ dashboardPage, productDetailPage }) => {
      await dashboardPage.clickProductById(testProducts[0].id);
      
      await productDetailPage.clickBasketButton();
      expect(await productDetailPage.getBasketButtonText()).toBe('Remove from Basket');
      
      await productDetailPage.clickBasketButton();
      expect(await productDetailPage.getBasketButtonText()).toBe('Add to Basket');
    });

    test('should sync basket state between dashboard and product detail', { tag: ['@regression'] }, async ({ dashboardPage, productDetailPage }) => {
      await test.step('Add from dashboard', async () => {
        await dashboardPage.addToBasket(testProducts[0].id);
      });
      
      await test.step('Navigate to product detail', async () => {
        await dashboardPage.clickProductById(testProducts[0].id);
      });
      
      await test.step('Verify state is synced', async () => {
        const buttonText = await productDetailPage.getBasketButtonText();
        expect(buttonText).toBe('Remove from Basket');
      });
    });
  });
});

test.describe('Checkout Page', () => {
  // Using storageState - already logged in as standard user

  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.navigate();
  });

  test.describe('Empty Checkout', () => {
    test('should show empty basket message when no items', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await expect(checkoutPage.checkoutEmpty).toBeVisible();
      await expect(checkoutPage.checkoutPage).toContainText('Your basket is empty');
    });

    test('should show continue shopping button when empty', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await expect(checkoutPage.continueShoppingButton).toBeVisible();
    });

    test('should navigate back to dashboard when clicking continue shopping', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      await checkoutPage.continueShopping();
      
      await expect(dashboardPage.page).toHaveURL(routes.dashboard);
    });
  });

  test.describe('Checkout with Items', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.addToBasket(testProducts[0].id);
      await dashboardPage.addToBasket(testProducts[1].id);
    });

    test('should display checkout title', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      const title = await checkoutPage.getTitle();
      expect(title).toBe('Checkout');
    });

    test('should display items in checkout', { tag: ['@smoke', '@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await test.step('Navigate to checkout', async () => {
        await dashboardPage.goToCheckout();
      });
      
      await test.step('Verify items count', async () => {
        const itemCount = await checkoutPage.getItemCount();
        expect(itemCount).toBe(2);
      });
    });

    test('should display product details in checkout', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await expect(checkoutPage.getCheckoutItem(testProducts[0].id)).toBeVisible();
      const name = await checkoutPage.getItemName(testProducts[0].id);
      expect(name).toContain(testProducts[0].name);
    });

    test('should display correct total quantity', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      const quantity = await checkoutPage.getTotalQuantity();
      expect(quantity).toBe(2);
    });

    test('should display correct total price', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      const totalPrice = await checkoutPage.getTotalPrice();
      expect(totalPrice).toContain('1,149.98');
    });

    test('should display basket icon on checkout page', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await expect(checkoutPage.basketIcon).toBeVisible();
      const count = await checkoutPage.getBasketCount();
      expect(count).toBe(2);
    });
  });

  test.describe('Remove from Checkout', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.addToBasket(testProducts[0].id);
      await dashboardPage.addToBasket(testProducts[1].id);
    });

    test('should remove item from checkout', { tag: ['@smoke', '@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await test.step('Navigate to checkout', async () => {
        await dashboardPage.goToCheckout();
      });
      
      await test.step('Remove first item', async () => {
        await checkoutPage.removeItem(testProducts[0].id);
      });
      
      await test.step('Verify item count is 1', async () => {
        const itemCount = await checkoutPage.getItemCount();
        expect(itemCount).toBe(1);
      });
    });

    test('should update basket count when removing item', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await checkoutPage.removeItem(testProducts[0].id);
      
      const count = await checkoutPage.getBasketCount();
      expect(count).toBe(1);
    });

    test('should update total when removing item', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await checkoutPage.removeItem(testProducts[0].id);
      
      const totalQuantity = await checkoutPage.getTotalQuantity();
      expect(totalQuantity).toBe(1);
    });

    test('should show empty message when all items removed', { tag: ['@regression'] }, async ({ dashboardPage, checkoutPage }) => {
      await dashboardPage.goToCheckout();
      
      await checkoutPage.removeItem(testProducts[0].id);
      await checkoutPage.removeItem(testProducts[1].id);
      
      await expect(checkoutPage.checkoutEmpty).toBeVisible();
    });
  });

  test.describe('Checkout - Protected Route', () => {
    // Need to start logged OUT for this test
    test.use({ storageState: { cookies: [], origins: [] } });

    test('should redirect to login if accessing checkout while not authenticated', { tag: ['@regression'] }, async ({ page }) => {
      await page.goto('/checkout');
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    });
  });

  test.describe('Order Confirmation', () => {
    test.beforeEach(async ({ dashboardPage }) => {
      await dashboardPage.addToBasket(testProducts[0].id);
      await dashboardPage.addToBasket(testProducts[1].id);
      await dashboardPage.goToCheckout();
    });

    test('should display finish order button on checkout', { tag: ['@regression'] }, async ({ checkoutPage }) => {
      await expect(checkoutPage.finishOrderButton).toBeVisible();
    });

    test('should navigate to order confirmation when clicking finish order', { tag: ['@smoke', '@regression'] }, async ({ checkoutPage, page }) => {
      await test.step('Click finish order button', async () => {
        await checkoutPage.finishOrder();
      });
      
      await test.step('Verify navigation to confirmation page', async () => {
        await expect(page).toHaveURL(/\/order-confirmation/);
      });
    });

    test('should display thank you message on order confirmation', { tag: ['@smoke', '@regression'] }, async ({ checkoutPage, page }) => {
      await test.step('Complete order', async () => {
        await checkoutPage.finishOrder();
      });
      
      await test.step('Verify thank you message', async () => {
        await expect(page.getByTestId('order-confirmation-title')).toContainText('Thank You');
      });
    });

    test('should display return to dashboard button', { tag: ['@regression'] }, async ({ checkoutPage, page }) => {
      await checkoutPage.finishOrder();
      await expect(page.getByTestId('return-to-dashboard')).toBeVisible();
    });

    test('should navigate back to dashboard when clicking return button', { tag: ['@regression'] }, async ({ checkoutPage, page }) => {
      await test.step('Complete order', async () => {
        await checkoutPage.finishOrder();
      });
      
      await test.step('Click return to dashboard', async () => {
        await page.getByTestId('return-to-dashboard').click();
      });
      
      await test.step('Verify navigation to dashboard', async () => {
        await expect(page).toHaveURL(/\/dashboard/);
      });
    });

    test('should clear basket after order confirmation', { tag: ['@smoke', '@regression'] }, async ({ checkoutPage, dashboardPage, page }) => {
      await test.step('Complete order', async () => {
        await checkoutPage.finishOrder();
      });
      
      await test.step('Return to dashboard', async () => {
        await page.getByTestId('return-to-dashboard').click();
      });
      
      await test.step('Verify basket is cleared', async () => {
        await expect(dashboardPage.basketCount).not.toBeVisible();
      });
    });

    test('should display order number on confirmation', { tag: ['@regression'] }, async ({ checkoutPage, page }) => {
      await checkoutPage.finishOrder();
      await expect(page.getByTestId('order-number')).toBeVisible();
    });
  });
});
