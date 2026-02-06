# ReactApp + Test Automation Suite – Rules & Standards

## Purpose

This document defines **clear, opinionated, and practical rules** for building a **React application with Playwright test automation**, designed for **GitHub repository**.

It is intentionally written to be consumed by:

* **AI coding tools** (GitHub Copilot, Amazon Q)
* **Human reviewers** (recruiters, engineers)

The goal is to demonstrate:

* Sound architectural thinking
* Real*world test automation practices
* Clean, maintainable TypeScript code

> ⚠️ Not all rules are implemented at once. This document represents the **target architecture**, implemented **incrementally**.

## Scope & Implementation Strategy

### Mandatory (MVP)

These rules are **implemented from the start**:

* React + TypeScript setup
* Feature-based frontend structure
* Playwright with Page Object Model
* Stable locator strategy
* Basic logging & reporting

### Advanced (Incremental)

Added progressively to show evolution:

* Storage state authentication
* Network & performance monitoring
* Database backed test results
* CI/CD reporting

---

## 1. Technology Stack (Fixed)

### 1.1 Development

* Framework: **React 19**
* Language: **TypeScript**
* Build Tool: **Vite**
* Routing: **React Router DOM**
* Styling: **CSS3 (component*scoped)**
* Unit Testing: **Vitest**

### 1.2 API Server

* Framework: **Express.js**
* Authentication: **JWT (jsonwebtoken)**
* Language: **TypeScript**

### 1.3 Testing

* Test Framework: **Playwright Test**
* Language: **TypeScript**
* Pattern: **Page Object Model (POM)**
* API Testing: **Playwright APIRequestContext with custom helpers**
* Performance Testing: **Response time metrics (p50, p95, p99)**
* Assertion Library: **Playwright expect**
* Reporting: **HTML + JUnit + Custom Dashboard**
* CI/CD: **YAML*based pipeline**

### 1.4 Tooling

* Linting & Formatting: **Biome**
* Environment Management: **dotenv**
* Database (Advanced): **SQLite (better*sqlite3)**

---

## 2. Project Architecture

### 2.1 Frontend Structure

```text
src/
├── assets
├── components        # reusable UI components
├── features          # feature*first modules
├── pages             # route*level components
├── hooks             # shared React hooks
├── services          # API / business logic
├── stores            # state management
├── router            # route definitions
├── types             # shared TypeScript types
├── styles            # global styles
└── lib               # helpers & utilities
```

### 2.2 API Server Structure

```text
api/
└── server.ts          # Express REST API with JWT auth
```

### 2.3 Test Structure

```text
tests/
├── api                # API test specs (40 tests)
├── auth               # Storage state authentication setup
├── config             # Test configuration
├── data               # Test credentials
├── db                 # SQLite database layer
├── e2e                # E2E test specs
├── fixtures           # Playwright fixtures (auth.fixture.ts, api.fixture.ts)
├── pages              # Page Object Models (with BasePage.ts)
├── reporters          # Custom reporters (dbReporter.ts, dashboard/)
├── scripts            # CLI utilities
└── utils              # Helpers (apiHelpers.ts, logger.ts, crypto.ts)
```

---

## 3. Page Object Model (Mandatory)

### 3.1 POM Rules

* One page = one class
* Page Objects contain **no assertions**
* Page Objects expose **business actions**, not selectors
* No test logic inside POMs

Tests:

* Arrange data
* Call page actions
* Assert outcomes

---

## 4. Locator Strategy

### 4.1 Locator Priority (Highest → Lowest)

* getByRole
* data-testid
* getByLabel
* getByPlaceholder
* CSS selectors
* XPath (last resort)

Rules:

* XPath requires a justification comment
* Avoid brittle selectors (indexes, dynamic classes)
* Prefer accessibility first locators

---

## 5. Test Data Management

### 5.1 Principles

* Tests must be isolated
* No dependency between tests
* No leftover data after execution

### 5.2 Data Generation

* Use factories and fixtures
* Store data in project database (passwords should be encrypted)
* Randomized but deterministic when required (seeded)
* Never hardcode credentials or IDs (use dotenv)

---

## 6 Playwright Storage State

* Use Playwright `storageState` for authenticated sessions
* Regenerate state when expired
* Store outside repo or regenerate dynamically

---

## 7. API Testing (Mandatory)

### 7.1 Principles

* Use Playwright's `APIRequestContext` for API testing
* Track response times for all requests
* Assert performance thresholds

### 7.2 Performance Metrics

* Track p50, p95, p99 response times
* Define thresholds per endpoint type:
  * Health check: < 50ms
  * Read operations: < 200ms
  * Write operations: < 300ms
  * Auth operations: < 300ms

### 7.3 Test Categories

* `@api` - All API tests
* `@smoke` - Critical path API tests
* `@performance` - Performance focused tests
* `@stress` - Load and stress tests

---

## 8. Logging & Debugging (Mandatory)

### What Is Logged

* High-level UI actions
* Test start / end
* Errors with stack traces
* Screenshots on UI failures
* Trace enabled on first retry

### Rules

* No secrets in logs
* One log file per execution

---

## 9. Assertions & Error Handling

* Use Playwright `expect`
* One logical assertion per check
* Descriptive assertion messages

On failure:

* Screenshot captured
* Trace available

---

## 10. Coding Standards

### Naming

* camelCase → variables, functions
* PascalCase → classes, interfaces, types
* UPPER_CASE → global constants
* Test files: `*.spec.ts`

### TypeScript

* No `any`
* Explicit return types where useful
* Prefer interfaces over types
* Use `async/await`
* Use try/catch for risky operations

---

## 11. Reports & Artifacts

* HTML report generated per run
* Reports are not committed
* Stored per execution
* JUnit XML for CI integration (published to GitHub Actions UI via `dorny/test-reporter`)
* Custom HTML dashboard for analytics
* API performance reports with metrics

---

## 12. CI/CD

Pipeline steps:

1. Install dependencies
2. Run static analysis
3. Execute tests (unit, API, E2E)
4. Publish JUnit results to GitHub Actions UI
5. Generate test dashboard
6. Upload artifacts (reports, screenshots)
7. Archive logs

---

## 13. AI Usage Rules (Copilot / Amazon Q)

AIgenerated code must:

* Follow this document
* Prefer reuse over duplication
* Include comments for assumptions
* Avoid hacks or shortcuts
* Optimize for clarity and maintainability

### 13.1 AI Tooling

This project uses MCP servers to provide AI with structured access to:

* Playwright APIs and best practices
* Repository structure and file system
* (Optional) Git history and diffs

AI is used as a coding assistant, not an autonomous agent.
All architectural decisions remain human-driven.

---

## 14. Documentation

* README.md with setup & execution steps
* docs/ folder for design decisions
* Test strategy explained

---

## Status

This project is intentionally **iterative**.
Rules are implemented progressively to demonstrate real*world engineering tradeoffs and growth.
