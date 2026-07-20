# AI Usage Guidelines

## Code Generation Standards

AI-generated code must:

| Requirement | Description |
|-------------|-------------|
| Follow standards | Match project coding standards and architecture |
| Reuse patterns | Prefer existing patterns over new implementations |
| Document assumptions | Include comments for non-obvious decisions |
| Be maintainable | Optimize for clarity over cleverness |

---

## AI Tooling

This project uses MCP (Model Context Protocol) servers to provide AI with:

- Playwright APIs and best practices
- Repository structure and file system access
- Git history and diffs (optional)

---

## Human-AI Collaboration Model

| Responsibility | Owner |
|---------------|-------|
| Architectural decisions | Human |
| Code implementation | AI-assisted |
| Pattern selection | Human with AI suggestions |
| Code review | Human (required before commit) |
| Complex logic validation | Human |

---

## Prompting Best Practices

When working with AI assistants:

1. **Provide context** — Reference relevant files and existing patterns
2. **Be specific** — Describe expected inputs, outputs, and edge cases
3. **Request incremental changes** — Smaller changes are easier to review
4. **Specify test requirements** — Include testing expectations upfront

---

## Quality Checklist

Before accepting AI-generated code:

**Architecture & Patterns**
- [ ] Follows Page Object Model for E2E tests
- [ ] Uses correct locator strategy (see [locators.instructions.md](locators.instructions.md))
- [ ] Matches existing code style and patterns

**Code Quality**
- [ ] Proper TypeScript types (no `any`)
- [ ] Includes error handling where appropriate
- [ ] No hardcoded credentials or test data
- [ ] Clear, descriptive naming

**Testing**
- [ ] Tests follow journey-based approach with `test.step()`
- [ ] Assertions include context messages
- [ ] Tests tagged appropriately (`@smoke`, `@regression`)

---

## Anti-Patterns to Reject

| Anti-Pattern | Why It's Wrong |
|--------------|----------------|
| Using `any` type | Defeats TypeScript's purpose; use `unknown` or proper types |
| Over-granular tests | One assertion per test wastes execution time and obscures failures |
| Hardcoded credentials | Security risk; use environment variables |
| New patterns without discussion | Breaks consistency; prefer existing patterns |
| Skipping error handling | Makes debugging difficult |
| Brittle locators | Tests break on minor UI changes |
