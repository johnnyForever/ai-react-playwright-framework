# Locator Strategy

## Locator Priority (Highest → Lowest)

1. `getByRole` - Accessibility-first, most stable
2. `data-testid` - Explicit test hooks
3. `getByLabel` - Form elements
4. `getByPlaceholder` - Input fields
5. CSS selectors - When necessary
6. XPath - **Last resort only**

---

## Rules

* XPath requires a justification comment explaining why other locators won't work
* Avoid brittle selectors (indexes, dynamic classes)
* Prefer accessibility-first locators

---

## Examples

```typescript
// ✅ Good - accessibility-first
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });

// ✅ Good - explicit test hook
page.getByTestId('product-card');

// ✅ Good - form label
page.getByLabel('Password');

// ⚠️ Acceptable - when role/label not available
page.locator('.product-list > .item');

// ❌ Avoid - brittle selectors
page.locator('div:nth-child(3) > span');
page.locator('.btn-primary-v2-active');

// ❌ Avoid - XPath without justification
page.locator('//div[@class="container"]/button');
```
