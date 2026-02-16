/**
 * Global Setup for Playwright Tests
 *
 * This file runs ONCE before all tests start.
 * It creates a storage state file that pre-sets localStorage to skip the welcome modal.
 *
 * IMPORTANT: This ensures ALL tests automatically bypass the welcome modal
 * without needing to call dismissWelcomeModal() or setWelcomeModalSeen() manually.
 */

import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, type FullConfig } from '@playwright/test';

// ES module compatibility: get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Welcome Modal localStorage key and version.
 * This must match the values in src/components/WelcomeModal.tsx
 */
const WELCOME_MODAL_STORAGE_KEY = 'anqr-welcome-seen';
/** IMPORTANT: This MUST match WELCOME_VERSION in src/components/WelcomeModal.tsx */
const WELCOME_MODAL_VERSION = '2026.02.01';

/** Path to the storage state file */
const STORAGE_STATE_PATH = path.join(__dirname, '.storage-state.json');

async function globalSetup(config: FullConfig) {
  // Get the base URL from the config
  const baseURL = config.projects[0]?.use?.baseURL || 'http://localhost:5173';

  // Launch a browser to set up localStorage
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the app to initialize localStorage domain
  try {
    await page.goto(baseURL, { timeout: 300000, waitUntil: 'domcontentloaded' });
  } catch {
    // If the server isn't ready yet, that's OK - we just need the context
    // The webServer config will ensure it's ready before tests run
  }

  // Set localStorage to skip the welcome modal
  await page.evaluate(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: WELCOME_MODAL_STORAGE_KEY, value: WELCOME_MODAL_VERSION }
  );

  // Save the storage state (includes localStorage)
  await context.storageState({ path: STORAGE_STATE_PATH });

  await browser.close();

  console.log(`✓ Global setup complete: Welcome modal will be skipped for all tests`);
  console.log(`  Storage state saved to: ${STORAGE_STATE_PATH}`);
}

export default globalSetup;

// Export constants for use in other files
export { WELCOME_MODAL_STORAGE_KEY, WELCOME_MODAL_VERSION, STORAGE_STATE_PATH };
