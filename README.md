# React + TypeScript + Vite + Playwright

A modern React application with comprehensive E2E testing framework built on Playwright.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run E2E tests
npm run test:e2e

# Run smoke tests (quick validation)
npm run test:smoke
```

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **API Server**: Express.js + JWT Authentication
- **Unit Testing**: Vitest + React Testing Library
- **E2E Testing**: Playwright with Page Object Model
- **API Testing**: Playwright API testing with performance metrics
- **Linting**: Biome + ESLint (dual approach)
- **CI/CD**: GitHub Actions

## Code Quality

This project uses a **dual-linting approach** for comprehensive code quality:

### Biome (Primary)
Fast, modern linter and formatter for general code quality.

```bash
npm run lint      # Run Biome linter
npm run format    # Format code with Biome
npm run check     # Run both lint and format
```

### ESLint (React-Specific)
ESLint with React-specific plugins for rules that Biome doesn't cover:
- **react-hooks**: Enforces Rules of Hooks
- **react-refresh**: Validates Fast Refresh compatibility

```bash
npx eslint .      # Run ESLint
```

### Why Both?
- **Biome** is extremely fast and handles most linting/formatting
- **ESLint** provides React-specific rules (hooks dependencies, refresh patterns) that Biome doesn't yet support
- Together they provide comprehensive coverage

## Testing

See [docs/TESTING.md](docs/TESTING.md) for comprehensive testing documentation.

### Unit Tests
```bash
npm run test            # Run unit tests in watch mode
npm run test -- --run   # Run unit tests once
npm run test:ui         # Run with visual UI
```

### E2E Tests
```bash
npm run test:e2e        # Run all E2E tests
npm run test:smoke      # Run critical path tests
npm run test:regression # Run full test suite
npm run test:dashboard  # Generate analytics dashboard
```

### API Tests
```bash
npm run api:start       # Start API server standalone
npm run test:api        # Run all API tests (40 tests)
npm run test:api:perf   # Run API performance tests only
```

## Project Structure

```
api/                    # Express.js API server
└── server.ts           # REST API with JWT auth

src/                    # React application source
├── features/           # Feature-based components (with unit tests)
├── components/         # Shared components (with unit tests)
├── pages/              # Page components
├── services/           # Business logic (with unit tests)
├── lib/                # Utility functions (with unit tests)
├── test/               # Unit test utilities
└── router/             # React Router configuration

tests/                  # Playwright test framework
├── api/                # API test specifications
├── e2e/                # E2E test specifications
├── pages/              # Page Object Models
├── fixtures/           # Test fixtures & data
├── utils/              # Test utilities (including API helpers)
├── db/                 # SQLite test analytics
└── reporters/          # Custom reporters
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
