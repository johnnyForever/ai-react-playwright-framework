# Page Object Model (Mandatory)

## POM Rules

* One page = one class
* Page Objects contain **no assertions**
* Page Objects expose **business actions**, not selectors
* No test logic inside POMs

---

## Test Responsibilities

Tests should:

* Arrange data
* Call page actions
* Assert outcomes

---

## Example Structure

```typescript
// Page Object - exposes actions only
class LoginPage extends BasePage {
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}

// Test - handles assertions
test('successful login redirects to dashboard', async ({ loginPage }) => {
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```
