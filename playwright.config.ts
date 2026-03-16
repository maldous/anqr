import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4173";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
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
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run preview",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
