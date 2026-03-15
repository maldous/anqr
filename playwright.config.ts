import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORAGE_STATE_PATH = path.join(__dirname, 'tests', '.storage-state.json');
const isCI = !!process.env.CI;
const cpuCount = os.cpus().length;

// Auto-detect production build for faster test serving.
// During `make all`, step 6 (build) creates dist/ before step 8 (test).
// Serving the static build is ~10x faster than Vite dev server under parallel load.
const hasProductionBuild = existsSync(path.join(__dirname, 'dist', 'index.html'));

// Conservative parallelism to avoid thermal throttling.
// Too many parallel Chromium instances heat the CPU, causing thermal
// throttling that slows everything down and triggers test timeouts.
const WORKERS = isCI
  ? Math.max(4, Math.floor(cpuCount * 0.25))
  : Math.min(4, Math.max(2, Math.floor(cpuCount * 0.25)));

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: WORKERS,
  globalTimeout: 0,

  timeout: 120_000,
  expect: { timeout: 10_000 },

  forbidOnly: isCI,
  retries: 1,

  reporter: [['dot']],

  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:8888',
    viewport: { width: 1920, height: 1080 },

    trace: 'off',
    screenshot: 'off',
    video: 'off',

    actionTimeout: 15_000,
    navigationTimeout: 30_000,

    storageState: STORAGE_STATE_PATH,

    launchOptions: {
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    },
  },

  projects: [
    { name: 'basic', testMatch: /tests\/basic\/.*\.spec\.ts/ },
    { name: 'advanced', testMatch: /tests\/advanced\/.*\.spec\.ts/ },
    { name: 'professional', testMatch: /tests\/professional\/.*\.spec\.ts/ },
    {
      name: 'api',
      testMatch: /tests\/api\/.*\.spec\.ts/,
      timeout: 120_000,
    },
    {
      name: 'reports',
      testMatch: /tests\/reports\/.*\.spec\.ts/,
      timeout: 10 * 60 * 1000,
      workers: isCI ? 2 : 3,
    },
    {
      name: 'permutations',
      testMatch: /tests\/permutations\/.*\.spec\.ts/,
      timeout: 4 * 60 * 60 * 1000,
      fullyParallel: true,
      workers: isCI ? 2 : 3,
    },
  ],

  // Use netlify dev so Netlify Functions (e.g. /api/qr) are available
  // alongside the Vite app — required for API and cross-platform parity tests.
  webServer: hasProductionBuild
    ? {
        command: 'bash scripts/start-playwright-webserver.sh preview',
        url: 'http://localhost:8888',
        reuseExistingServer: !isCI,
        timeout: 60_000,
      }
    : {
        command: 'bash scripts/start-playwright-webserver.sh',
        url: 'http://localhost:8888',
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },

  globalSetup: path.join(__dirname, 'tests', 'global-setup.ts'),
  outputDir: 'test-results',
  preserveOutput: 'never',
});
