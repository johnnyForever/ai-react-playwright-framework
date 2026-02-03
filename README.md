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
- **E2E Testing**: Playwright with Page Object Model
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

```bash
npm run test:e2e        # Run all E2E tests
npm run test:smoke      # Run critical path tests
npm run test:regression # Run full test suite
npm run test:dashboard  # Generate analytics dashboard
```

## Project Structure

```
src/                    # React application source
├── features/           # Feature-based components
├── pages/              # Page components
├── context/            # React Context providers
└── router/             # React Router configuration

tests/                  # Playwright test framework
├── e2e/                # Test specifications
├── pages/              # Page Object Models
├── fixtures/           # Test fixtures & data
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
