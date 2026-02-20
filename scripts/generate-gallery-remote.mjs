#!/usr/bin/env node

/**
 * Gallery Remote Generator (API-based)
 *
 * Renders all 1000 gallery permutation configs by calling the deployed
 * anqr.link API. Saves artifacts to reports/gallery-artifacts/remote/
 * with passed.txt/failed.txt for manual inspection.
 *
 * Environment variables:
 *   GALLERY_API_URL        API base URL (default: https://anqr.link/api/qr)
 *   GALLERY_ASSET_URL      Asset base URL for overlay images (default: https://anqr.link)
 *   GALLERY_CONCURRENCY    Parallel request count (default: 6)
 *   GALLERY_CATEGORY       Filter by category: nooverlay/overlay/artwork (default: all)
 *   GALLERY_IDS            Comma-separated config IDs to run (default: all)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'remote');

const API_BASE = process.env.GALLERY_API_URL || 'https://anqr.link/api/qr';
const ASSET_BASE = process.env.GALLERY_ASSET_URL || 'https://anqr.link';
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '6', 10));
const FETCH_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 2;
const POLL_INTERVAL_MS = 10_000;
const MAX_POLLS = 90;
const IS_LOCAL = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');

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
// URL construction
// ============================================

function buildApiUrl(config) {
  const qs = buildUrlParams(config);
  const params = new URLSearchParams(qs);

  // Resolve overlay image URLs to absolute paths
  if (params.has('img')) {
    const imgPath = params.get('img');
    if (imgPath.startsWith('/')) {
      params.set('img', `${ASSET_BASE}${imgPath}`);
    }
  }

  // Local dev: _fullRender=1 for direct rendering (blob cache unavailable)
  if (IS_LOCAL && (config.params.mode || config.params.img)) {
    params.set('_fullRender', '1');
  }

  return `${API_BASE}?${params.toString()}`;
}

// ============================================
// HTTP fetch with retry + polling
// ============================================

async function fetchOnce(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'ANQR-Gallery-Remote/1.0' },
  });
  clearTimeout(timeoutId);

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const generating = response.headers.get('X-ANQR-Status') === 'generating';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, generating };
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let result;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      result = await fetchOnce(url);
      break;
    } catch (err) {
      if (attempt < retries) {
        const delay = 2000 * (attempt + 1);
        console.warn(`  ↻ Retry ${attempt + 1}/${retries} after ${delay}ms: ${err.message}`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  if (result.generating) {
    console.warn(`  ⏳ Background generation triggered, polling every ${POLL_INTERVAL_MS / 1000}s...`);
    for (let poll = 1; poll <= MAX_POLLS; poll++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const pollResult = await fetchOnce(url);
        if (!pollResult.generating) {
          if (pollResult.buffer.length < 100) {
            throw new Error(`Response too small: ${pollResult.buffer.length} bytes`);
          }
          return pollResult.buffer;
        }
        console.warn(`  ⏳ Still generating... (poll ${poll}/${MAX_POLLS})`);
      } catch (err) {
        console.warn(`  ⏳ Poll ${poll}/${MAX_POLLS} failed: ${err.message}`);
      }
    }
    console.warn(`  ⚠ Background render did not complete after ${MAX_POLLS} polls, using degraded image`);
    return result.buffer;
  }

  if (result.buffer.length < 100) {
    throw new Error(`Response too small: ${result.buffer.length} bytes`);
  }
  return result.buffer;
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
    Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker())
  );
  return results;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery Remote Generator (API-based) ===\n');
  console.log(`API:         ${API_BASE}`);
  console.log(`Assets:      ${ASSET_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);

  let configs = generateAllScenarios();

  // Apply optional filters
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

  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  const tasks = configs.map((config) => async () => {
    const start = Date.now();
    const filename = scenarioFilename(config);
    const artifactPath = path.join(OUTPUT_DIR, filename);
    const expectedPayload = config.params.data;

    try {
      const url = buildApiUrl(config);
      const buffer = await fetchWithRetry(url);
      await fs.writeFile(artifactPath, buffer);

      // Artwork appends a #suffix, so verify prefix only
      const isArtwork = config.category === 'artwork';
      const verify = isArtwork
        ? await verifyImage(buffer, expectedPayload)
        : await verifyImage(buffer, expectedPayload);

      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const suffix = verify.pass ? '' : ` [${verify.reason}]`;
      console.log(
        `  [${completed}/${configs.length}] ${icon} ${config.id} ` +
          `(${(buffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`
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
        reason: 'API_ERROR',
        durationMs: Date.now() - start,
      };
    }
  });

  const results = await runPool(tasks, CONCURRENCY);

  // Write passed.txt and failed.txt
  await fs.writeFile(path.join(OUTPUT_DIR, 'passed.txt'), passed.join('\n') + (passed.length ? '\n' : ''));
  await fs.writeFile(path.join(OUTPUT_DIR, 'failed.txt'), failed.join('\n') + (failed.length ? '\n' : ''));

  // Write JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'remote',
    apiBase: API_BASE,
    totalRuns: results.length,
    passCount: passed.length,
    failCount: failed.length,
    categories: Object.fromEntries(
      ['nooverlay', 'overlay', 'artwork'].map((cat) => {
        const catResults = results.filter((r) => r.category === cat);
        return [cat, { total: catResults.length, pass: catResults.filter((r) => r.status === 'pass').length }];
      })
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
  console.error('[gallery-remote] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
