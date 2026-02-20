#!/usr/bin/env node

/**
 * Gallery Browser Generator (Playwright-based)
 *
 * Renders all 1000 gallery permutation configs by launching a headless
 * Chromium browser, navigating to the running dev server with URL params,
 * and screenshotting the QR code canvas element.
 *
 * Saves artifacts to reports/gallery-artifacts/browser/
 * with passed.txt/failed.txt/report.json for inspection.
 *
 * Environment variables:
 *   GALLERY_PORT           Dev server port (default: 5173)
 *   GALLERY_CONCURRENCY    Parallel browser contexts (default: 3)
 *   GALLERY_CATEGORY       Filter by category: nooverlay/overlay/artwork (default: all)
 *   GALLERY_IDS            Comma-separated config IDs to run (default: all)
 *
 * Prerequisites:
 *   - npx playwright install chromium
 *   - Dev server running on GALLERY_PORT
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { decodeQR } from '../src/modules/qr-decoder/index.ts';
import {
  generateAllScenarios,
  buildUrlParams,
  scenarioFilename,
} from './lib/gallery-permutations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'gallery-artifacts');
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'browser');

const PORT = process.env.GALLERY_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '3', 10));
const PAGE_TIMEOUT = 30_000;
const CANVAS_SELECTOR = '[data-testid="preview-canvas"]';

// Must match WelcomeModal.tsx constants
const WELCOME_STORAGE_KEY = 'anqr-welcome-seen';
const WELCOME_VERSION = '2026.02.01';

// ============================================
// Scan verification
// ============================================

async function verifyImage(buffer, expectedPrefix) {
  try {
    const img = await loadImage(buffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });
    if (!result || !result.success) {
      return { pass: false, reason: 'DECODE_FAILED' };
    }
    if (!result.data.startsWith(expectedPrefix)) {
      return { pass: false, reason: 'CONTENT_MISMATCH', decoded: result.data };
    }
    return { pass: true, decoded: result.data };
  } catch (err) {
    return { pass: false, reason: 'VERIFY_ERROR', message: err.message };
  }
}

// ============================================
// Server health check
// ============================================

async function checkServerRunning() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(BASE_URL, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================
// Concurrency pool
// ============================================

async function runPool(tasks, concurrency) {
  const results = new Array(tasks.length);
  let nextIdx = 0;

  async function worker() {
    while (nextIdx < tasks.length) {
      const i = nextIdx++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()),
  );
  return results;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery Browser Generator (Playwright) ===\n');
  console.log(`Server:      ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Timeout:     ${PAGE_TIMEOUT / 1000}s per page\n`);

  // Check server is running
  const serverUp = await checkServerRunning();
  if (!serverUp) {
    console.error(`❌ Dev server not running at ${BASE_URL}`);
    console.error('   Start the dev server first: npm run dev');
    process.exitCode = 1;
    return;
  }
  console.log(`✅ Dev server is running at ${BASE_URL}\n`);

  // Generate and filter configs
  let configs = generateAllScenarios();

  const categoryFilter = process.env.GALLERY_CATEGORY;
  if (categoryFilter) {
    const cats = new Set(categoryFilter.split(',').map((s) => s.trim()));
    configs = configs.filter((c) => cats.has(c.category));
  }
  const idFilter = process.env.GALLERY_IDS;
  if (idFilter) {
    const ids = new Set(idFilter.split(',').map((s) => s.trim()));
    configs = configs.filter((c) => ids.has(c.id));
  }

  console.log(`Configs: ${configs.length}\n`);

  // Prepare artifact directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  // Launch browser
  const browser = await chromium.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  const tasks = configs.map((config) => async () => {
    const start = Date.now();
    const filename = scenarioFilename(config);
    const artifactPath = path.join(OUTPUT_DIR, filename);
    const expectedPayload = config.params.data;

    let context;
    let page;
    try {
      // Create a new browser context with fixed viewport
      context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
      });

      // Dismiss welcome modal before page scripts run
      await context.addInitScript(
        ({ key, value }) => {
          localStorage.setItem(key, value);
        },
        { key: WELCOME_STORAGE_KEY, value: WELCOME_VERSION },
      );

      page = await context.newPage();

      // Build the app URL with query params
      const qs = buildUrlParams(config);
      const url = `${BASE_URL}/?${qs}`;

      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle', timeout: PAGE_TIMEOUT });

      // Wait for the QR code canvas to appear
      await page.waitForSelector(CANVAS_SELECTOR, { timeout: PAGE_TIMEOUT });

      // Wait for the canvas to have non-zero dimensions and painted content
      await page.waitForFunction(
        (selector) => {
          const canvas = document.querySelector(selector);
          if (!canvas) return false;
          if (canvas.width === 0 || canvas.height === 0) return false;
          // Check that the canvas has some non-transparent pixels
          try {
            const ctx = canvas.getContext('2d');
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            for (let i = 3; i < data.length; i += 4) {
              if (data[i] > 0) return true;
            }
          } catch {
            // Canvas might be cross-origin or WebGL — assume ready if dimensions are set
            return canvas.width > 0 && canvas.height > 0;
          }
          return false;
        },
        CANVAS_SELECTOR,
        { timeout: PAGE_TIMEOUT },
      );

      // Small delay to let rendering fully settle
      await page.waitForTimeout(300);

      // Screenshot just the canvas element
      const element = await page.$(CANVAS_SELECTOR);
      if (!element) {
        throw new Error('Canvas element not found after waiting');
      }

      const screenshotBuffer = await element.screenshot({ type: 'png' });

      // Save the screenshot
      await fs.writeFile(artifactPath, screenshotBuffer);

      // Verify via QR decode
      const verify = await verifyImage(screenshotBuffer, expectedPayload);

      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const suffix = verify.pass ? '' : ` [${verify.reason}]`;
      console.log(
        `  [${completed}/${configs.length}] ${icon} ${config.id} ` +
          `(${(screenshotBuffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`,
      );

      if (verify.pass) {
        passed.push(filename);
      } else {
        failed.push(filename);
      }

      return {
        id: config.id,
        category: config.category,
        status: verify.pass ? 'pass' : 'fail',
        reason: verify.reason || 'OK',
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(`  [${completed}/${configs.length}] ✗ ${config.id}: ${err.message} [${elapsed}s]`);
      failed.push(filename);
      return {
        id: config.id,
        category: config.category,
        status: 'fail',
        reason: 'BROWSER_ERROR',
        message: err.message,
        durationMs: Date.now() - start,
      };
    } finally {
      // Close context (and its page) to free memory
      if (context) {
        await context.close().catch(() => {});
      }
    }
  });

  let results;
  try {
    results = await runPool(tasks, CONCURRENCY);
  } finally {
    await browser.close();
  }

  // Write passed.txt and failed.txt
  await fs.writeFile(path.join(OUTPUT_DIR, 'passed.txt'), passed.join('\n') + (passed.length ? '\n' : ''));
  await fs.writeFile(path.join(OUTPUT_DIR, 'failed.txt'), failed.join('\n') + (failed.length ? '\n' : ''));

  // Write JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'browser',
    serverUrl: BASE_URL,
    concurrency: CONCURRENCY,
    totalRuns: results.length,
    passCount: passed.length,
    failCount: failed.length,
    categories: Object.fromEntries(
      ['nooverlay', 'overlay', 'artwork'].map((cat) => {
        const catResults = results.filter((r) => r.category === cat);
        return [cat, { total: catResults.length, pass: catResults.filter((r) => r.status === 'pass').length }];
      }),
    ),
    results,
  };
  await fs.writeFile(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

  // Print summary
  const totalSec = Math.round((Date.now() - globalStart) / 1000);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${results.length} runs in ${totalSec}s`);
  console.log(`Pass:  ${passed.length} (${Math.round((passed.length * 100) / (results.length || 1))}%)`);
  console.log(`Fail:  ${failed.length}`);
  console.log(`\nArtifacts: ${OUTPUT_DIR}/`);
  console.log(`Passed:    ${OUTPUT_DIR}/passed.txt`);
  console.log(`Failed:    ${OUTPUT_DIR}/failed.txt`);
  console.log(`Report:    ${OUTPUT_DIR}/report.json\n`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[gallery-browser] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
