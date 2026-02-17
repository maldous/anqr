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

// Aggressive parallelism for 32-core / 64GB
const WORKERS = isCI
  ? Math.max(8, Math.floor(cpuCount * 0.4)) // ~12 on 32 cores
  : Math.max(10, Math.floor(cpuCount * 0.5)); // ~16 on 32 cores

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: WORKERS,
  globalTimeout: 0,

  timeout: 75_000,
  expect: { timeout: 10_000 },

  forbidOnly: isCI,
  retries: 0,

  reporter: [['dot']],

  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:5173',
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
      name: 'reports',
      testMatch: /tests\/reports\/.*\.spec\.ts/,
      timeout: 10 * 60 * 1000,
      workers: isCI ? 4 : 6,
    },
    {
      name: 'permutations',
      testMatch: /tests\/permutations\/.*\.spec\.ts/,
      timeout: 4 * 60 * 60 * 1000,
      fullyParallel: true,
      workers: isCI ? 4 : 6,
    },
  ],

  webServer: hasProductionBuild
    ? {
        command: 'npx vite preview --port 5173 --strictPort',
        url: 'http://localhost:5173',
        reuseExistingServer: !isCI,
        timeout: 20_000,
      }
    : {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: !isCI,
        timeout: 180_000,
      },

  globalSetup: path.join(__dirname, 'tests', 'global-setup.ts'),
  outputDir: 'test-results',
  preserveOutput: 'never',
});
