import { defineConfig, devices } from '@playwright/test'

// Parallel workers must not share a dev server: give each its own port via E2E_PORT.
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
    // --strictPort: fail instead of silently serving on another port than baseURL.
    command: `npm run dev -- --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: true,
  },
})
