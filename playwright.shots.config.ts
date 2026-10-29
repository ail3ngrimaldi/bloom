import { defineConfig } from '@playwright/test'
import base from './playwright.config'

/**
 * `npm run shots`: one 1280x720 screenshot per funnel step in docs/feature-parity/shots/NN.png
 * (git-ignored) to compare with the reference images (PLAN 8.2). Same dev server as the e2e tests.
 */
export default defineConfig({
  ...base,
  testDir: 'scripts',
  testMatch: 'shots.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
})
