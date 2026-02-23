#!/usr/bin/env node

/**
 * Gallery QR Art Generator (API-based)
 *
 * Generates QR Art images by calling the deployed anqr.link API
 * for each QR Art style × fixture combination.
 *
 * QR Art embeds an image into the QR code data via Reed-Solomon
 * manipulation. The payload is just https://anqr.link — the server
 * determines the #suffix to encode the image itself.
 *
 * Environment variables:
 *   GALLERY_API_URL        API base URL (default: https://anqr.link/api/qr)
 *   GALLERY_ASSET_URL      Asset base URL for fixture images (default: https://anqr.link)
 *   GALLERY_CONCURRENCY    Parallel request count (default: 3)
 *   QRART_SCENARIOS        Comma-separated scenario IDs to run (default: all)
 *   QRART_FIXTURES         Comma-separated fixture IDs to run (default: all)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { decodeQR } from '../src/modules/qr-decoder/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'gallery-artifacts');
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'qrart');

const API_BASE = process.env.GALLERY_API_URL || 'https://anqr.link/api/qr';
const ASSET_BASE = process.env.GALLERY_ASSET_URL || 'https://anqr.link';
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '3', 10));
const PAYLOAD = 'https://anqr.link';
const IMAGE_SIZE = 400;
const FETCH_TIMEOUT_MS = 120_000;
const MAX_RETRIES = 2;
const POLL_INTERVAL_MS = 15_000;
const MAX_POLLS = 120;
const IS_LOCAL = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');

// ============================================
// Fixtures (same as CANONICAL_FIXTURES in gallery-scan-scenarios.ts)
// ============================================

const FIXTURES = [
  { id: 'tsunami', publicPath: '/tsunami.jpg', isAnimated: false },
  { id: 'king', publicPath: '/king.gif', isAnimated: true },
  { id: 'logo', publicPath: '/logo.png', isAnimated: false },
  { id: 'test', publicPath: '/test.png', isAnimated: false },
  { id: 'trump', publicPath: '/trump.png', isAnimated: false },
  { id: 'dance', publicPath: '/dance.gif', isAnimated: true },
];

// ============================================
// QR Art scenario definitions
// ============================================

const QRART_SCENARIOS = [
  {
    id: 'qrart-standard',
    title: 'QR Art Standard',
    galleryParams: { mode: 'artwork', v: 6, ec: 'L' },
  },
  {
    id: 'qrart-rounded',
    title: 'QR Art Rounded',
    galleryParams: { mode: 'artwork', style: 'rounded', finder: 'rounded', v: 6, ec: 'L' },
  },
  {
    id: 'qrart-colored',
    title: 'QR Art Colored',
    galleryParams: { mode: 'artwork', fg: '1a365d', bg: 'ebf8ff', v: 6, ec: 'L' },
  },
  {
    id: 'qrart-dots',
    title: 'QR Art Dots',
    galleryParams: { mode: 'artwork', style: 'dots', finder: 'circle', v: 6, ec: 'L' },
  },
];

// ============================================
// Scan verification
// ============================================

async function verifyImage(buffer) {
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
    // QR Art appends a #suffix to the payload, so check prefix
    if (!result.data.startsWith(PAYLOAD)) {
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

function buildApiUrl(scenario, fixture) {
  const params = new URLSearchParams();
  params.set('data', PAYLOAD);
  params.set('size', String(IMAGE_SIZE));

  for (const [key, value] of Object.entries(scenario.galleryParams)) {
    params.set(key, String(value));
  }

  // QR Art needs the image to embed
  params.set('img', `${ASSET_BASE}${fixture.publicPath}`);

  // Request GIF for animated fixtures, PNG for static
  params.set('format', fixture.isAnimated ? 'gif' : 'png');

  // Local dev: _fullRender=1 for direct rendering (blob cache unavailable)
  if (IS_LOCAL) {
    params.set('_fullRender', '1');
  }

  return `${API_BASE}?${params.toString()}`;
}

// ============================================
// HTTP fetch with retry + polling for background generation
// ============================================

async function fetchOnce(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'ANQR-Gallery-QRArt/1.0' },
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

  // If the background is generating, poll until it's cached
  if (result.generating) {
    console.warn(
      `  ⏳ Background QR-Art generation triggered, polling every ${POLL_INTERVAL_MS / 1000}s...`
    );
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
    console.warn(
      `  ⚠ Background render did not complete after ${MAX_POLLS} polls, using degraded image`
    );
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

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery QR Art Generator (API-based) ===\n');
  console.log(`API:         ${API_BASE}`);
  console.log(`Assets:      ${ASSET_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Image size:  ${IMAGE_SIZE}px`);
  console.log(`Timeout:     ${FETCH_TIMEOUT_MS / 1000}s`);
  console.log(`Poll:        ${POLL_INTERVAL_MS / 1000}s × ${MAX_POLLS} max\n`);

  let scenarios = [...QRART_SCENARIOS];
  let fixtures = [...FIXTURES];

  // Apply optional filters
  const scenarioFilter = process.env.QRART_SCENARIOS;
  if (scenarioFilter) {
    const ids = new Set(scenarioFilter.split(',').map((s) => s.trim()));
    scenarios = scenarios.filter((s) => ids.has(s.id));
  }
  const fixtureFilter = process.env.QRART_FIXTURES;
  if (fixtureFilter) {
    const ids = new Set(fixtureFilter.split(',').map((s) => s.trim()));
    fixtures = fixtures.filter((f) => ids.has(f.id));
  }

  console.log(`Scenarios: ${scenarios.length}`);
  console.log(`Fixtures:  ${fixtures.length}`);
  console.log(`Total runs: ${scenarios.length * fixtures.length}\n`);

  // Prepare artifact directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const totalRuns = scenarios.length * fixtures.length;
  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  // Build run queue: each scenario × each fixture
  const runs = [];
  for (const scenario of scenarios) {
    for (const fixture of fixtures) {
      runs.push({ scenario, fixture });
    }
  }

  const tasks = runs.map(({ scenario, fixture }) => async () => {
    const start = Date.now();
    const ext = fixture.isAnimated ? 'gif' : 'png';
    const artifactName = `qrart__${scenario.id}__${fixture.id}.${ext}`;
    const artifactPath = path.join(OUTPUT_DIR, artifactName);

    try {
      const url = buildApiUrl(scenario, fixture);
      const buffer = await fetchWithRetry(url);
      await fs.writeFile(artifactPath, buffer);

      const verify = await verifyImage(buffer);
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const decodedSuffix = verify.decoded ? verify.decoded.slice(PAYLOAD.length) : '';
      const suffix = verify.pass
        ? decodedSuffix
          ? ` [${decodedSuffix.slice(0, 30)}]`
          : ''
        : ` [${verify.reason}]`;
      console.log(
        `  [${completed}/${totalRuns}] ${icon} ${scenario.id} × ${fixture.id} ` +
          `(${(buffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`
      );

      if (verify.pass) {
        passed.push(artifactName);
      } else {
        failed.push(artifactName);
      }

      return {
        scenarioId: scenario.id,
        fixtureId: fixture.id,
        isAnimated: fixture.isAnimated,
        status: verify.pass ? 'pass' : 'fail',
        reason: verify.reason || 'OK',
        decoded: verify.decoded,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(
        `  [${completed}/${totalRuns}] ✗ ${scenario.id} × ${fixture.id}: ${err.message} [${elapsed}s]`
      );
      failed.push(artifactName);
      return {
        scenarioId: scenario.id,
        fixtureId: fixture.id,
        isAnimated: fixture.isAnimated,
        status: 'fail',
        reason: 'API_ERROR',
        durationMs: Date.now() - start,
      };
    }
  });

  const results = await runPool(tasks, CONCURRENCY);

  // Write passed.txt and failed.txt
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'passed.txt'),
    passed.join('\n') + (passed.length ? '\n' : '')
  );
  await fs.writeFile(
    path.join(OUTPUT_DIR, 'failed.txt'),
    failed.join('\n') + (failed.length ? '\n' : '')
  );

  // Write JSON summary
  const report = {
    generatedAt: new Date().toISOString(),
    apiBase: API_BASE,
    payload: PAYLOAD,
    totalRuns: results.length,
    passCount: passed.length,
    failCount: failed.length,
    scenarios: scenarios.map((s) => ({ id: s.id, title: s.title })),
    fixtures: fixtures.map((f) => ({ id: f.id, isAnimated: f.isAnimated })),
    results,
  };
  await fs.writeFile(path.join(OUTPUT_DIR, 'report.json'), JSON.stringify(report, null, 2));

  // Print summary
  const totalSec = Math.round((Date.now() - globalStart) / 1000);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${results.length} runs in ${totalSec}s`);
  console.log(
    `Pass:  ${passed.length} (${Math.round((passed.length * 100) / (results.length || 1))}%)`
  );
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
  console.error('[gallery-qrart] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
