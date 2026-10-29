import { defineConfig, devices } from '@playwright/test'

// Parallel workers must not share a dev server: give each its own port via E2E_PORT, and its own
// NEXT_DIST_DIR (Next refuses two dev servers on the same distDir).
const port = Number(process.env.E2E_PORT ?? 5173)
const baseURL = process.env.BASE_URL ?? `http://localhost:${port}`

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
  ],
  webServer: {
    command: `npx next dev -p ${port}`,
    // An empty NEXT_DIST_DIR falls back to .next in next.config.ts. Telemetry stays off: the app
    // sends no data to third parties (and neither should its tooling).
    env: { NEXT_DIST_DIR: process.env.NEXT_DIST_DIR ?? '', NEXT_TELEMETRY_DISABLED: '1' },
    url: baseURL,
    reuseExistingServer: true,
    // The first request compiles pages on demand, which is slow on a cold cache.
    timeout: 120_000,
  },
})
