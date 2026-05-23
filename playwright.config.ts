import { defineConfig, devices } from "@playwright/test";

// E2E runs against the dev server with the local PGlite database (seeded via
// `pnpm db:reset`). These are the living acceptance tests of the core loop.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000/today",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
