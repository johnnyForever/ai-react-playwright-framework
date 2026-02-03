import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

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
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
])
