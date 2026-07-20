# Locator Strategy

## Priority Order (Highest to Lowest)

| Priority | Locator Type | Use Case |
|----------|--------------|----------|
| 1 | `getByRole` | Accessibility-first, most stable |
| 2 | `getByLabel` | Form elements with labels |
| 3 | `getByText` | Visible text content |
| 4 | `getByPlaceholder` | Input fields without labels |
| 5 | `getByTestId` | Explicit test hooks |
| 6 | CSS selectors | When semantic locators unavailable |
| 7 | XPath | Last resort only (requires justification) |

---

## Best Practices

- **Accessibility-first**: Prefer role-based locators that reflect how users interact with the page
- **Avoid brittle selectors**: No indexes, generated classes, or deeply nested paths
- **Use data-testid sparingly**: Only when semantic locators are insufficient
- **Document XPath usage**: Any XPath requires a comment explaining why other locators won't work

---

## Examples

```typescript
// RECOMMENDED - Accessibility-first (Priority 1)
page.getByRole('button', { name: 'Submit' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('heading', { name: 'Dashboard' });
page.getByRole('link', { name: 'Products' });

// RECOMMENDED - Form labels (Priority 2)
page.getByLabel('Password');
page.getByLabel('Remember me');

// RECOMMENDED - Visible text (Priority 3)
page.getByText('Welcome back');
page.getByText('Add to Basket');

// ACCEPTABLE - Explicit test hooks (Priority 5)
page.getByTestId('product-card');
page.getByTestId('basket-count');

// ACCEPTABLE - CSS when semantic locators unavailable (Priority 6)
page.locator('.product-list > .item');
page.locator('[data-product-id="123"]');

// AVOID - Brittle selectors
page.locator('div:nth-child(3) > span');
page.locator('.btn-primary-v2-active');
page.locator('#root > div > main > section:first-child');

// AVOID - XPath without justification
page.locator('//div[@class="container"]/button');

// ACCEPTABLE - XPath with justification (Priority 7)
// XPath required: Need to select parent element based on child text content
page.locator('//tr[td[contains(text(), "Product Name")]]');
```

---

## Locator Stability Checklist

Before committing locators, verify:

- [ ] Locator uses semantic meaning (role, label, text)
- [ ] Locator survives minor UI changes
- [ ] Locator is not dependent on DOM structure
- [ ] Locator has fallback if using dynamic attributes
