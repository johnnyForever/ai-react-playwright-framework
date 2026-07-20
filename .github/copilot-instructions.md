# ReactApp + Test Automation Suite – Rules & Standards

## Purpose

This document defines **clear, opinionated, and practical rules** for building a **React application with Playwright test automation**.

**Audience:**

- **AI coding tools** (GitHub Copilot, Amazon Q)
- **Human reviewers** (recruiters, engineers)

> This is the **target architecture**, implemented **incrementally**.

---

## Detailed Instructions

Topic-specific rules are in `.github/instructions/`:

| Topic | File |
|-------|------|
| Project overview & strategy | `overview.instructions.md` |
| Technology stack | `technology-stack.instructions.md` |
| Project architecture | `architecture.instructions.md` |
| Page Object Model | `page-object-model.instructions.md` |
| Locator strategy | `locators.instructions.md` |
| Test data management | `test-data.instructions.md` |
| API testing | `api-testing.instructions.md` |
| Logging & debugging | `logging.instructions.md` |
| Coding standards | `coding-standards.instructions.md` |
| Reports & CI/CD | `reporting-cicd.instructions.md` |
| AI usage rules | `ai-usage.instructions.md` |

---

## Core Principles

### Code Quality

- No `any` in TypeScript—use proper types or `unknown`
- Prefer reuse over duplication
- Optimize for clarity and maintainability

### Testing Philosophy

- **Page Object Model (POM)** is mandatory
- **Journey-based tests**: Group related assertions into meaningful user flows rather than splitting into many tiny tests
- **Test isolation**: No shared state between tests, but multiple assertions within a test are encouraged when they validate a single user journey
- **Accessibility-first locators**: `getByRole` → `getByLabel` → `getByTestId` → CSS (see [locators.instructions.md](instructions/locators.instructions.md) for full priority)

### AI Collaboration

- AI is a coding assistant, not an autonomous agent
- All architectural decisions remain human-driven
- Follow project standards and existing patterns

---

## Status

This project is intentionally **iterative**. Rules are implemented progressively to demonstrate real-world engineering tradeoffs and growth.
