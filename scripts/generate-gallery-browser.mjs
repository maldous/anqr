#!/usr/bin/env node

/**
 * Gallery Browser Generator (Playwright-based)
 *
 * Renders all 1000 gallery permutation configs by launching a headless
 * Chromium browser, navigating to the running dev server with URL params,
 * and capturing the rendered output.
 *
 * Saves artifacts to reports/gallery-artifacts/browser/
 * with passed.txt/failed.txt/report.json for inspection.
 *
 * Environment variables:
 *   GALLERY_PORT           Dev server port (default: 5173)
 *   GALLERY_CONCURRENCY    Parallel browser contexts (default: 3)
 *   GALLERY_BROWSER_CAPTURE_MODE  api (default) or preview
 *   GALLERY_CATEGORY       Filter by category: nooverlay/overlay/artwork (default: all)
 *   GALLERY_IDS            Comma-separated config IDs to run (default: all)
 *   GALLERY_SHARD          Shard selector (e.g. 2/8 or 2-of-8)
 *   GALLERY_SHARD_INDEX    0-based shard index (used with GALLERY_SHARD_TOTAL)
 *   GALLERY_SHARD_TOTAL    Total shard count
 *
 * Prerequisites:
 *   - npx playwright install chromium
 *   - Dev server running on GALLERY_PORT (only for preview capture mode)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import {
  createGifEncoder,
  decodeGif,
  indexGifPixels,
  isGifEncodingAvailable,
  quantizeGifPalette,
} from '../src/modules/animation';
import { withGifEncodeLock } from '../src/modules/animation/gif-lock.ts';
import { decodeQR } from '../src/modules/qr-decoder/index.ts';
import {
  generateAllScenarios,
  buildUrlParams,
  scenarioFilename,
} from './lib/gallery-permutations.mjs';
import {
  resolveGalleryShard,
  applyGalleryShard,
  shardOutputFilename,
} from './lib/gallery-sharding.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const REPORTS_DIR = path.join(ROOT, 'reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'gallery-artifacts');
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'browser');
const LOCAL_HANDLER_URL = 'http://localhost/.netlify/functions/qr';

const PORT = process.env.GALLERY_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '3', 10));
const PAGE_TIMEOUT = 30_000;
const CANVAS_SELECTOR =
  '[data-testid="qr-preview"] canvas, [data-testid="preview-canvas"], canvas[role="img"]';
const SKIP_SERVER_CHECK = process.env.GALLERY_SKIP_SERVER_CHECK === '1';
const CAPTURE_MODE = (process.env.GALLERY_BROWSER_CAPTURE_MODE || 'api').toLowerCase();
const SHARD = resolveGalleryShard(process.env);
const FORCE_STRICT_OVERLAY = process.env.GALLERY_STRICT_OVERLAY === '1';
const BROWSER_GIF_CAPTURE_FRAMES = Math.max(
  2,
  Number.parseInt(process.env.GALLERY_BROWSER_GIF_FRAMES || '24', 10),
);
const BROWSER_GIF_CAPTURE_DELAY_MS = Math.max(
  20,
  Number.parseInt(process.env.GALLERY_BROWSER_GIF_DELAY_MS || '100', 10),
);
const ARTIFACT_EXTS = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg'];

// Must match WelcomeModal.tsx constants
const WELCOME_STORAGE_KEY = 'anqr-welcome-seen';
const WELCOME_VERSION = '2026.02.01';
let qrHandlerCached = null;

// ============================================
// Scan verification
// ============================================

async function verifyImage(buffer, expectedPrefix, expectAnimated = false) {
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
    if (expectAnimated) {
      try {
        const arrayBuffer = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        );
        const decoded = decodeGif(arrayBuffer);
        if (!decoded.frames || decoded.frames.length < 2) {
          return { pass: false, reason: 'ANIMATION_MISSING' };
        }
      } catch (animErr) {
        return {
          pass: false,
          reason: 'ANIMATION_PARSE_ERROR',
          message: animErr instanceof Error ? animErr.message : String(animErr),
        };
      }
    }
    return { pass: true, decoded: result.data };
  } catch (err) {
    return { pass: false, reason: 'VERIFY_ERROR', message: err.message };
  }
}

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const GIF87A_SIGNATURE = Buffer.from('GIF87a');
const GIF89A_SIGNATURE = Buffer.from('GIF89a');

function hasImageMagic(buffer, ext) {
  const normalized = String(ext || '').toLowerCase().replace(/^\./, '');
  if (normalized === 'gif') {
    return (
      buffer.length >= 6 &&
      (buffer.subarray(0, 6).equals(GIF87A_SIGNATURE) ||
        buffer.subarray(0, 6).equals(GIF89A_SIGNATURE))
    );
  }
  if (normalized === 'png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(PNG_SIGNATURE);
  }
  if (normalized === 'webp') {
    return (
      buffer.length >= 12 &&
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    );
  }
  if (normalized === 'jpg' || normalized === 'jpeg') {
    return buffer.length >= 2 && buffer[0] === 0xff && buffer[1] === 0xd8;
  }
  if (normalized === 'svg') {
    const header = buffer.subarray(0, Math.min(buffer.length, 256)).toString('utf8').trimStart();
    return header.startsWith('<svg') || header.startsWith('<?xml');
  }
  return true;
}

function validateArtifactMagic(buffer, ext, expectAnimated = false) {
  if (expectAnimated && !hasImageMagic(buffer, 'gif')) {
    return { pass: false, reason: 'ANIMATION_MAGIC_MISMATCH' };
  }
  if (!hasImageMagic(buffer, ext)) {
    return { pass: false, reason: `MAGIC_BYTES_MISMATCH_${String(ext).toUpperCase()}` };
  }
  return { pass: true };
}

async function finalizeTempArtifact(tempArtifactPath, artifactPath, keepArtifact) {
  try {
    if (keepArtifact) {
      await fs.rename(tempArtifactPath, artifactPath);
    } else {
      await fs.unlink(tempArtifactPath).catch(() => {});
    }
  } catch (err) {
    await fs.unlink(tempArtifactPath).catch(() => {});
    throw err;
  }
}

function extFromContentType(contentType, fallback = 'png') {
  const type = String(contentType || '').toLowerCase();
  if (type.includes('image/gif')) return 'gif';
  if (type.includes('image/webp')) return 'webp';
  if (type.includes('image/jpeg')) return 'jpg';
  if (type.includes('image/svg+xml')) return 'svg';
  if (type.includes('image/png')) return 'png';
  return fallback;
}

async function getQrHandler() {
  if (qrHandlerCached) return qrHandlerCached;
  if (!process.env.NETLIFY_DEV) {
    process.env.NETLIFY_DEV = '1';
  }
  if (!process.env.ANQR_LOCAL_OVERLAY_ROOT) {
    process.env.ANQR_LOCAL_OVERLAY_ROOT = PUBLIC_DIR;
  }
  const mod = await import('../netlify/functions/qr.ts');
  qrHandlerCached = mod.default;
  return qrHandlerCached;
}

function resolvePublicFileFromRequestPath(requestPath) {
  const decoded = decodeURIComponent(requestPath || '/');
  const safePath = decoded.startsWith('/') ? decoded : `/${decoded}`;
  const resolved = path.resolve(PUBLIC_DIR, `.${safePath}`);
  const publicRoot = path.resolve(PUBLIC_DIR);
  if (!resolved.startsWith(`${publicRoot}${path.sep}`) && resolved !== publicRoot) {
    return null;
  }
  return resolved;
}

function toLocalFixtureFileUrl(imgPath) {
  const resolved = resolvePublicFileFromRequestPath(imgPath);
  if (!resolved) return null;
  return pathToFileURL(resolved).href;
}

async function buildLocalRequest(config) {
  const params = new URLSearchParams(buildUrlParams(config));
  params.set('_fullRender', '1');
  if (FORCE_STRICT_OVERLAY) {
    params.set('_strictOverlay', '1');
  }

  const headers = new Headers({
    'X-ANQR-Skip-Cache': '1',
    'User-Agent': 'ANQR-Gallery-Browser/1.0',
  });

  if (params.has('img')) {
    const imgValue = params.get('img');
    if (imgValue?.startsWith('/')) {
      const localFileUrl = toLocalFixtureFileUrl(imgValue);
      if (!localFileUrl) {
        throw new Error(`Local fixture path is outside public/: ${imgValue}`);
      }
      params.set('img', localFileUrl);
    }
  }

  const url = `${LOCAL_HANDLER_URL}?${params.toString()}`;
  return new Request(url, { method: 'GET', headers });
}

async function removeScenarioArtifacts(outputDir, config) {
  const baseName = scenarioFilename(config).replace(/\.[^.]+$/, '');
  await Promise.all(
    ARTIFACT_EXTS.map(async (ext) => {
      const artifactPath = path.join(outputDir, `${baseName}.${ext}`);
      try {
        await fs.unlink(artifactPath);
      } catch (err) {
        if (err?.code !== 'ENOENT') {
          throw err;
        }
      }
    }),
  );
}

async function captureCanvasBuffer(page, mimeType = 'image/png') {
  const dataUrl = await page.$eval(
    CANVAS_SELECTOR,
    (canvasEl, requestedMimeType) => {
      if (!(canvasEl instanceof HTMLCanvasElement)) {
        throw new Error('Selected element is not a canvas');
      }
      return canvasEl.toDataURL(requestedMimeType);
    },
    mimeType,
  );
  const match = dataUrl.match(/^data:([^;]+);base64,(.*)$/);
  if (!match) {
    throw new Error('Invalid canvas data URL');
  }
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], 'base64'),
  };
}

function parseIntParam(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveTargetDimensions(config) {
  const size = parseIntParam(config.params.size, 400);
  return {
    width: parseIntParam(config.params.w, size),
    height: parseIntParam(config.params.h, size),
  };
}

function drawImageToSizedCanvas(img, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function parseHexColor(input, fallback = 'ffffff') {
  const normalized = String(input ?? '').trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(normalized)) {
    return normalized
      .split('')
      .map((ch) => ch + ch)
      .join('');
  }
  if (/^[0-9a-f]{6}$/.test(normalized)) {
    return normalized;
  }
  return fallback;
}

function parseGifDisposalCode(value) {
  const normalized = String(value || 'restore_bg').toLowerCase();
  if (normalized === 'none') return 0;
  if (normalized === 'keep') return 1;
  if (normalized === 'restore_previous') return 3;
  return 2;
}

function hasPaletteColor(palette, predicate) {
  return palette.some((entry) => {
    const [r, g, b] = entry;
    return predicate(r ?? 0, g ?? 0, b ?? 0);
  });
}

function ensureGifPaletteAnchors(palette, maxSize) {
  const out = [...palette];
  const hasNearBlack = hasPaletteColor(out, (r, g, b) => r <= 24 && g <= 24 && b <= 24);
  const hasNearWhite = hasPaletteColor(out, (r, g, b) => r >= 231 && g >= 231 && b >= 231);

  if (!hasNearBlack) out.push([0, 0, 0]);
  if (!hasNearWhite) out.push([255, 255, 255]);

  while (out.length > maxSize) {
    const dropIdx = Math.floor(out.length / 2);
    out.splice(dropIdx, 1);
  }

  return out;
}

function buildGlobalPaletteFromFrames(frameDataList, width, height, paletteSize) {
  const frameCount = frameDataList.length;
  const sampleTarget = Math.min(frameCount, 12);
  const sampleIdx = new Set([0, frameCount - 1]);
  for (let i = 1; i < sampleTarget - 1; i++) {
    sampleIdx.add(Math.round((i * (frameCount - 1)) / (sampleTarget - 1)));
  }
  const orderedIdx = Array.from(sampleIdx).sort((a, b) => a - b);
  const samplePixels = new Uint8ClampedArray(orderedIdx.length * width * height * 4);
  let offset = 0;
  for (const idx of orderedIdx) {
    const data = frameDataList[idx];
    samplePixels.set(data, offset);
    offset += data.length;
  }
  const basePalette = quantizeGifPalette(samplePixels, paletteSize);
  return ensureGifPaletteAnchors(basePalette, paletteSize);
}

async function encodeAnimatedGifFromCanvases(
  frames,
  frameDelayMs = 100,
  colors = 256,
  disposal = 1,
  frameDelaysMs = [],
) {
  if (!isGifEncodingAvailable()) {
    throw new Error('GIF encoder is unavailable in this runtime');
  }
  if (!frames.length) {
    throw new Error('No frames to encode');
  }

  return withGifEncodeLock(() => {
    const width = frames[0].width;
    const height = frames[0].height;
    const gif = createGifEncoder();
    const paletteSize = Math.min(256, Math.max(2, colors));
    const defaultDelayMs = Math.max(20, frameDelayMs);
    const frameDataList = frames.map((frame) => {
      const ctx = frame.getContext('2d');
      return new Uint8ClampedArray(ctx.getImageData(0, 0, width, height).data);
    });
    const globalPalette = buildGlobalPaletteFromFrames(frameDataList, width, height, paletteSize);

    for (let i = 0; i < frames.length; i++) {
      const index = indexGifPixels(frameDataList[i], globalPalette);
      const safeIndex = index.slice();
      const requestedDelay = Number(frameDelaysMs[i]);
      const delayMs =
        Number.isFinite(requestedDelay) && requestedDelay > 0
          ? Math.max(20, requestedDelay)
          : defaultDelayMs;
      const options = {
        palette: globalPalette,
        delay: delayMs,
        dispose: disposal,
        ...(i === 0 ? { repeat: 0 } : {}),
      };
      gif.writeFrame(safeIndex, width, height, options);
    }

    gif.finish();
    return Buffer.from(gif.bytes());
  });
}

async function captureAnimatedGifFromCanvas(
  page,
  frameCount,
  frameDelayMs,
  targetWidth,
  targetHeight,
  backgroundHex,
  gifColors,
  gifDisposalCode,
) {
  const frames = [];
  for (let i = 0; i < frameCount; i++) {
    const { buffer } = await captureCanvasBuffer(page, 'image/png');
    const img = await loadImage(buffer);
    const frameCanvas = drawImageToSizedCanvas(img, targetWidth, targetHeight);
    if (backgroundHex) {
      const composed = createCanvas(targetWidth, targetHeight);
      const composedCtx = composed.getContext('2d');
      composedCtx.fillStyle = `#${backgroundHex}`;
      composedCtx.fillRect(0, 0, targetWidth, targetHeight);
      composedCtx.drawImage(frameCanvas, 0, 0);
      frames.push(composed);
    } else {
      frames.push(frameCanvas);
    }
    if (i < frameCount - 1) {
      await page.waitForTimeout(frameDelayMs);
    }
  }
  return encodeAnimatedGifFromCanvases(frames, frameDelayMs, gifColors, gifDisposalCode);
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
  } catch (err) {
    console.error('[gallery-browser] server check failed:', err?.message || err);
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
  console.log(`Mode:        ${CAPTURE_MODE}`);
  console.log(`Server:      ${BASE_URL}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Shard:       ${SHARD.label}`);
  console.log(`Timeout:     ${PAGE_TIMEOUT / 1000}s per page\n`);

  // Check server only for preview-capture mode.
  if (CAPTURE_MODE === 'preview' && !SKIP_SERVER_CHECK) {
    const serverUp = await checkServerRunning();
    if (!serverUp) {
      console.error(`❌ Dev server not running at ${BASE_URL}`);
      console.error('   Start the dev server first: npm run dev');
      process.exitCode = 1;
      return;
    }
    console.log(`✅ Dev server is running at ${BASE_URL}\n`);
  } else if (CAPTURE_MODE === 'preview') {
    console.log(`⚠️  Skipping server precheck (GALLERY_SKIP_SERVER_CHECK=1): ${BASE_URL}\n`);
  } else {
    console.log('⚠️  Using deterministic local API handler capture for parity\n');
  }

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
  const preShardCount = configs.length;
  configs = applyGalleryShard(configs, SHARD);

  console.log(`Configs: ${configs.length}${SHARD.isSharded ? ` (shard from ${preShardCount})` : ''}\n`);

  // Prepare artifact directory
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const passedPath = path.join(OUTPUT_DIR, shardOutputFilename('passed.txt', SHARD));
  const failedPath = path.join(OUTPUT_DIR, shardOutputFilename('failed.txt', SHARD));
  const reportPath = path.join(OUTPUT_DIR, shardOutputFilename('report.json', SHARD));

  let browser = null;
  let qrHandler = null;
  if (CAPTURE_MODE === 'preview') {
    browser = await chromium.launch({
      chromiumSandbox: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
  } else {
    qrHandler = await getQrHandler();
  }

  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  const tasks = configs.map((config) => async () => {
    const start = Date.now();
    const fallbackFilename = scenarioFilename(config);
    let filename = fallbackFilename;
    let artifactPath = path.join(OUTPUT_DIR, filename);
    const expectedPayload = config.params.data;
    const ext = path.extname(filename).toLowerCase();
    const { width: targetWidth, height: targetHeight } = resolveTargetDimensions(config);
    const animFrameCount = Math.min(
      60,
      Math.max(2, parseIntParam(config.params.animFrames, BROWSER_GIF_CAPTURE_FRAMES)),
    );
    const animDelayMs = Math.min(
      1000,
      Math.max(20, parseIntParam(config.params.animSpeed ?? config.params.speed, BROWSER_GIF_CAPTURE_DELAY_MS)),
    );
    const gifMaxFps = parseIntParam(config.params.gifMaxFps, 0);
    const minDelayFromGifMaxFps = gifMaxFps > 0 ? Math.ceil(1000 / gifMaxFps) : 0;
    const resolvedAnimDelayMs = Math.max(animDelayMs, minDelayFromGifMaxFps);
    const gifColors = Math.min(
      256,
      Math.max(2, parseIntParam(config.params.gifColors ?? config.params.gifPal, 256)),
    );
    const gifDisposalCode = parseGifDisposalCode(config.params.gifDisp);
    const backgroundHex =
      String(config.params.transparent ?? '0') === '1'
        ? null
        : parseHexColor(config.params.bg, 'ffffff');

    let context;
    let page;
    let tempArtifactPath = null;
    try {
      await removeScenarioArtifacts(OUTPUT_DIR, config);
      let artifactBuffer;
      let artifactContentType = 'image/png';
      if (CAPTURE_MODE === 'api') {
        const request = await buildLocalRequest(config);
        const response = await qrHandler(request);
        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
        }
        artifactContentType = response.headers.get('Content-Type') || 'image/png';
        const resolvedExt = extFromContentType(artifactContentType, config.isAnimated ? 'gif' : 'png');
        const baseName = fallbackFilename.replace(/\.[^.]+$/, '');
        filename = `${baseName}.${resolvedExt}`;
        artifactPath = path.join(OUTPUT_DIR, filename);
        artifactBuffer = Buffer.from(await response.arrayBuffer());
      } else {
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
            try {
              const ctx = canvas.getContext('2d');
              const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
              for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0) return true;
              }
            } catch {
              return canvas.width > 0 && canvas.height > 0;
            }
            return false;
          },
          CANVAS_SELECTOR,
          { timeout: PAGE_TIMEOUT },
        );

        await page.waitForTimeout(300);

        if (ext === '.gif') {
          artifactBuffer = await captureAnimatedGifFromCanvas(
            page,
            animFrameCount,
            resolvedAnimDelayMs,
            targetWidth,
            targetHeight,
            backgroundHex,
            gifColors,
            gifDisposalCode,
          );
          artifactContentType = 'image/gif';
        } else {
          const { buffer, mimeType } = await captureCanvasBuffer(page, 'image/png');
          const img = await loadImage(buffer);
          const sizedCanvas = drawImageToSizedCanvas(img, targetWidth, targetHeight);
          artifactBuffer = sizedCanvas.toBuffer('image/png');
          artifactContentType = mimeType || 'image/png';
        }
      }

      const resolvedExt = path.extname(filename).replace(/^\./, '').toLowerCase();
      const magicCheck = validateArtifactMagic(artifactBuffer, resolvedExt, config.isAnimated);
      const verify = magicCheck.pass
        ? await verifyImage(artifactBuffer, expectedPayload, config.isAnimated)
        : magicCheck;

      tempArtifactPath = `${artifactPath}.tmp-${process.pid}-${Date.now()}`;
      await fs.writeFile(tempArtifactPath, artifactBuffer);
      await finalizeTempArtifact(tempArtifactPath, artifactPath, verify.pass);
      tempArtifactPath = null;

      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const suffix = verify.pass ? '' : ` [${verify.reason}]`;
      console.log(
        `  [${completed}/${configs.length}] ${icon} ${config.id} ` +
          `(${(artifactBuffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`,
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
        filename,
        contentType: artifactContentType,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(`  [${completed}/${configs.length}] ✗ ${config.id}: ${err.message} [${elapsed}s]`);
      failed.push(fallbackFilename);
      return {
        id: config.id,
        category: config.category,
        status: 'fail',
        reason: 'BROWSER_ERROR',
        message: err.message,
        durationMs: Date.now() - start,
      };
    } finally {
      if (tempArtifactPath) {
        await fs.unlink(tempArtifactPath).catch(() => {});
      }
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
    if (browser) {
      await browser.close();
    }
  }

  // Write passed.txt and failed.txt
  await fs.writeFile(passedPath, passed.join('\n') + (passed.length ? '\n' : ''));
  await fs.writeFile(failedPath, failed.join('\n') + (failed.length ? '\n' : ''));

  // Write JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'browser',
    serverUrl: BASE_URL,
    concurrency: CONCURRENCY,
    shard: {
      index: SHARD.index,
      total: SHARD.total,
      label: SHARD.label,
      isSharded: SHARD.isSharded,
    },
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
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Print summary
  const totalSec = Math.round((Date.now() - globalStart) / 1000);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${results.length} runs in ${totalSec}s`);
  console.log(`Pass:  ${passed.length} (${Math.round((passed.length * 100) / (results.length || 1))}%)`);
  console.log(`Fail:  ${failed.length}`);
  console.log(`\nArtifacts: ${OUTPUT_DIR}/`);
  console.log(`Passed:    ${passedPath}`);
  console.log(`Failed:    ${failedPath}`);
  console.log(`Report:    ${reportPath}\n`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[gallery-browser] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
