#!/usr/bin/env node

/**
 * Compare gallery artifacts across local/browser/remote renderers.
 *
 * Inputs:
 *   reports/gallery-artifacts/{local,browser,remote}/report.merged.json (preferred)
 *   or report.json, or report.shard-*.json
 *   reports/gallery-artifacts/{local,browser,remote}/*.{png,gif}
 *
 * Output:
 *   reports/gallery-artifacts/consistency-report.json
 *   reports/gallery-artifacts/consistency-report.md
 */

import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { decodeQR } from '../src/modules/qr-decoder/index.ts';
import { generateAllScenarios, scenarioFilename } from './lib/gallery-permutations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTIFACTS_DIR = path.join(ROOT, 'reports', 'gallery-artifacts');
const MODES = String(process.env.GALLERY_COMPARE_MODES || 'local,browser,remote')
  .split(',')
  .map((mode) => mode.trim().toLowerCase())
  .filter(Boolean);
const STATIC_SIZE_RATIO_MAX = Math.max(
  1,
  Number.parseFloat(process.env.GALLERY_COMPARE_STATIC_MAX_RATIO || '2.0') || 2.0
);
const ANIMATED_SIZE_RATIO_MAX = Math.max(
  1,
  Number.parseFloat(process.env.GALLERY_COMPARE_ANIMATED_MAX_RATIO || '4.0') || 4.0
);
const STATIC_VISUAL_HASH_MAX_BITS = Math.max(
  0,
  Number.parseInt(process.env.GALLERY_COMPARE_STATIC_VISUAL_HASH_MAX_BITS || '6', 10) || 6
);
const ANIMATED_VISUAL_HASH_MAX_BITS = Math.max(
  0,
  Number.parseInt(process.env.GALLERY_COMPARE_ANIMATED_VISUAL_HASH_MAX_BITS || '10', 10) || 10
);

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function mergeShardResults(reports) {
  const latestById = new Map();
  for (const report of reports) {
    const generatedAt = Date.parse(String(report.generatedAt || '')) || 0;
    for (const result of report.results || []) {
      const previous = latestById.get(result.id);
      if (!previous || generatedAt >= previous.generatedAt) {
        latestById.set(result.id, { generatedAt, result });
      }
    }
  }
  return [...latestById.values()].map((entry) => entry.result);
}

async function loadModeReport(mode) {
  const modeDir = path.join(ARTIFACTS_DIR, mode);
  if (!(await exists(modeDir))) {
    throw new Error(
      `Missing artifact directory for mode "${mode}": ${modeDir}. ` +
        `Run make gallery:${mode} first.`
    );
  }
  const mergedPath = path.join(modeDir, 'report.merged.json');
  const singlePath = path.join(modeDir, 'report.json');

  if (await exists(mergedPath)) {
    const report = await readJson(mergedPath);
    return {
      report,
      results: report.results || [],
      source: path.relative(ROOT, mergedPath),
    };
  }

  if (await exists(singlePath)) {
    const report = await readJson(singlePath);
    return {
      report,
      results: report.results || [],
      source: path.relative(ROOT, singlePath),
    };
  }

  const files = await fs.readdir(modeDir);
  const shardFiles = files.filter((name) => /^report\.shard-\d+-of-\d+\.json$/i.test(name)).sort();
  if (shardFiles.length === 0) {
    throw new Error(`Missing report for mode "${mode}" in ${modeDir}`);
  }

  const shardReports = await Promise.all(
    shardFiles.map(async (name) => readJson(path.join(modeDir, name)))
  );
  const mergedResults = mergeShardResults(shardReports);
  const merged = {
    generatedAt: new Date().toISOString(),
    mode,
    source: shardFiles.map((name) => path.relative(ROOT, path.join(modeDir, name))),
    mergedFromShards: true,
    results: mergedResults,
  };
  return {
    report: merged,
    results: mergedResults,
    source: `shards(${shardFiles.length})`,
  };
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

async function analyzeArtifact(filePath, expectedPrefix) {
  const buffer = await fs.readFile(filePath);
  const sha256 = createHash('sha256').update(buffer).digest('hex');

  let width = 0;
  let height = 0;
  let visualHash64 = null;
  let decodePass = false;
  let decodeReason = 'DECODE_FAILED';
  let decodedPrefixOk = false;

  try {
    const img = await loadImage(buffer);
    width = img.width;
    height = img.height;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, width, height);
    const result = decodeQR(imageData, { inversionAttempts: 'attemptBoth' });

    const hashCanvas = createCanvas(DCT_N, DCT_N);
    const hashCtx = hashCanvas.getContext('2d');
    hashCtx.imageSmoothingEnabled = true;
    hashCtx.imageSmoothingQuality = 'high';
    hashCtx.drawImage(img, 0, 0, DCT_N, DCT_N);
    const hashImageData = hashCtx.getImageData(0, 0, DCT_N, DCT_N).data;
    visualHash64 = computePhash64(hashImageData).toString(16).padStart(16, '0');

    if (result?.success) {
      decodePass = true;
      decodedPrefixOk = String(result.data || '').startsWith(expectedPrefix);
      decodeReason = decodedPrefixOk ? 'OK' : 'CONTENT_MISMATCH';
    }
  } catch (err) {
    decodeReason = `ANALYZE_ERROR: ${err?.message || String(err)}`;
  }

  return {
    bytes: buffer.byteLength,
    sha256,
    visualHash64,
    width,
    height,
    decodePass,
    decodedPrefixOk,
    decodeReason,
  };
}

function createDctCosTable(n) {
  const table = Array.from({ length: n }, () => new Float64Array(n));
  for (let u = 0; u < n; u++) {
    for (let x = 0; x < n; x++) {
      table[u][x] = Math.cos(((2 * x + 1) * u * Math.PI) / (2 * n));
    }
  }
  return table;
}

const DCT_N = 32;
const PHASH_N = 8;
const DCT_COS = createDctCosTable(DCT_N);

function dct2(input) {
  const n = input.length;
  const temp = Array.from({ length: n }, () => new Float64Array(n));
  const out = Array.from({ length: n }, () => new Float64Array(n));

  for (let u = 0; u < n; u++) {
    const au = u === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n);
    for (let y = 0; y < n; y++) {
      let sum = 0;
      for (let x = 0; x < n; x++) {
        sum += input[x][y] * DCT_COS[u][x];
      }
      temp[u][y] = au * sum;
    }
  }

  for (let u = 0; u < n; u++) {
    for (let v = 0; v < n; v++) {
      const av = v === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n);
      let sum = 0;
      for (let y = 0; y < n; y++) {
        sum += temp[u][y] * DCT_COS[v][y];
      }
      out[u][v] = av * sum;
    }
  }

  return out;
}

function computePhash64(imageData) {
  const gray = Array.from({ length: DCT_N }, () => new Float64Array(DCT_N));
  let idx = 0;
  for (let y = 0; y < DCT_N; y++) {
    for (let x = 0; x < DCT_N; x++) {
      const r = imageData[idx++];
      const g = imageData[idx++];
      const b = imageData[idx++];
      idx++;
      gray[x][y] = 0.299 * r + 0.587 * g + 0.114 * b;
    }
  }

  const coeffs = dct2(gray);
  const low = [];
  for (let y = 0; y < PHASH_N; y++) {
    for (let x = 0; x < PHASH_N; x++) {
      if (x === 0 && y === 0) continue;
      low.push(coeffs[x][y]);
    }
  }

  const sorted = [...low].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];

  let bits = 0n;
  let bitIndex = 0n;
  for (let y = 0; y < PHASH_N; y++) {
    for (let x = 0; x < PHASH_N; x++) {
      if (x === 0 && y === 0) continue;
      if (coeffs[x][y] > median) bits |= 1n << bitIndex;
      bitIndex++;
    }
  }
  if (coeffs[0][0] > 0) bits |= 1n << 63n;
  return bits;
}

function popcountBigInt(v) {
  let x = v;
  let c = 0;
  while (x) {
    x &= x - 1n;
    c++;
  }
  return c;
}

function hammingDistanceHex64(aHex, bHex) {
  const a = BigInt(`0x${aHex}`);
  const b = BigInt(`0x${bHex}`);
  return popcountBigInt(a ^ b);
}

function candidateFilenamesForMode(config, mode, reportResult) {
  const out = [];
  if (reportResult?.filename) out.push(reportResult.filename);

  const canonical = scenarioFilename(config);
  out.push(canonical);

  // Browser renderer may export based on response content-type.
  if (mode === 'browser') {
    out.push(canonical.replace(/\.[^.]+$/, '.png'));
  }

  // Remote renderer may return format based on response content-type.
  if (mode === 'remote' && reportResult?.contentType) {
    const ext = extFromContentType(reportResult.contentType, config.isAnimated ? 'gif' : 'png');
    out.push(canonical.replace(/\.[^.]+$/, `.${ext}`));
  }

  return [...new Set(out)];
}

async function findArtifactPath(modeDir, filenames) {
  for (const name of filenames) {
    const candidate = path.join(modeDir, name);
    if (await exists(candidate)) return { path: candidate, filename: name };
  }
  return null;
}

async function main() {
  if (MODES.length === 0) {
    throw new Error('GALLERY_COMPARE_MODES resolved to zero modes.');
  }

  const configs = generateAllScenarios();

  const modeReports = {};
  const modeResultMaps = {};
  const modeReportSources = {};

  for (const mode of MODES) {
    const loaded = await loadModeReport(mode);
    const report = loaded.report;
    modeReports[mode] = report;
    modeResultMaps[mode] = new Map((loaded.results || []).map((r) => [r.id, r]));
    modeReportSources[mode] = loaded.source;
  }

  const perMode = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      { present: 0, missing: 0, decodeFail: 0, prefixMismatch: 0, nonPassStatus: 0 },
    ])
  );

  let allPresent = 0;
  let allDecodedPrefixOk = 0;
  let staticExactAllThree = 0;
  let animatedExactLocalRemote = 0;
  let allDimensionsAlignedCount = 0;
  let allSizeParityCount = 0;
  let allVisualHashParityCount = 0;

  const missing = [];
  const decodeIssues = [];
  const sizeIssues = [];
  const dimensionIssues = [];
  const visualHashIssues = [];
  const rows = [];

  for (const config of configs) {
    const row = {
      id: config.id,
      category: config.category,
      isAnimated: !!config.isAnimated,
      modes: {},
    };
    let rowAllPresent = true;
    let rowAllDecodePrefixOk = true;
    const shas = {};

    for (const mode of MODES) {
      const modeDir = path.join(ARTIFACTS_DIR, mode);
      const reportResult = modeResultMaps[mode].get(config.id);
      if (!reportResult || reportResult.status !== 'pass') {
        perMode[mode].nonPassStatus++;
      }

      const candidates = candidateFilenamesForMode(config, mode, reportResult);
      const found = await findArtifactPath(modeDir, candidates);

      if (!found) {
        rowAllPresent = false;
        perMode[mode].missing++;
        missing.push({ id: config.id, mode, candidates });
        row.modes[mode] = { found: false, filename: null };
        continue;
      }

      perMode[mode].present++;
      const analyzed = await analyzeArtifact(found.path, String(config.params.data || ''));
      row.modes[mode] = { found: true, filename: found.filename, ...analyzed };
      shas[mode] = analyzed.sha256;

      if (!analyzed.decodePass) {
        perMode[mode].decodeFail++;
        rowAllDecodePrefixOk = false;
        decodeIssues.push({ id: config.id, mode, reason: analyzed.decodeReason });
      } else if (!analyzed.decodedPrefixOk) {
        perMode[mode].prefixMismatch++;
        rowAllDecodePrefixOk = false;
        decodeIssues.push({ id: config.id, mode, reason: analyzed.decodeReason });
      }
    }

    if (rowAllPresent) allPresent++;
    if (rowAllDecodePrefixOk) allDecodedPrefixOk++;

    if (rowAllPresent) {
      if (!config.isAnimated) {
        if (
          shas.local &&
          shas.browser &&
          shas.remote &&
          shas.local === shas.browser &&
          shas.local === shas.remote
        ) {
          staticExactAllThree++;
        }
      } else if (shas.local && shas.remote && shas.local === shas.remote) {
        animatedExactLocalRemote++;
      }

      const presentModes = MODES.map((mode) => ({ mode, data: row.modes[mode] })).filter(
        (entry) => entry.data?.found
      );
      const dims = new Set(presentModes.map((entry) => `${entry.data.width}x${entry.data.height}`));
      if (dims.size === 1) {
        allDimensionsAlignedCount++;
      } else {
        dimensionIssues.push({
          id: config.id,
          isAnimated: !!config.isAnimated,
          dimsByMode: Object.fromEntries(
            presentModes.map((entry) => [entry.mode, `${entry.data.width}x${entry.data.height}`])
          ),
        });
      }

      const bytesByMode = Object.fromEntries(
        presentModes.map((entry) => [entry.mode, entry.data.bytes])
      );
      const sizes = presentModes.map((entry) => entry.data.bytes);
      const min = Math.min(...sizes);
      const max = Math.max(...sizes);
      const ratio = max / Math.max(1, min);
      const maxRatio = config.isAnimated ? ANIMATED_SIZE_RATIO_MAX : STATIC_SIZE_RATIO_MAX;
      if (ratio <= maxRatio) {
        allSizeParityCount++;
      } else {
        sizeIssues.push({
          id: config.id,
          isAnimated: !!config.isAnimated,
          ratio: Number(ratio.toFixed(3)),
          maxRatio,
          minBytes: min,
          maxBytes: max,
          bytesByMode,
        });
      }

      const hashesByMode = Object.fromEntries(
        presentModes.map((entry) => [entry.mode, entry.data.visualHash64]).filter(([, hash]) => !!hash)
      );
      const modePairs = [];
      for (let i = 0; i < presentModes.length; i++) {
        for (let j = i + 1; j < presentModes.length; j++) {
          modePairs.push([presentModes[i].mode, presentModes[j].mode]);
        }
      }
      const pairDistances = {};
      let maxDistance = 0;
      let completePairs = true;
      for (const [left, right] of modePairs) {
        const leftHash = hashesByMode[left];
        const rightHash = hashesByMode[right];
        if (!leftHash || !rightHash) {
          completePairs = false;
          continue;
        }
        const distance = hammingDistanceHex64(leftHash, rightHash);
        pairDistances[`${left}__${right}`] = distance;
        if (distance > maxDistance) maxDistance = distance;
      }

      if (completePairs) {
        const maxBits = config.isAnimated ? ANIMATED_VISUAL_HASH_MAX_BITS : STATIC_VISUAL_HASH_MAX_BITS;
        if (maxDistance <= maxBits) {
          allVisualHashParityCount++;
        } else {
          visualHashIssues.push({
            id: config.id,
            isAnimated: !!config.isAnimated,
            maxDistanceBits: maxDistance,
            maxAllowedBits: maxBits,
            pairDistances,
          });
        }
      }
    }

    rows.push(row);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalScenarios: configs.length,
    allModesPresentCount: allPresent,
    allModesDecodePrefixOkCount: allDecodedPrefixOk,
    staticExactAllThreeCount: staticExactAllThree,
    animatedExactLocalRemoteCount: animatedExactLocalRemote,
    allDimensionsAlignedCount,
    allSizeParityCount,
    allVisualHashParityCount,
    staticSizeRatioMax: STATIC_SIZE_RATIO_MAX,
    animatedSizeRatioMax: ANIMATED_SIZE_RATIO_MAX,
    staticVisualHashMaxBits: STATIC_VISUAL_HASH_MAX_BITS,
    animatedVisualHashMaxBits: ANIMATED_VISUAL_HASH_MAX_BITS,
    perMode,
    missingCount: missing.length,
    decodeIssueCount: decodeIssues.length,
    dimensionIssueCount: dimensionIssues.length,
    sizeIssueCount: sizeIssues.length,
    visualHashIssueCount: visualHashIssues.length,
    reportSources: modeReportSources,
  };

  const jsonReport = {
    summary,
    missing,
    decodeIssues,
    dimensionIssues,
    sizeIssues,
    visualHashIssues,
    rows,
  };
  const jsonPath = path.join(ARTIFACTS_DIR, 'consistency-report.json');
  await fs.writeFile(jsonPath, `${JSON.stringify(jsonReport, null, 2)}\n`);

  const md = [
    '# Gallery Consistency Report',
    '',
    `Generated: ${summary.generatedAt}`,
    '',
    `- Total scenarios: ${summary.totalScenarios}`,
    `- All modes present: ${summary.allModesPresentCount}/${summary.totalScenarios}`,
    `- All modes decode+prefix OK: ${summary.allModesDecodePrefixOkCount}/${summary.totalScenarios}`,
    `- All modes same dimensions: ${summary.allDimensionsAlignedCount}/${summary.totalScenarios}`,
    `- All modes size parity (ratio <= threshold): ${summary.allSizeParityCount}/${summary.totalScenarios}`,
    `  - Static max ratio: ${summary.staticSizeRatioMax}`,
    `  - Animated max ratio: ${summary.animatedSizeRatioMax}`,
    `- All modes visual-hash parity (max hamming <= threshold): ${summary.allVisualHashParityCount}/${summary.totalScenarios}`,
    `  - Static max bits: ${summary.staticVisualHashMaxBits}`,
    `  - Animated max bits: ${summary.animatedVisualHashMaxBits}`,
    `- Static exact hash (local=browser=remote): ${summary.staticExactAllThreeCount}`,
    `- Animated exact hash (local=remote): ${summary.animatedExactLocalRemoteCount}`,
    '',
    '## Per Mode',
    '',
    '| Mode | Present | Missing | Decode Fail | Prefix Mismatch | Non-Pass in report.json |',
    '|---|---:|---:|---:|---:|---:|',
    ...MODES.map(
      (mode) =>
        `| ${mode} | ${perMode[mode].present} | ${perMode[mode].missing} | ${perMode[mode].decodeFail} | ${perMode[mode].prefixMismatch} | ${perMode[mode].nonPassStatus} |`
    ),
    '',
    '## Report Sources',
    '',
    ...MODES.map((mode) => `- ${mode}: ${summary.reportSources[mode]}`),
    '',
    `Missing entries: ${summary.missingCount}`,
    `Decode issues: ${summary.decodeIssueCount}`,
    `Dimension issues: ${summary.dimensionIssueCount}`,
    `Size parity issues: ${summary.sizeIssueCount}`,
    `Visual-hash parity issues: ${summary.visualHashIssueCount}`,
    '',
    `JSON: \`reports/gallery-artifacts/consistency-report.json\``,
  ].join('\n');

  const mdPath = path.join(ARTIFACTS_DIR, 'consistency-report.md');
  await fs.writeFile(mdPath, `${md}\n`);

  console.log('\n=== Gallery Consistency Comparison ===\n');
  console.log(`Total scenarios: ${summary.totalScenarios}`);
  console.log(`All modes present: ${summary.allModesPresentCount}/${summary.totalScenarios}`);
  console.log(
    `All modes decode+prefix OK: ${summary.allModesDecodePrefixOkCount}/${summary.totalScenarios}`
  );
  console.log(
    `All modes same dimensions: ${summary.allDimensionsAlignedCount}/${summary.totalScenarios}`
  );
  console.log(
    `All modes size parity: ${summary.allSizeParityCount}/${summary.totalScenarios} ` +
      `(static<=${summary.staticSizeRatioMax}x, animated<=${summary.animatedSizeRatioMax}x)`
  );
  console.log(
    `All modes visual-hash parity: ${summary.allVisualHashParityCount}/${summary.totalScenarios} ` +
      `(static<=${summary.staticVisualHashMaxBits} bits, animated<=${summary.animatedVisualHashMaxBits} bits)`
  );
  console.log(`Static exact hash (L=B=R): ${summary.staticExactAllThreeCount}`);
  console.log(`Animated exact hash (L=R): ${summary.animatedExactLocalRemoteCount}`);
  console.log(`\nJSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}\n`);

  if (
    summary.missingCount > 0 ||
    summary.decodeIssueCount > 0 ||
    summary.dimensionIssueCount > 0 ||
    summary.sizeIssueCount > 0 ||
    summary.visualHashIssueCount > 0
  ) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[compare-gallery-artifacts] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
