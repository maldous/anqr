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
 *   GALLERY_CONCURRENCY    Parallel request count (default: 2)
 *   GALLERY_SCENARIO_TIMEOUT_MS  Max per-scenario remote wait budget (default: 900000)
 *   GALLERY_FETCH_TIMEOUT_MS     Per-request fetch timeout cap (default: 120000)
 *   GALLERY_SKIP_CACHE           Set to 1 to bypass Netlify Blob cache reads/writes
 *   GALLERY_CATEGORY       Filter by category: nooverlay/overlay/artwork (default: all)
 *   GALLERY_IDS            Comma-separated config IDs to run (default: all)
 *   GALLERY_SHARD          Shard selector (e.g. 2/8 or 2-of-8)
 *   GALLERY_SHARD_INDEX    0-based shard index (used with GALLERY_SHARD_TOTAL)
 *   GALLERY_SHARD_TOTAL    Total shard count
 */

import fs from 'node:fs/promises';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS_DIR = path.join(ROOT, 'reports');
const ARTIFACTS_DIR = path.join(REPORTS_DIR, 'gallery-artifacts');
const OUTPUT_DIR = path.join(ARTIFACTS_DIR, 'remote');

const API_BASE = process.env.GALLERY_API_URL || 'https://anqr.link/api/qr';
const ASSET_BASE = process.env.GALLERY_ASSET_URL || 'https://anqr.link';
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '2', 10));
const SCENARIO_TIMEOUT_MS = Math.max(
  30_000,
  Number.parseInt(process.env.GALLERY_SCENARIO_TIMEOUT_MS || '900000', 10)
);
const FETCH_TIMEOUT_MS = Math.max(
  30_000,
  Math.min(
    SCENARIO_TIMEOUT_MS,
    Number.parseInt(process.env.GALLERY_FETCH_TIMEOUT_MS || '120000', 10)
  )
);
const FORCE_STRICT_OVERLAY = process.env.GALLERY_STRICT_OVERLAY === '1';
const SKIP_CACHE = process.env.GALLERY_SKIP_CACHE === '1';
const SHARD = resolveGalleryShard(process.env);
const ARTIFACT_EXTS = ['png', 'gif', 'webp', 'jpg', 'jpeg', 'svg'];
const RESOLVE_FALLBACK_IPS = String(process.env.GALLERY_RESOLVE_FALLBACK_IPS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);
const MAX_RETRIES = 2;
const POLL_INTERVAL_MS = 10_000;
const MAX_POLLS = Math.max(1, Math.ceil(SCENARIO_TIMEOUT_MS / POLL_INTERVAL_MS));

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

  // Force deterministic full render for parity comparisons.
  params.set('_fullRender', '1');
  // Optional fail-fast mode for overlay fetch/decode issues.
  if (FORCE_STRICT_OVERLAY) {
    params.set('_strictOverlay', '1');
  }

  return `${API_BASE}?${params.toString()}`;
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

// ============================================
// HTTP fetch with retry + polling
// ============================================

async function fetchOnce(url) {
  const requestHeaders = {
    'User-Agent': 'ANQR-Gallery-Remote/1.0',
    ...(SKIP_CACHE ? { 'X-ANQR-Skip-Cache': '1' } : {}),
  };

  let response;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: requestHeaders,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isDnsFailure = err?.code === 'ENOTFOUND' || err?.cause?.code === 'ENOTFOUND';
    if (!isDnsFailure || RESOLVE_FALLBACK_IPS.length === 0) {
      throw err;
    }

    const parsed = new URL(url);
    let lastResolveErr = err;
    for (const ip of RESOLVE_FALLBACK_IPS) {
      try {
        return await fetchOnceWithResolvedIp(parsed, requestHeaders, ip);
      } catch (resolveErr) {
        lastResolveErr = resolveErr;
      }
    }
    throw lastResolveErr;
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${body.slice(0, 200)}`);
  }

  const generating = response.headers.get('X-ANQR-Status') === 'generating';
  const buffer = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get('Content-Type') || 'image/png';
  return { buffer, generating, contentType };
}

function fetchOnceWithResolvedIp(parsedUrl, headers, ipAddress) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? Number(parsedUrl.port) : 443,
        path: `${parsedUrl.pathname}${parsedUrl.search}`,
        method: 'GET',
        headers,
        servername: parsedUrl.hostname,
        lookup: (_hostname, optsOrCb, maybeCb) => {
          const opts = typeof optsOrCb === 'object' && optsOrCb ? optsOrCb : {};
          const cb = typeof optsOrCb === 'function' ? optsOrCb : maybeCb;
          if (opts.all) {
            cb(null, [{ address: ipAddress, family: 4 }]);
            return;
          }
          cb(null, ipAddress, 4);
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const status = res.statusCode ?? 0;
          if (status < 200 || status >= 300) {
            const body = buffer.toString('utf8', 0, Math.min(buffer.length, 200));
            reject(new Error(`HTTP ${status}: ${body}`));
            return;
          }

          const contentType = String(res.headers['content-type'] || 'image/png');
          const generating = String(res.headers['x-anqr-status'] || '') === 'generating';
          resolve({ buffer, generating, contentType });
        });
      }
    );

    req.setTimeout(FETCH_TIMEOUT_MS, () => {
      req.destroy(new Error(`FETCH_TIMEOUT_${FETCH_TIMEOUT_MS}ms`));
    });
    req.on('error', reject);
    req.end();
  });
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let result;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      result = await fetchOnce(url);
      break;
    } catch (err) {
      const detail = [err?.message, err?.cause?.code, err?.cause?.message]
        .filter(Boolean)
        .join(' | ');
      if (attempt < retries) {
        const delay = 2000 * (attempt + 1);
        console.warn(
          `  ↻ Retry ${attempt + 1}/${retries} after ${delay}ms: ${detail || 'fetch failed'}`
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }

  if (result.generating) {
    console.warn(
      `  ⏳ Background generation triggered, polling every ${POLL_INTERVAL_MS / 1000}s...`
    );
    for (let poll = 1; poll <= MAX_POLLS; poll++) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      try {
        const pollResult = await fetchOnce(url);
        if (!pollResult.generating) {
          if (pollResult.buffer.length < 100) {
            throw new Error(`Response too small: ${pollResult.buffer.length} bytes`);
          }
          return pollResult;
        }
        console.warn(`  ⏳ Still generating... (poll ${poll}/${MAX_POLLS})`);
      } catch (err) {
        console.warn(`  ⏳ Poll ${poll}/${MAX_POLLS} failed: ${err.message}`);
      }
    }
    console.warn(
      `  ⚠ Background render did not complete after ${MAX_POLLS} polls, using degraded image`
    );
    return result;
  }

  if (result.buffer.length < 100) {
    throw new Error(`Response too small: ${result.buffer.length} bytes`);
  }
  return result;
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
  console.log('\n=== ANQR Gallery Remote Generator (API-based) ===\n');
  console.log(`API:         ${API_BASE}`);
  console.log(`Assets:      ${ASSET_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}\n`);
  console.log(`Shard:       ${SHARD.label}\n`);
  console.log(`Cache mode:  ${SKIP_CACHE ? 'skip-cache' : 'allow-cache'}\n`);

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
  const preShardCount = configs.length;
  configs = applyGalleryShard(configs, SHARD);

  console.log(
    `Configs: ${configs.length}${SHARD.isSharded ? ` (shard from ${preShardCount})` : ''}\n`
  );

  // Prepare artifact directory
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
    const fallbackName = scenarioFilename(config).replace(/\.[^.]+$/, '');
    const expectedPayload = config.params.data;

    try {
      await removeScenarioArtifacts(OUTPUT_DIR, config);
      const url = buildApiUrl(config);
      const { buffer, contentType } = await fetchWithRetry(url);
      const ext = extFromContentType(contentType, config.isAnimated ? 'gif' : 'png');
      const filename = `${fallbackName}.${ext}`;
      const artifactPath = path.join(OUTPUT_DIR, filename);
      const tempArtifactPath = `${artifactPath}.tmp-${process.pid}-${Date.now()}`;

      // Artwork appends a #suffix, so verify prefix only
      const magicCheck = validateArtifactMagic(buffer, ext, config.isAnimated);
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
        filename,
        contentType,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const detail = [err?.message, err?.cause?.code, err?.cause?.message]
        .filter(Boolean)
        .join(' | ');
      console.error(
        `  [${completed}/${configs.length}] ✗ ${config.id}: ${detail || 'API_ERROR'} [${elapsed}s]`
      );
      failed.push(`${fallbackName}.${config.isAnimated ? 'gif' : 'png'}`);
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
  await fs.writeFile(passedPath, passed.join('\n') + (passed.length ? '\n' : ''));
  await fs.writeFile(failedPath, failed.join('\n') + (failed.length ? '\n' : ''));

  // Write JSON report
  const report = {
    generatedAt: new Date().toISOString(),
    mode: 'remote',
    apiBase: API_BASE,
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
          { total: catResults.length, pass: catResults.filter((r) => r.status === 'pass').length },
        ];
      })
    ),
    results,
  };
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  // Print summary
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
  console.error('[gallery-remote] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
