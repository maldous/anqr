import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "basic",
      testMatch: /basic\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "advanced",
      testMatch: /advanced\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "professional",
      testMatch: /professional\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "permutations",
      testMatch: /permutations\..*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "openclaw",
      testMatch: /openclaw.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
      timeout: 120_000,
      fullyParallel: false,
    },
  ],
  // Web server only needed for UI-based projects (basic, advanced, professional, permutations).
  // OpenClaw tests use the Symphony agent router (port 4319) which is managed by systemd, not Playwright.
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run preview",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
