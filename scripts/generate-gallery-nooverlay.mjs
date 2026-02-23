#!/usr/bin/env node

/**
 * Gallery Non-Overlay Generator (API-based)
 *
 * Generates non-overlay QR code images by calling the deployed anqr.link API
 * for each scenario. These showcase render styles, colors, gradients, frames,
 * encoding options, and other features that don't require an overlay image.
 *
 * Each scenario produces a single PNG (no fixture permutations).
 * All QR codes encode https://anqr.link as the payload.
 *
 * Environment variables:
 *   GALLERY_API_URL        API base URL (default: https://anqr.link/api/qr)
 *   GALLERY_CONCURRENCY    Parallel request count (default: 6)
 *   NOOVERLAY_SCENARIOS    Comma-separated scenario IDs to run (default: all)
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
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'nooverlay');

const API_BASE = process.env.GALLERY_API_URL || 'https://anqr.link/api/qr';
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '6', 10));
const PAYLOAD = 'https://anqr.link';
const IMAGE_SIZE = 400;
const FETCH_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;

// ============================================
// Non-overlay scenario definitions
// ============================================

const NON_OVERLAY_SCENARIOS = [
  // --- Plain / Default ---
  { id: 'plain-default', title: 'Plain Default', galleryParams: { v: 3, ec: 'H' } },
  { id: 'plain-v6', title: 'Plain Version 6', galleryParams: { v: 6, ec: 'H' } },
  { id: 'plain-v9', title: 'Plain Version 9', galleryParams: { v: 9, ec: 'H' } },

  // --- Module Styles ---
  {
    id: 'style-rounded',
    title: 'Rounded Modules',
    galleryParams: { style: 'rounded', finder: 'rounded', v: 6, ec: 'H' },
  },
  {
    id: 'style-dots',
    title: 'Dot Modules',
    galleryParams: { style: 'dots', finder: 'circle', v: 6, ec: 'H' },
  },
  {
    id: 'style-diamond',
    title: 'Diamond Modules',
    galleryParams: { style: 'diamond', finder: 'diamond', v: 6, ec: 'H' },
  },
  {
    id: 'style-connected',
    title: 'Connected Modules',
    galleryParams: { style: 'connected', v: 6, ec: 'H' },
  },

  // --- Finder Variations ---
  {
    id: 'finder-circle',
    title: 'Circle Finders',
    galleryParams: { finder: 'circle', v: 6, ec: 'H' },
  },
  {
    id: 'finder-diamond',
    title: 'Diamond Finders',
    galleryParams: { finder: 'diamond', v: 6, ec: 'H' },
  },
  {
    id: 'finder-rounded',
    title: 'Rounded Finders',
    galleryParams: { finder: 'rounded', v: 6, ec: 'H' },
  },

  // --- Color Themes ---
  {
    id: 'color-navy-white',
    title: 'Navy on White',
    galleryParams: { fg: '1a365d', bg: 'ffffff', v: 6, ec: 'H' },
  },
  {
    id: 'color-red-cream',
    title: 'Red on Cream',
    galleryParams: { fg: 'c41e3a', bg: 'fff5e6', v: 6, ec: 'H' },
  },
  {
    id: 'color-green-light',
    title: 'Green on Light',
    galleryParams: { fg: '166534', bg: 'f0fdf4', v: 6, ec: 'H' },
  },
  {
    id: 'color-purple-light',
    title: 'Purple on Light',
    galleryParams: { fg: '6b21a8', bg: 'faf5ff', v: 6, ec: 'H' },
  },
  {
    id: 'color-dark-gold',
    title: 'Dark on Gold',
    galleryParams: { fg: '1c1917', bg: 'fef3c7', v: 6, ec: 'H' },
  },
  {
    id: 'color-teal-dark',
    title: 'Teal on Dark',
    galleryParams: { fg: '2dd4bf', bg: '1e293b', v: 6, ec: 'H' },
  },

  // --- Gradients ---
  {
    id: 'gradient-linear-135',
    title: 'Linear Gradient 135°',
    galleryParams: {
      grad: 'linear',
      gradStops: '1a1a2e,0,e94560,1',
      gradAngle: 135,
      v: 6,
      ec: 'H',
    },
  },
  {
    id: 'gradient-linear-0',
    title: 'Linear Gradient Vertical',
    galleryParams: { grad: 'linear', gradStops: '0ea5e9,0,6366f1,1', gradAngle: 0, v: 6, ec: 'H' },
  },
  {
    id: 'gradient-linear-90',
    title: 'Linear Gradient Horizontal',
    galleryParams: { grad: 'linear', gradStops: 'dc2626,0,f97316,1', gradAngle: 90, v: 6, ec: 'H' },
  },
  {
    id: 'gradient-linear-3stop',
    title: 'Three-Stop Gradient',
    galleryParams: {
      grad: 'linear',
      gradStops: '7c3aed,0,ec4899,0.5,f59e0b,1',
      gradAngle: 135,
      v: 6,
      ec: 'H',
    },
  },
  {
    id: 'gradient-radial',
    title: 'Radial Gradient',
    galleryParams: { grad: 'radial', gradStops: 'f59e0b,0,dc2626,1', v: 6, ec: 'H' },
  },

  // --- Frames ---
  {
    id: 'frame-tag',
    title: 'Tag Frame',
    galleryParams: { frame: 'tag', frameText: 'ANQR', v: 6, ec: 'H' },
  },
  {
    id: 'frame-sticker',
    title: 'Sticker Frame',
    galleryParams: { frame: 'sticker', frameText: 'SCAN ME', v: 6, ec: 'H' },
  },
  {
    id: 'frame-banner',
    title: 'Banner Frame',
    galleryParams: { frame: 'banner', frameText: 'anqr.link', v: 6, ec: 'H' },
  },

  // --- Gap Modes ---
  {
    id: 'gap-inset',
    title: 'Inset Gap',
    galleryParams: { gapMode: 'inset', gap: 15, v: 6, ec: 'H' },
  },
  {
    id: 'gap-outline',
    title: 'Outline Gap',
    galleryParams: { gapMode: 'outline', gap: 12, v: 6, ec: 'H' },
  },
  {
    id: 'gap-diamond-inset',
    title: 'Diamond + Inset Gap',
    galleryParams: { style: 'diamond', gapMode: 'inset', gap: 15, v: 6, ec: 'H' },
  },

  // --- Encoding Variations ---
  { id: 'encoding-v3-l', title: 'V3 ECC-L', galleryParams: { v: 3, ec: 'L' } },
  { id: 'encoding-v6-q', title: 'V6 ECC-Q', galleryParams: { v: 6, ec: 'Q' } },
  { id: 'encoding-v9-m', title: 'V9 ECC-M', galleryParams: { v: 9, ec: 'M' } },
  {
    id: 'encoding-byte-v6',
    title: 'Byte Encoding V6',
    galleryParams: { enc: 'byte', v: 6, ec: 'H' },
  },

  // --- Eye Style Combinations ---
  {
    id: 'eye-rounded-rounded',
    title: 'Rounded Eye Styles',
    galleryParams: { eyeInner: 'rounded', eyeOuter: 'rounded', v: 6, ec: 'H' },
  },
  {
    id: 'eye-circle-circle',
    title: 'Circle Eye Styles',
    galleryParams: { eyeInner: 'circle', eyeOuter: 'circle', v: 6, ec: 'H' },
  },

  // --- Combined Features ---
  {
    id: 'combo-rounded-gradient',
    title: 'Rounded + Gradient',
    galleryParams: {
      style: 'rounded',
      finder: 'rounded',
      grad: 'linear',
      gradStops: '6366f1,0,ec4899,1',
      gradAngle: 135,
      v: 6,
      ec: 'H',
    },
  },
  {
    id: 'combo-dots-teal',
    title: 'Dots + Teal Theme',
    galleryParams: { style: 'dots', finder: 'circle', fg: '0d9488', bg: 'f0fdfa', v: 6, ec: 'H' },
  },
  {
    id: 'combo-diamond-frame',
    title: 'Diamond + Frame',
    galleryParams: { style: 'diamond', frame: 'tag', frameText: 'ANQR', v: 6, ec: 'H' },
  },
  {
    id: 'combo-rounded-gap-gradient',
    title: 'Rounded + Gap + Gradient',
    galleryParams: {
      style: 'rounded',
      finder: 'rounded',
      gapMode: 'inset',
      gap: 10,
      grad: 'linear',
      gradStops: '059669,0,0284c7,1',
      gradAngle: 45,
      v: 6,
      ec: 'H',
    },
  },
  {
    id: 'combo-dots-radial',
    title: 'Dots + Radial Gradient',
    galleryParams: {
      style: 'dots',
      finder: 'circle',
      grad: 'radial',
      gradStops: '7c3aed,0,db2777,1',
      v: 6,
      ec: 'H',
    },
  },
  {
    id: 'combo-connected-navy',
    title: 'Connected + Navy',
    galleryParams: { style: 'connected', fg: '1e3a5f', bg: 'e0f2fe', v: 6, ec: 'H' },
  },
];

// ============================================
// Scan verification
// ============================================

async function verifyImage(buffer, expectedPayload) {
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
    if (result.data !== expectedPayload) {
      return { pass: false, reason: 'CONTENT_MISMATCH', decoded: result.data };
    }
    return { pass: true };
  } catch (err) {
    return { pass: false, reason: 'VERIFY_ERROR', message: err.message };
  }
}

// ============================================
// URL construction
// ============================================

function buildApiUrl(scenario) {
  const params = new URLSearchParams();
  params.set('data', PAYLOAD);
  params.set('size', String(IMAGE_SIZE));
  params.set('format', 'png');

  for (const [key, value] of Object.entries(scenario.galleryParams)) {
    params.set(key, String(value));
  }

  return `${API_BASE}?${params.toString()}`;
}

// ============================================
// HTTP fetch with retry
// ============================================

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'ANQR-Gallery-NoOverlay/1.0' },
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length < 100) {
        throw new Error(`Response too small: ${buffer.length} bytes`);
      }
      return buffer;
    } catch (err) {
      if (attempt < retries) {
        const delay = 1000 * (attempt + 1);
        console.warn(`  ↻ Retry ${attempt + 1}/${retries} after ${delay}ms: ${err.message}`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
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

  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker()));
  return results;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery Non-Overlay Generator (API-based) ===\n');
  console.log(`API:         ${API_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Image size:  ${IMAGE_SIZE}px\n`);

  let scenarios = [...NON_OVERLAY_SCENARIOS];

  // Apply optional filter
  const scenarioFilter = process.env.NOOVERLAY_SCENARIOS;
  if (scenarioFilter) {
    const ids = new Set(scenarioFilter.split(',').map((s) => s.trim()));
    scenarios = scenarios.filter((s) => ids.has(s.id));
  }

  console.log(`Scenarios: ${scenarios.length}\n`);

  // Prepare artifact directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  const tasks = scenarios.map((scenario) => async () => {
    const start = Date.now();
    const artifactName = `nooverlay__${scenario.id}.png`;
    const artifactPath = path.join(OUTPUT_DIR, artifactName);

    try {
      const url = buildApiUrl(scenario);
      const buffer = await fetchWithRetry(url);
      await fs.writeFile(artifactPath, buffer);

      const verify = await verifyImage(buffer, PAYLOAD);
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const suffix = verify.pass ? '' : ` [${verify.reason}]`;
      console.log(
        `  [${completed}/${scenarios.length}] ${icon} ${scenario.id} ` +
          `(${(buffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`
      );

      if (verify.pass) {
        passed.push(artifactName);
      } else {
        failed.push(artifactName);
      }

      return {
        scenarioId: scenario.id,
        status: verify.pass ? 'pass' : 'fail',
        reason: verify.reason || 'OK',
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(
        `  [${completed}/${scenarios.length}] ✗ ${scenario.id}: ${err.message} [${elapsed}s]`
      );
      failed.push(artifactName);
      return {
        scenarioId: scenario.id,
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
  console.error('[gallery-nooverlay] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
