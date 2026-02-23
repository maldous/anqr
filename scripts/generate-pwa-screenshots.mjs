#!/usr/bin/env node

/**
 * PWA Screenshot Generator
 *
 * Generates real screenshots of the running ANQR app for the PWA manifest.
 * Uses Playwright to capture at the exact dimensions declared in manifest.json.
 *
 * Run with: node scripts/generate-pwa-screenshots.mjs
 *
 * Prerequisites:
 * - npx playwright install chromium
 * - Dev server running (default port 5173, override with SCREENSHOT_PORT env var)
 */

import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const SCREENSHOTS_DIR = join(projectRoot, 'public', 'screenshots');

const PORT = process.env.SCREENSHOT_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;

// Must match WelcomeModal.tsx constants
const WELCOME_STORAGE_KEY = 'anqr-welcome-seen';
const WELCOME_VERSION = '2026.02.01';

const TARGETS = [
  { width: 1280, height: 720, name: 'desktop.png', label: 'Desktop (wide)' },
  { width: 720, height: 1280, name: 'mobile.png', label: 'Mobile (narrow)' },
];

async function waitForCanvasReady(page, timeout = 30_000) {
  await page.waitForSelector('canvas', { timeout });
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    },
    { timeout }
  );
}

async function captureScreenshot(browser, target) {
  const context = await browser.newContext({
    viewport: { width: target.width, height: target.height },
  });

  // Dismiss welcome modal before page scripts run
  await context.addInitScript(
    ({ key, value }) => {
      localStorage.setItem(key, value);
    },
    { key: WELCOME_STORAGE_KEY, value: WELCOME_VERSION }
  );

  const page = await context.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 60_000 });
  await waitForCanvasReady(page);

  // Let UI fully settle (lazy components, animations)
  await page.waitForTimeout(1000);

  const filepath = join(SCREENSHOTS_DIR, target.name);
  await page.screenshot({ path: filepath, type: 'png' });
  console.log(`  ✅ ${target.label}: ${target.name} (${target.width}×${target.height})`);

  await context.close();
}

async function main() {
  console.log('\n=== ANQR PWA Screenshot Generator ===\n');
  console.log(`Server: ${BASE_URL}\n`);

  await mkdir(SCREENSHOTS_DIR, { recursive: true });

  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const target of TARGETS) {
      await captureScreenshot(browser, target);
    }
  } finally {
    await browser.close();
  }

  console.log('\n🎉 PWA screenshots generated successfully!\n');
}

main().catch((err) => {
  console.error('❌ Error generating PWA screenshots:', err);
  process.exit(1);
});
