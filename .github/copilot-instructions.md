# ReactApp + Test Automation Suite – Rules & Standards

## Purpose

This document defines **clear, opinionated, and practical rules** for building a **React application with Playwright test automation**.

Intended audience:

* **AI coding tools** (GitHub Copilot, Amazon Q)
* **Human reviewers** (recruiters, engineers)

> ⚠️ This is the **target architecture**, implemented **incrementally**.

---

## Detailed Instructions

Detailed rules are split into topic-specific files in `.github/instructions/`:

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

## General Principles

### Code Quality

* No `any` in TypeScript
* Prefer reuse over duplication
* Optimize for clarity and maintainability

### Testing

* Page Object Model (POM) is mandatory
* Tests must be isolated with no shared state
* Accessibility-first locators (`getByRole` > `data-testid` > CSS)

### AI Collaboration

* AI is a coding assistant, not autonomous agent
* All architectural decisions remain human-driven
* Follow project standards and existing patterns

---

## Status

This project is intentionally **iterative**.
Rules are implemented progressively to demonstrate real-world engineering tradeoffs and growth.
