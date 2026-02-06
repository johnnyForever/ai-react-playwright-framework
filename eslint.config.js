import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * ESLint Configuration
 *
 * This project uses a dual-linting approach:
 * - Biome: Fast formatting and general linting (npm run lint, npm run format)
 * - ESLint: React-specific rules (hooks, refresh) that Biome doesn't cover
 *
 * Run ESLint: npx eslint .
 * Run Biome: npm run lint
 */
export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'playwright-report', 'test-results']),
  // React source files - apply React hooks rules
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // Test files and other TypeScript - no React hooks rules
  {
    files: ['tests/**/*.{ts,tsx}', 'api/**/*.ts'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]);
