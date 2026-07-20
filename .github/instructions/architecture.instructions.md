# Project Architecture

## Frontend Structure

```text
src/
├── assets/           # Static assets (images, fonts)
├── components/       # Reusable UI components
├── features/         # Feature-based modules (auth, basket, checkout)
├── pages/            # Route-level page components
├── hooks/            # Shared React hooks
├── services/         # API clients and business logic
├── stores/           # State management
├── router/           # Route definitions
├── types/            # Shared TypeScript types
├── styles/           # Global styles
├── lib/              # Helpers and utilities
└── test/             # Unit test utilities and setup
```

**Feature Module Structure:**
```text
features/auth/
├── index.ts          # Public exports
├── components/       # Feature-specific components
├── hooks/            # Feature-specific hooks
└── types/            # Feature-specific types
```

---

## API Server Structure

```text
api/
└── server.ts         # Express REST API with JWT authentication
```

---

## Test Structure

```text
tests/
├── api/              # API test specs
├── auth/             # Authentication setup (storage state)
├── config/           # Test configuration
├── data/             # Test credentials and constants
├── db/               # SQLite database layer for results
├── e2e/              # E2E test specs (user journey tests)
├── fixtures/         # Playwright fixtures (auth, api, test data)
├── pages/            # Page Object Models (extending BasePage)
├── reporters/        # Custom reporters (dbReporter, dashboard)
├── scripts/          # CLI utilities
└── utils/            # Helpers (apiHelpers, logger, crypto)
```

---

## Key Architectural Decisions

1. **Feature-based organization**: Frontend code grouped by feature, not by type
2. **Page Object Model**: All E2E tests use POMs extending BasePage
3. **Fixture-based dependency injection**: Playwright fixtures provide page objects
4. **Centralized test data**: Factory patterns and fixtures for test data
