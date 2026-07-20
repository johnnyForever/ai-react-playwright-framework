# Page Object Model

## Core Principles

- **One page = one class** — Each page or significant component has its own POM
- **No assertions in POMs** — Page objects expose actions and state, tests handle assertions
- **Business actions over selectors** — Methods should represent user intentions, not implementation details
- **Extend BasePage** — All page objects inherit common functionality

---

## POM Responsibilities

Page Objects should:
- Encapsulate page structure and locators
- Provide high-level business methods (`login()`, `addToBasket()`)
- Handle waits and element state internally
- Return data for test assertions when needed

Page Objects should NOT:
- Contain assertions or test logic
- Know about other pages (use test orchestration instead)
- Hardcode test data

---

## Test Responsibilities

Tests should:
- Arrange test data using fixtures or factories
- Orchestrate page actions to complete user journeys
- Assert outcomes with meaningful messages
- Group related assertions into cohesive test cases

---

## Journey-Based Testing

**Prefer comprehensive user journey tests over many small isolated tests.**

Tests should validate complete user flows with multiple assertions when they form a logical journey:

```typescript
// GOOD: Complete user journey with multiple assertions
test('user can add product to basket and proceed to checkout', async ({ 
  dashboardPage, checkoutPage 
}) => {
  await test.step('Add product to basket', async () => {
    await dashboardPage.addToBasket('product-1');
    await expect(dashboardPage.basketCount).toHaveText('1');
    expect(await dashboardPage.getBasketButtonText('product-1')).toBe('Remove from Basket');
  });

  await test.step('Navigate to checkout and verify basket contents', async () => {
    await dashboardPage.goToCheckout();
    await expect(checkoutPage.page).toHaveURL(/\/checkout/);
    await expect(checkoutPage.basketItem).toBeVisible();
    await expect(checkoutPage.totalPrice).toContainText('$');
  });
});

// AVOID: Over-granular tests that should be combined
test('should display basket icon', async ({ dashboardPage }) => {
  await expect(dashboardPage.basketIcon).toBeVisible();
});

test('should not show count when empty', async ({ dashboardPage }) => {
  await expect(dashboardPage.basketCount).not.toBeVisible();
});
```

---

## When to Separate Tests

Create separate tests when:
- Testing **different user paths** (happy path vs error scenarios)
- Testing **independent features** that don't share setup
- A failure in one area shouldn't mask failures in another
- Tests require **different authentication states**

---

## Example Page Object

```typescript
// tests/pages/LoginPage.ts
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly usernameInput = this.page.getByRole('textbox', { name: 'Email' });
  readonly passwordInput = this.page.getByRole('textbox', { name: 'Password' });
  readonly submitButton = this.page.getByRole('button', { name: 'Sign In' });
  readonly errorMessage = this.page.getByRole('alert');

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorText(): Promise<string> {
    return await this.errorMessage.textContent() ?? '';
  }
}
```

---

## Example Test

```typescript
test('login flow validates credentials and displays appropriate feedback', async ({ 
  loginPage, dashboardPage 
}) => {
  await loginPage.navigate();

  await test.step('Successful login redirects to dashboard', async () => {
    await loginPage.login(validUser.email, validUser.password);
    await expect(dashboardPage.page).toHaveURL(/\/dashboard/);
    await expect(dashboardPage.headerTitle).toBeVisible();
    await expect(dashboardPage.userEmail).toContainText(validUser.email);
  });
});

test('login form shows validation errors for invalid input', async ({ loginPage }) => {
  await loginPage.navigate();

  await test.step('Invalid credentials show error message', async () => {
    await loginPage.login('wrong@email.com', 'wrongpassword');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid email or password');
  });

  await test.step('Empty fields show validation errors', async () => {
    await loginPage.navigate(); // Reset form
    await loginPage.submit();
    await expect(loginPage.page.getByText('Email is required')).toBeVisible();
  });
});
```
