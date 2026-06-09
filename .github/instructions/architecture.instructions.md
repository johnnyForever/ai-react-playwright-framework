# Project Architecture

## Frontend Structure

```text
src/
├── assets
├── components        # reusable UI components
├── features          # feature-first modules
├── pages             # route-level components
├── hooks             # shared React hooks
├── services          # API / business logic
├── stores            # state management
├── router            # route definitions
├── types             # shared TypeScript types
├── styles            # global styles
└── lib               # helpers & utilities
```

---

## API Server Structure

```text
api/
└── server.ts          # Express REST API with JWT auth
```

---

## Test Structure

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
