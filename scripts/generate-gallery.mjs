#!/usr/bin/env node

/**
 * Gallery Image Generator (Non-Overlay Items)
 *
 * Generates preview images for non-overlay gallery items using Puppeteer.
 * Static items are saved as PNG.
 *
 * Overlay gallery images are sourced from scan-validated Tier A artifacts
 * via scripts/update-gallery-from-scan-matrix.mjs instead.
 *
 * Run with: node scripts/generate-gallery.mjs
 *
 * Prerequisites:
 * - npm install puppeteer gifenc sharp
 * - Dev server running (default port 5173, override with GALLERY_PORT env var)
 */

import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const GALLERY_DIR = path.join(PROJECT_ROOT, 'public', 'gallery');

// Configuration
const DEV_SERVER_URL = `http://localhost:${process.env.GALLERY_PORT || '5173'}`;
const IMAGE_SIZE = 200; // Half size for faster loading
const VIEWPORT = { width: 800, height: 600 };
const STATIC_CAPTURE_DELAY = 500; // Time to wait for static QR to render after canvas ready
const PARALLEL_STATIC = 6; // Conservative parallelism to avoid thermal throttling

// ============================================
// NON-OVERLAY GALLERY ITEMS
// Overlay items come from Tier A scan-validated artifacts
// ============================================

const BASE_DATA = 'https://anqr.link';

function generateGalleryItems() {
  const items = [];

  // ========== PLAIN QR CODES (6 items) ==========
  items.push(
    {
      id: 'plain-basic',
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    },
    {
      id: 'plain-v6',
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 6,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    },
    {
      id: 'plain-v9',
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 9,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    },
    {
      id: 'plain-v12',
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 12,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    },
    {
      id: 'plain-ecc-l',
      params: {
        data: BASE_DATA,
        ec: 'L',
        v: 0,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    },
    {
      id: 'plain-ecc-q',
      params: {
        data: BASE_DATA,
        ec: 'Q',
        v: 0,
        style: 'square',
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    }
  );

  // ========== CONTENT TYPES (6 items) ==========
  items.push(
    {
      id: 'content-vcard',
      params: {
        data: 'BEGIN:VCARD\\nVERSION:3.0\\nFN:John Doe\\nORG:ANQR\\nEND:VCARD',
        ec: 'H',
        v: 0,
        style: 'rounded',
        finder: 'rounded',
        fg: '1a365d',
        bg: 'ebf8ff',
      },
    },
    {
      id: 'content-wifi',
      params: {
        data: 'WIFI:T:WPA;S:MyNetwork;P:password123;;',
        ec: 'H',
        v: 0,
        style: 'dots',
        finder: 'circle',
        fg: '1b4332',
        bg: 'd8f3dc',
      },
    },
    {
      id: 'content-email',
      params: {
        data: 'mailto:email@anqr.link?subject=Hello',
        ec: 'H',
        v: 0,
        style: 'square',
        finder: 'square',
        fg: 'e85d04',
        bg: 'ffe8d6',
      },
    },
    {
      id: 'content-sms',
      params: {
        data: 'sms:+1234567890?body=Hello%20from%20ANQR',
        ec: 'H',
        v: 0,
        style: 'diamond',
        finder: 'rounded',
        fg: '006d77',
        bg: 'e0f4f5',
      },
    },
    {
      id: 'content-geo',
      params: {
        data: 'geo:37.7749,-122.4194?q=San+Francisco',
        ec: 'H',
        v: 0,
        style: 'connected',
        finder: 'square',
        fg: '7f5539',
        bg: 'ffe8cc',
      },
    },
    {
      id: 'content-event',
      params: {
        data: 'BEGIN:VEVENT\\nSUMMARY:Meeting\\nDTSTART:20240101T100000\\nEND:VEVENT',
        ec: 'H',
        v: 0,
        style: 'rounded',
        finder: 'circle',
        fg: '4a0080',
        bg: 'f5e6ff',
      },
    }
  );

  // ========== MODULE & FINDER STYLES ==========
  const moduleStyles = ['square', 'rounded', 'dots', 'diamond', 'connected'];
  const finderStyles = ['square', 'rounded', 'circle'];

  for (const style of moduleStyles) {
    items.push({
      id: `style-${style}`,
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style,
        finder: 'square',
        fg: '000000',
        bg: 'ffffff',
      },
    });
  }

  for (const finder of finderStyles) {
    items.push({
      id: `finder-${finder}`,
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style: 'square',
        finder,
        fg: '000000',
        bg: 'ffffff',
      },
    });
  }

  // Style + finder combinations
  const styleCombos = [
    { style: 'rounded', finder: 'rounded' },
    { style: 'dots', finder: 'circle' },
    { style: 'diamond', finder: 'rounded' },
    { style: 'connected', finder: 'square' },
  ];
  for (const combo of styleCombos) {
    items.push({
      id: `combo-${combo.style}-${combo.finder}`,
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style: combo.style,
        finder: combo.finder,
        fg: '000000',
        bg: 'ffffff',
      },
    });
  }

  // ========== COLORS ==========
  const colorSchemes = [
    { name: 'midnight', fg: '1a1a2e', bg: 'eef1ff' },
    { name: 'forest', fg: '1b4332', bg: 'd8f3dc' },
    { name: 'ocean', fg: '023e8a', bg: 'caf0f8' },
    { name: 'sunset', fg: 'bf0603', bg: 'fff3b0' },
    { name: 'royal', fg: '4a0080', bg: 'f5e6ff' },
    { name: 'coral', fg: 'e85d04', bg: 'ffe8d6' },
    { name: 'slate', fg: '343a40', bg: 'e9ecef' },
    { name: 'crimson', fg: '9d0208', bg: 'ffccd5' },
    { name: 'teal', fg: '006d77', bg: 'e0f4f5' },
    { name: 'gold', fg: '7f5539', bg: 'ffe8cc' },
    { name: 'inverted', fg: 'ffffff', bg: '000000' },
    { name: 'navy', fg: '001d3d', bg: 'a2d2ff' },
  ];

  for (const color of colorSchemes) {
    items.push({
      id: `color-${color.name}`,
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style: 'square',
        finder: 'square',
        fg: color.fg,
        bg: color.bg,
      },
    });
  }

  // Colors with dots (6 items to make 18 total)
  for (const color of colorSchemes.slice(0, 6)) {
    items.push({
      id: `color-${color.name}-dots`,
      params: {
        data: BASE_DATA,
        ec: 'H',
        v: 0,
        style: 'dots',
        finder: 'circle',
        fg: color.fg,
        bg: color.bg,
      },
    });
  }

  return items;
}

// Build URL from params
function normalizedParamEntries(params) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));
}

function buildUrl(params) {
  const url = new URL(DEV_SERVER_URL);
  for (const [key, value] of normalizedParamEntries(params)) {
    url.searchParams.set(key, String(value));
  }
  return url.toString();
}

function buildDeterministicQuery(params) {
  return normalizedParamEntries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

function stableParamHash(params) {
  const normalized = JSON.stringify(normalizedParamEntries(params));
  return createHash('sha256').update(normalized).digest('hex');
}

// Wait for canvas to have non-empty content
async function waitForCanvasReady(page, timeout = 30000) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const hasContent = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      // Check if canvas has non-transparent content
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) return true;
      }
      return false;
    });
    if (hasContent) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

// Capture a single QR code as PNG
async function captureQR(page, item) {
  const url = buildUrl(item.params);

  await page.goto(url, { waitUntil: 'networkidle0', timeout: 300000 });
  await page.waitForSelector('canvas', { timeout: 150000 });

  // Wait for canvas to have content
  await waitForCanvasReady(page);

  // For static items, add small delay for rendering to complete
  await new Promise((resolve) => setTimeout(resolve, STATIC_CAPTURE_DELAY));

  // Capture as PNG
  const canvasData = await page.evaluate((size) => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return null;

    // Create scaled canvas for output
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = size;
    outputCanvas.height = size;
    const ctx = outputCanvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, size, size);

    return outputCanvas.toDataURL('image/png');
  }, IMAGE_SIZE);

  if (!canvasData) {
    throw new Error('Could not find canvas element');
  }

  const base64Data = canvasData.replace(/^data:image\/png;base64,/, '');
  return { buffer: Buffer.from(base64Data, 'base64') };
}

// Process a single item with its own page
async function processItem(browser, item) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  try {
    const result = await captureQR(page, item);
    const filepath = path.join(GALLERY_DIR, `${item.id}.png`);
    await fs.writeFile(filepath, result.buffer);
    const contentSha256 = createHash('sha256').update(result.buffer).digest('hex');
    console.log(`  [OK] ${item.id}`);
    return {
      id: item.id,
      success: true,
      isGif: false,
      outputFile: `${item.id}.png`,
      outputBytes: result.buffer.length,
      outputSha256: contentSha256,
    };
  } catch (error) {
    console.error(`  [FAIL] ${item.id}: ${error.message}`);
    return { id: item.id, success: false, error: error.message };
  } finally {
    await page.close();
  }
}

// Process items in parallel batches with specified parallelism
async function processItemsBatch(browser, items, startIdx, parallelism) {
  const batchSize = Math.min(parallelism, items.length - startIdx);
  const batchItems = items.slice(startIdx, startIdx + batchSize);

  // Process all items in the batch truly in parallel
  const results = await Promise.all(batchItems.map((item) => processItem(browser, item)));

  return results;
}

// Process a queue of items with specified parallelism
async function processQueue(browser, items, parallelism, label, startTime) {
  const results = [];

  for (let i = 0; i < items.length; i += parallelism) {
    const batchResults = await processItemsBatch(browser, items, i, parallelism);
    results.push(...batchResults);

    // Progress
    const progress = Math.min(i + parallelism, items.length);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    console.log(
      `  [${label}] Progress: ${progress}/${items.length} (${Math.round((progress / items.length) * 100)}%) - ${elapsed}s elapsed`
    );
  }

  return results;
}

// Main function
async function main() {
  console.log('\n=== ANQR Gallery Generator (Non-Overlay Items) ===\n');
  console.log('Note: Overlay items come from Tier A scan-validated artifacts.');
  console.log('Run scripts/update-gallery-from-scan-matrix.mjs to copy those.\n');

  // Generate items
  const items = generateGalleryItems().sort((a, b) => a.id.localeCompare(b.id));

  console.log(`Generated ${items.length} non-overlay gallery items\n`);

  // Ensure gallery directory exists (don't clean - preserve Tier A artifacts)
  await fs.mkdir(GALLERY_DIR, { recursive: true });
  console.log(`Using ${GALLERY_DIR}\n`);

  // Launch browser
  console.log('Launching browser...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const startTime = Date.now();

  console.log(
    `Capturing ${items.length} static QR codes (${IMAGE_SIZE}x${IMAGE_SIZE}px, ${PARALLEL_STATIC} parallel)...\n`
  );
  const results = await processQueue(browser, items, PARALLEL_STATIC, 'STATIC', startTime);

  await browser.close();

  // Summary
  const totalTime = Math.round((Date.now() - startTime) / 1000);
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Successfully captured: ${successful}/${items.length}`);
  console.log(`Total time: ${totalTime}s`);

  if (failed.length > 0) {
    console.log(`\nFailed (${failed.length}):`);
    for (const f of failed) {
      console.log(`   - ${f.id}: ${f.error}`);
    }
  }

  // Count Tier A items already in gallery
  const allGalleryFiles = await fs.readdir(GALLERY_DIR);
  const tierACount = allGalleryFiles.filter(
    (f) =>
      (f.endsWith('.png') || f.endsWith('.gif')) && !items.some((item) => `${item.id}.png` === f)
  ).length;

  // Save manifest covering ALL gallery items (Puppeteer + Tier A)
  const resultById = new Map(results.map((r) => [r.id, r]));
  const manifest = {
    manifestVersion: '2.0',
    permutationSpecVersion: '1.0',
    generated: new Date().toISOString(),
    source: {
      script: 'scripts/generate-gallery.mjs',
      devServer: DEV_SERVER_URL,
      args: process.argv.slice(2),
    },
    generatorConfig: {
      imageSize: IMAGE_SIZE,
      staticCaptureDelayMs: STATIC_CAPTURE_DELAY,
      parallelStatic: PARALLEL_STATIC,
    },
    count: items.length + tierACount,
    puppeteerGenerated: items.length,
    tierAValidated: tierACount,
    successful,
    failed: failed.length,
    items: items.map((item) => {
      const run = resultById.get(item.id);
      const query = buildDeterministicQuery(item.params);
      return {
        id: item.id,
        isAnimated: false,
        params: Object.fromEntries(normalizedParamEntries(item.params)),
        query,
        paramSignatureSha256: stableParamHash(item.params),
        output: run
          ? {
              success: !!run.success,
              file: run.outputFile,
              bytes: run.outputBytes,
              sha256: run.outputSha256,
              error: run.error ?? null,
            }
          : null,
      };
    }),
  };

  await fs.writeFile(path.join(GALLERY_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`\nSaved manifest to ${path.join(GALLERY_DIR, 'manifest.json')}`);
  console.log(`  Puppeteer-generated: ${items.length}`);
  console.log(`  Tier A validated: ${tierACount}`);
  console.log(`  Total gallery items: ${items.length + tierACount}`);
  console.log('\nDone!\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
