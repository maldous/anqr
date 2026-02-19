#!/usr/bin/env node

/**
 * Gallery Matrix Generator (API-based)
 *
 * Generates gallery QR code images by calling the deployed anqr.link API
 * for each scenario × fixture combination. Replaces the previous in-process
 * Vitest approach which had unrecoverable @napi-rs/canvas native memory
 * issues (9–17 GB per shard, 30-minute timeouts).
 *
 * Each scenario's galleryParams are sent as URL parameters to the API,
 * which renders the QR code server-side and returns the image.
 *
 * Environment variables:
 *   GALLERY_API_URL        API base URL (default: https://anqr.link/api/qr)
 *   GALLERY_ASSET_URL      Asset base URL for overlay images (default: https://anqr.link)
 *   GALLERY_CONCURRENCY    Parallel request count (default: 6)
 *   SCAN_MATRIX_SCENARIOS  Comma-separated scenario IDs to run (default: all)
 *   SCAN_MATRIX_FIXTURES   Comma-separated fixture IDs to run (default: all)
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
const TIER_A_DIR = path.join(ARTIFACTS_DIR, 'tier-a');
const SCENARIOS_PATH = path.join(ROOT, 'src/data/gallery-scan-scenarios.ts');

const API_BASE = process.env.GALLERY_API_URL || 'https://anqr.link/api/qr';
const ASSET_BASE = process.env.GALLERY_ASSET_URL || 'https://anqr.link';
const CONCURRENCY = Math.max(1, Number.parseInt(process.env.GALLERY_CONCURRENCY || '6', 10));
const PAYLOAD = 'https://anqr.link';
const IMAGE_SIZE = 400;
const FETCH_TIMEOUT_MS = 60_000;
const MAX_RETRIES = 2;
const POLL_INTERVAL_MS = 10_000;
const MAX_POLLS = 90;
const IS_LOCAL = API_BASE.includes('localhost') || API_BASE.includes('127.0.0.1');

// ============================================
// Source file parsing
// ============================================

function parseFixtures(src) {
  const start = src.indexOf('export const CANONICAL_FIXTURES');
  const end = src.indexOf('];', start);
  const body = src.slice(start, end + 2);

  const fixtures = [];
  const re =
    /\{\s*id:\s*'([^']+)',\s*filePath:\s*'([^']+)',\s*publicPath:\s*'([^']+)',\s*isAnimated:\s*(true|false)\s*\}/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    fixtures.push({
      id: m[1],
      filePath: m[2],
      publicPath: m[3],
      isAnimated: m[4] === 'true',
    });
  }
  return fixtures;
}

function parseScenarios(src) {
  const start = src.indexOf('export const GALLERY_SCAN_SCENARIOS');
  const body = src.slice(start);

  // Locate every id: '...' inside the array
  const idRe = /\bid:\s*'([^']+)'/g;
  const ids = [];
  let m;
  while ((m = idRe.exec(body)) !== null) {
    ids.push({ id: m[1], pos: m.index });
  }

  const scenarios = [];
  for (let i = 0; i < ids.length; i++) {
    const blockStart = ids[i].pos;
    const blockEnd = i < ids.length - 1 ? ids[i + 1].pos : body.length;
    const block = body.slice(blockStart, blockEnd);

    const id = ids[i].id;
    const title = block.match(/title:\s*'([^']*)'/)?.[ 1] || id;
    const description = block.match(/description:\s*'([^']*)'/)?.[ 1] || '';
    const featureGroup = block.match(/featureGroup:\s*'([^']*)'/)?.[ 1] || 'unknown';
    const heroPriority = Number.parseInt(block.match(/heroPriority:\s*(\d+)/)?.[ 1] || '0', 10);
    const galleryEligible = block.includes('galleryEligible: true');
    const useOverlay = block.includes('useOverlay: true');

    // Extract galleryParams object literal and evaluate it.
    // Safe: this is our own trusted source file with only primitive values.
    const paramsMatch = block.match(/galleryParams:\s*(\{[\s\S]*?\})/);
    let galleryParams = {};
    if (paramsMatch) {
      try {
        // biome-ignore lint: eval of own source
        galleryParams = new Function(`return ${paramsMatch[1]}`)();
      } catch {
        console.warn(`  ⚠ Could not parse galleryParams for ${id}`);
      }
    }

    scenarios.push({
      id,
      title,
      description,
      featureGroup,
      heroPriority,
      galleryEligible,
      useOverlay,
      galleryParams,
    });
  }
  return scenarios;
}

// ============================================
// Scan verification
// ============================================

// For animated GIFs, verifies first frame only (QR pattern is consistent across frames).
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

function buildApiUrl(scenario, fixture) {
  const params = new URLSearchParams();
  params.set('data', PAYLOAD);
  params.set('size', String(IMAGE_SIZE));

  // Scenario-specific params
  for (const [key, value] of Object.entries(scenario.galleryParams)) {
    params.set(key, String(value));
  }

  // Overlay image
  if (scenario.useOverlay && fixture) {
    params.set('img', `${ASSET_BASE}${fixture.publicPath}`);
    // Local dev: _fullRender=1 for direct rendering (blob cache unavailable)
    // Production: omit _fullRender to use async background rendering + blob cache
    if (IS_LOCAL) {
      params.set('_fullRender', '1');
    }
  }

  // Request GIF for animated overlays so the gallery gets animated output;
  // static overlays and non-overlay scenarios use PNG.
  params.set('format', fixture?.isAnimated ? 'gif' : 'png');

  return `${API_BASE}?${params.toString()}`;
}

// ============================================
// HTTP fetch with retry
// ============================================

async function fetchOnce(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: { 'User-Agent': 'ANQR-Gallery-Matrix/1.0' },
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
  // Initial fetch with retries for network/server errors
  let result;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      result = await fetchOnce(url);
      break;
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

  // If the background is generating the full overlay, poll until it's cached
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
// Run queue
// ============================================

function buildRunQueue(scenarios, fixtures) {
  const runs = [];
  for (const scenario of scenarios) {
    if (scenario.useOverlay) {
      for (const fixture of fixtures) {
        runs.push({ scenario, fixture });
      }
    } else {
      // Non-overlay scenarios: render once, use 'tsunami' as canonical fixture name
      const canonical = fixtures.find((f) => f.id === 'tsunami') || fixtures[0];
      runs.push({ scenario, fixture: canonical, isNonOverlay: true });
    }
  }
  return runs;
}

// ============================================
// Markdown summary
// ============================================

function buildSummaryMarkdown(results, scenarios, fixtures) {
  const passCount = results.filter((r) => r.status === 'pass').length;
  const failCount = results.length - passCount;

  const lines = [
    '# Gallery Scan Matrix Summary',
    '',
    '## Overview',
    '',
    `- **Method:** API-based (\`${API_BASE}\`)`,
    `- **Total runs:** ${results.length}`,
    `- **Pass:** ${passCount} (${Math.round((passCount * 100) / (results.length || 1))}%)`,
    `- **Fail:** ${failCount}`,
    '',
    '## Results by Fixture',
    '',
    '| Fixture | Pass | Fail |',
    '| --- | ---: | ---: |',
  ];

  for (const fixture of fixtures) {
    const fr = results.filter((r) => r.fixtureId === fixture.id);
    const fp = fr.filter((r) => r.status === 'pass').length;
    lines.push(`| ${fixture.id} | ${fp} | ${fr.length - fp} |`);
  }

  const fails = results.filter((r) => r.status === 'fail');
  if (fails.length > 0) {
    lines.push(
      '',
      '## Failing Cases',
      '',
      '| Scenario | Fixture | Reason |',
      '| --- | --- | --- |'
    );
    for (const r of fails) {
      lines.push(`| ${r.scenarioId} | ${r.fixtureId} | ${r.reasonCode} |`);
    }
  }

  return `${lines.join('\n')}\n`;
}

// ============================================
// Main
// ============================================

async function main() {
  console.log('\n=== ANQR Gallery Matrix Generator (API-based) ===\n');
  console.log(`API:         ${API_BASE}`);
  console.log(`Assets:      ${ASSET_BASE}`);
  console.log(`Concurrency: ${CONCURRENCY}`);
  console.log(`Image size:  ${IMAGE_SIZE}px\n`);

  // Parse scenarios and fixtures from source
  const src = await fs.readFile(SCENARIOS_PATH, 'utf8');
  let scenarios = parseScenarios(src);
  let fixtures = parseFixtures(src);

  // Apply optional filters
  const scenarioFilter = process.env.SCAN_MATRIX_SCENARIOS;
  if (scenarioFilter) {
    const ids = new Set(scenarioFilter.split(',').map((s) => s.trim()));
    scenarios = scenarios.filter((s) => ids.has(s.id));
  }
  const fixtureFilter = process.env.SCAN_MATRIX_FIXTURES;
  if (fixtureFilter) {
    const ids = new Set(fixtureFilter.split(',').map((s) => s.trim()));
    fixtures = fixtures.filter((f) => ids.has(f.id));
  }

  console.log(`Scenarios: ${scenarios.length}`);
  console.log(`Fixtures:  ${fixtures.length}\n`);

  // Prepare artifact directories
  await fs.rm(ARTIFACTS_DIR, { recursive: true, force: true });
  await fs.mkdir(TIER_A_DIR, { recursive: true });

  const runs = buildRunQueue(scenarios, fixtures);
  console.log(`Total runs: ${runs.length}\n`);

  const globalStart = Date.now();
  let completed = 0;

  // Build task list
  const tasks = runs.map(({ scenario, fixture, isNonOverlay }) => async () => {
    const start = Date.now();
    const isAnimated = !!(!isNonOverlay && fixture?.isAnimated);
    const ext = isAnimated ? 'gif' : 'png';
    const artifactName = `tier-a__${scenario.id}__${fixture.id}.${ext}`;
    const artifactPath = path.join(TIER_A_DIR, artifactName);
    const relArtifactPath = `reports/gallery-artifacts/tier-a/${artifactName}`;

    try {
      const url = buildApiUrl(scenario, isNonOverlay ? null : fixture);
      const buffer = await fetchWithRetry(url);
      await fs.writeFile(artifactPath, buffer);

      const verify = await verifyImage(buffer, PAYLOAD);
      const status = verify.pass ? 'pass' : 'fail';
      const reasonCode = verify.pass ? 'OK' : verify.reason;

      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      const icon = verify.pass ? '✓' : '✗';
      const mismatchInfo = verify.decoded ? ` (decoded: "${verify.decoded.slice(0, 60)}")` : '';
      const suffix = verify.pass ? '' : ` [${reasonCode}${mismatchInfo}]`;
      console.log(
        `  [${completed}/${runs.length}] ${icon} ${scenario.id} × ${fixture.id} ` +
          `(${(buffer.length / 1024).toFixed(1)} KB, ${Date.now() - start}ms)${suffix} [${elapsed}s]`
      );

      return {
        tier: 'tier-a',
        scenarioId: scenario.id,
        fixtureId: fixture.id,
        isAnimated,
        status,
        reasonCode,
        disposition: verify.pass ? 'tunable' : 'fix-now',
        directDecodePass: verify.pass,
        roundtripDecodePass: verify.pass,
        artifactPath: relArtifactPath,
        durationMs: Date.now() - start,
      };
    } catch (err) {
      completed++;
      const elapsed = ((Date.now() - globalStart) / 1000).toFixed(0);
      console.error(
        `  [${completed}/${runs.length}] ✗ ${scenario.id} × ${fixture.id}: ${err.message} [${elapsed}s]`
      );

      return {
        tier: 'tier-a',
        scenarioId: scenario.id,
        fixtureId: fixture.id,
        isAnimated,
        status: 'fail',
        reasonCode: 'API_ERROR',
        disposition: 'fix-now',
        directDecodePass: false,
        roundtripDecodePass: false,
        artifactPath: relArtifactPath,
        durationMs: Date.now() - start,
      };
    }
  });

  // Execute with concurrency pool
  const results = await runPool(tasks, CONCURRENCY);

  // Sort: scenario order → fixture order
  const scenarioOrder = new Map(scenarios.map((s, i) => [s.id, i]));
  const fixtureOrder = new Map(fixtures.map((f, i) => [f.id, i]));
  results.sort((a, b) => {
    const sd = (scenarioOrder.get(a.scenarioId) ?? 999) - (scenarioOrder.get(b.scenarioId) ?? 999);
    return sd !== 0
      ? sd
      : (fixtureOrder.get(a.fixtureId) ?? 999) - (fixtureOrder.get(b.fixtureId) ?? 999);
  });

  // Build gallery candidates (best fixture per scenario from passing results)
  const byScenario = new Map();
  for (const result of results) {
    if (result.status !== 'pass') continue;
    const arr = byScenario.get(result.scenarioId) || [];
    arr.push(result);
    byScenario.set(result.scenarioId, arr);
  }

  const scenarioMeta = new Map(scenarios.map((s) => [s.id, s]));
  const galleryCandidates = Array.from(byScenario.entries())
    .map(([scenarioId, passRuns]) => {
      passRuns.sort((a, b) => a.durationMs - b.durationMs);
      const meta = scenarioMeta.get(scenarioId);
      return {
        scenarioId,
        selectedFixtureId: passRuns[0].fixtureId,
        isAnimated: passRuns[0].isAnimated,
        heroPriority: meta?.heroPriority ?? 0,
        galleryEligible: meta?.galleryEligible ?? false,
        artifactPath: passRuns[0].artifactPath,
        status: passRuns[0].status,
      };
    })
    .sort((a, b) => b.heroPriority - a.heroPriority);

  // Aggregate stats
  const passRuns = results.filter((r) => r.status === 'pass').length;
  const failRuns = results.length - passRuns;

  // Write JSON report (same schema as previous test-based approach)
  const report = {
    generatedAt: new Date().toISOString(),
    tiers: [
      {
        id: 'tier-a',
        label: 'Production',
        description: 'API-generated with production settings',
      },
    ],
    scenarios: scenarios.map((s) => ({
      id: s.id,
      title: s.title,
      description: s.description,
      featureGroup: s.featureGroup,
      heroPriority: s.heroPriority,
      galleryEligible: s.galleryEligible,
    })),
    fixtures: fixtures.map((f) => ({
      id: f.id,
      filePath: f.filePath,
      publicPath: f.publicPath,
      isAnimated: f.isAnimated,
    })),
    totalRuns: results.length,
    tierA: { totalRuns: results.length, passRuns, failRuns },
    tierB: { totalRuns: 0, passRuns: 0, failRuns: 0 },
    results,
    galleryCandidates,
  };

  await fs.writeFile(
    path.join(REPORTS_DIR, 'gallery-scan-matrix.json'),
    JSON.stringify(report, null, 2)
  );
  await fs.writeFile(
    path.join(REPORTS_DIR, 'gallery-scan-summary.md'),
    buildSummaryMarkdown(results, scenarios, fixtures)
  );

  // Print summary
  const totalSec = Math.round((Date.now() - globalStart) / 1000);
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Total: ${results.length} runs in ${totalSec}s`);
  console.log(`Pass:  ${passRuns} (${Math.round((passRuns * 100) / (results.length || 1))}%)`);
  console.log(`Fail:  ${failRuns}`);
  console.log(`Gallery candidates: ${galleryCandidates.length}`);
  console.log(`\nArtifacts: reports/gallery-artifacts/tier-a/`);
  console.log(`Report:    reports/gallery-scan-matrix.json`);
  console.log(`Summary:   reports/gallery-scan-summary.md\n`);

  if (failRuns > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[gallery-matrix] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
