#!/usr/bin/env node

/**
 * Gallery Local Generator (in-process Netlify handler)
 *
 * Renders gallery configs locally by calling netlify/functions/qr.ts directly
 * with Request objects. This keeps local output behavior aligned with the
 * API renderer while avoiding network calls.
 *
 * Artifacts: reports/gallery-artifacts/local/
 * Outputs: passed.txt, failed.txt, report.json
 *
 * Environment variables:
 *   GALLERY_CONCURRENCY    Parallel render count (default: auto host-aware)
 *   GALLERY_CATEGORY       Filter by category: nooverlay/overlay/artwork (default: all)
 *   GALLERY_IDS            Comma-separated config IDs to run (default: all)
 *   GALLERY_SHARD          Shard selector (e.g. 2/8 or 2-of-8)
 *   GALLERY_SHARD_INDEX    0-based shard index (used with GALLERY_SHARD_TOTAL)
 *   GALLERY_SHARD_TOTAL    Total shard count
 */

// ============================================
// Polyfills (must be before src/netlify imports)
// ============================================

if (!process.env.ANQR_LOG_LEVEL) {
  process.env.ANQR_LOG_LEVEL = 'error';
}

if (typeof globalThis.import_meta_env === 'undefined') {
  Object.defineProperty(import.meta, 'env', {
    get() {
      return { DEV: false, PROD: true, MODE: 'production' };
    },
  });
}

import { ImageData as NapiImageData } from '@napi-rs/canvas';
if (typeof globalThis.ImageData === 'undefined') {
  globalThis.ImageData = NapiImageData;
}

// ============================================
// Imports
// ============================================

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { decodeGif } from '../src/modules/animation/index.ts';
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

// Several rendering branches in shared code perform instanceof checks against
// browser canvas globals. Mirror those globals in Node to avoid runtime mismatches.
if (typeof globalThis.HTMLCanvasElement === 'undefined') {
  globalThis.HTMLCanvasElement = createCanvas(1, 1).constructor;
}
if (typeof globalThis.OffscreenCanvas === 'undefined') {
  globalThis.OffscreenCanvas = globalThis.HTMLCanvasElement;
}

// ============================================
// Constants
// ============================================

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const REPORTS_DIR = path.join(ROOT, 'reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'gallery-artifacts');
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'local');

const AUTO_LOCAL_CONCURRENCY = Math.max(
  4,
  Math.min(
    24,
    (typeof os.availableParallelism === 'function' ? os.availableParallelism() : os.cpus().length) -
      1
  )
);
const CONCURRENCY = Math.max(
  1,
  Number.parseInt(process.env.GALLERY_CONCURRENCY || String(AUTO_LOCAL_CONCURRENCY), 10)
);
const SCENARIO_TIMEOUT_MS = Math.max(
  30_000,
  Number.parseInt(process.env.GALLERY_SCENARIO_TIMEOUT_MS || '240000', 10)
);
const SHARD = resolveGalleryShard(process.env);
const FORCE_STRICT_OVERLAY = process.env.GALLERY_STRICT_OVERLAY === '1';
const LOCAL_HANDLER_URL = 'http://localhost/.netlify/functions/qr';
const ARTIFACT_EXTS = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg'];
let qrHandlerCached = null;

// ============================================
// Helpers
// ============================================

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

  // Allow dev-only local overlay file loading in the server handler.
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
  if (!resolved) {
    return null;
  }
  return pathToFileURL(resolved).href;
}

async function buildLocalRequest(config) {
  const params = new URLSearchParams(buildUrlParams(config));

  // Force full render for overlays/artwork so local fixtures are actually processed.
  params.set('_fullRender', '1');
  // Optional fail-fast mode for overlay fetch/decode issues.
  if (FORCE_STRICT_OVERLAY) {
    params.set('_strictOverlay', '1');
  }

  // Skip blob cache reads/writes (not configured in local dev/test env).
  const headers = new Headers({
    'X-ANQR-Skip-Cache': '1',
    'User-Agent': 'ANQR-Gallery-Local/1.0',
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
          buffer.byteOffset + buffer.byteLength
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
  const normalized = String(ext || '')
    .toLowerCase()
    .replace(/^\./, '');
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
    })
  );
}

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

async function withTimeout(task, timeoutMs) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(`SCENARIO_TIMEOUT_${timeoutMs}ms`)), timeoutMs);
  });
  try {
    return await Promise.race([task(), timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
  }
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery Local Generator (in-process API handler) ===\n');
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Shard:       ${SHARD.label}`);
  console.log(`Per-case timeout: ${Math.round(SCENARIO_TIMEOUT_MS / 1000)}s`);
  console.log(`Output:      ${OUTPUT_DIR}\n`);
  console.log(`Fixtures:    ${PUBLIC_DIR}\n`);

  const qrHandler = await getQrHandler();
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

  console.log(
    `Configs: ${configs.length}${SHARD.isSharded ? ` (shard from ${preShardCount})` : ''}\n`
  );

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const passedPath = path.join(OUTPUT_DIR, shardOutputFilename('passed.txt', SHARD));
  const failedPath = path.join(OUTPUT_DIR, shardOutputFilename('failed.txt', SHARD));
  const reportPath = path.join(OUTPUT_DIR, shardOutputFilename('report.json', SHARD));

  const globalStart = Date.now();
  let completed = 0;
  const passed = [];
  const failed = [];

  const tasks = configs.map((config) => async () => {
    const start = Date.now();
    const expectedPayload = config.params.data;
    const fallbackFilename = scenarioFilename(config);

    try {
      return await withTimeout(async () => {
        await removeScenarioArtifacts(OUTPUT_DIR, config);
        const request = await buildLocalRequest(config);
        const response = await qrHandler(request);

        if (!response.ok) {
          const body = await response.text().catch(() => '');
          throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
        }

        const contentType = response.headers.get('Content-Type') || 'image/png';
        const resolvedExt = extFromContentType(contentType, config.isAnimated ? 'gif' : 'png');
        const baseName = fallbackFilename.replace(/\.[^.]+$/, '');
        const filename = `${baseName}.${resolvedExt}`;
        const artifactPath = path.join(OUTPUT_DIR, filename);
        const tempArtifactPath = `${artifactPath}.tmp-${process.pid}-${Date.now()}`;

        const buffer = Buffer.from(await response.arrayBuffer());
        const magicCheck = validateArtifactMagic(buffer, resolvedExt, config.isAnimated);
        const verify = magicCheck.pass
          ? await verifyImage(buffer, expectedPayload, config.isAnimated)
          : magicCheck;
        await fs.writeFile(tempArtifactPath, buffer);
        await finalizeTempArtifact(tempArtifactPath, artifactPath, verify.pass);

        completed++;
        const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
        const icon = verify.pass ? '✓' : '✗';
        const suffix = verify.pass ? '' : ` [${verify.reason}]`;
        console.log(
          `  [${completed}/${configs.length}] ${icon} ${config.id} ` +
            `(${resolvedExt.toUpperCase()}, ${(buffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`
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
          contentType,
          durationMs: Date.now() - start,
        };
      }, SCENARIO_TIMEOUT_MS);
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(
        `  [${completed}/${configs.length}] ✗ ${config.id}: ${err.message} [${elapsed}s]`
      );
      failed.push(fallbackFilename);
      return {
        id: config.id,
        category: config.category,
        status: 'fail',
        reason: 'LOCAL_HANDLER_ERROR',
        message: err.message,
        durationMs: Date.now() - start,
      };
    }
  });

  const results = await runPool(tasks, CONCURRENCY);

  await fs.writeFile(passedPath, passed.join('\n') + (passed.length ? '\n' : ''));
  await fs.writeFile(failedPath, failed.join('\n') + (failed.length ? '\n' : ''));

  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'local',
    renderer: 'netlify/functions/qr.ts (in-process)',
    assetBaseUrl: pathToFileURL(PUBLIC_DIR).href,
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
        return [
          cat,
          {
            total: catResults.length,
            pass: catResults.filter((r) => r.status === 'pass').length,
            fail: catResults.filter((r) => r.status === 'fail').length,
          },
        ];
      })
    ),
    results,
  };

  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  const totalSec = Math.round((Date.now() - globalStart) / 1000);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${results.length} runs in ${totalSec}s`);
  console.log(
    `Pass:  ${passed.length} (${Math.round((passed.length * 100) / (results.length || 1))}%)`
  );
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
  console.error('[gallery-local] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
