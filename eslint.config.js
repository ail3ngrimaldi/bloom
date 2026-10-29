import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import prettier from 'eslint-config-prettier'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import globals from 'globals'

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    '.next/**',
    '.next-*/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'coverage',
    'playwright-report',
    'test-results',
    'docs/feature-parity/shots',
  ]),
  {
    // Tooling and e2e code runs in Node, not in the browser bundle.
    files: ['*.config.{js,mjs,ts}', 'scripts/**/*.mjs', 'tests/e2e/**/*.ts'],
    extends: [js.configs.recommended],
    languageOptions: { globals: { ...globals.node } },
  },
  // Last: switches off every formatting rule that would fight Prettier.
  prettier,
])
