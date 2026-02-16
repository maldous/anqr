import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

// ES module compatibility: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Storage state file path - created by global-setup.ts
 * Contains localStorage with welcome modal "seen" flag
 */
const STORAGE_STATE_PATH = path.join(__dirname, 'tests', '.storage-state.json');

/**
 * Playwright configuration for ANQR UI testing
 * Supports tier-based test organization: basic, advanced, professional
 *
 * HARDWARE OPTIMIZATION:
 * - Detects CPU cores and uses 75% for parallel workers (leaves headroom for browser processes)
 * - On 32-core machine: ~24 parallel browser instances
 * - Memory: Each Chrome instance uses ~100-200MB, so 64GB supports 200+ parallel browsers
 */

// Calculate optimal worker count based on hardware
// Use 25% of CPUs for local stability - each Playwright worker spawns multiple browser processes.
// On 32-core: 8 workers keeps memory/CPU pressure lower for heavy overlay/GIF tests.
const cpuCount = os.cpus().length;
const optimalWorkers = Math.max(4, Math.floor(cpuCount * 0.25));

export default defineConfig({
  testDir: './tests',

  /* PARALLELIZATION - exploit all hardware */
  fullyParallel: true,
  workers: process.env.CI ? 4 : optimalWorkers, // 24 workers on 32-core machine

  /* Global timeout for entire test run - 0 means no limit (run until completion) */
  globalTimeout: 0,

  /* Increase timeouts for parallel load */
  timeout: 60 * 1000, // 60s per test
  expect: {
    timeout: 10 * 1000, // 10s for assertions
  },

  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  /* Reporter configuration */
  reporter: [
    ['html', { open: 'never' }],
    ['list'], // Show real-time progress
  ],

  /* Global settings */
  use: {
    baseURL: 'http://localhost:5173',

    /* Use large viewport to reduce scrolling complexity and ensure all header elements visible */
    /* Note: Each project also sets viewport AFTER spreading devices to override Chrome defaults */
    /* 1920x1080 ensures Export button and all nav items are visible without overflow */
    viewport: { width: 1920, height: 1080 },

    /* Debugging: Gold standard trace capture */
    trace: 'on-first-retry', // Captures DOM snapshots, network waterfall, exact wait reasons
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    /* Action timeout - fail fast if locators don't resolve */
    actionTimeout: 15000,
    navigationTimeout: 30000,

    /* GLOBAL STORAGE STATE: Pre-set localStorage to skip welcome modal for ALL tests
     * The storage state is created by tests/global-setup.ts before any tests run.
     * This ensures the welcome modal NEVER appears in any test. */
    storageState: STORAGE_STATE_PATH,

    /* Browser launch options for performance */
    launchOptions: {
      args: [
        '--disable-gpu', // Disable GPU for headless stability
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage', // Use /tmp instead of /dev/shm (more memory)
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
      ],
    },
  },

  /* Configure projects for different tiers */
  /* IMPORTANT: viewport is set AFTER spreading devices to override Chrome's default (1280x720) */
  projects: [
    {
      name: 'basic',
      testMatch: /tests\/basic\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Override Chrome default - 1080p to ensure all header elements visible
      },
    },
    {
      name: 'advanced',
      testMatch: /tests\/advanced\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Override Chrome default - 1080p to ensure all header elements visible
      },
    },
    {
      name: 'professional',
      testMatch: /tests\/professional\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Override Chrome default - 1080p to ensure all header elements visible
      },
    },
    {
      name: 'permutations',
      testMatch: /tests\/permutations\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Override Chrome default - 1080p to ensure all header elements visible
      },
      timeout: 4 * 60 * 60 * 1000, // 4 hours for exhaustive permutation tests
      // Permutation tests: use full parallelism for maximum throughput
      // On 32-core/64GB machine: 24 workers = 24 concurrent browser instances (~4.8GB RAM)
      fullyParallel: true,
    },
    {
      name: 'reports',
      testMatch: /tests\/reports\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }, // Override Chrome default - 1080p to ensure all header elements visible
      },
      timeout: 10 * 60 * 1000, // 10 minutes for report generation
    },
  ],

  /* Run local dev server before starting tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30 * 1000, // 30 seconds max for dev server startup
  },

  /* Global setup - runs ONCE before all tests to create storage state */
  globalSetup: path.join(__dirname, 'tests', 'global-setup.ts'),

  /* Output directory for test artifacts */
  outputDir: 'test-results/',

  /* Preserve output on failure for debugging */
  preserveOutput: 'failures-only',
});
