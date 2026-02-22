#!/usr/bin/env node

/**
 * Compare gallery artifacts across local/browser/remote renderers.
 *
 * Inputs:
 *   reports/gallery-artifacts/{local,browser,remote}/report.json
 *   reports/gallery-artifacts/{local,browser,remote}/*.{png,gif,webp,jpg}
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
const MODES = ['local', 'browser', 'remote'];

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
    width,
    height,
    decodePass,
    decodedPrefixOk,
    decodeReason,
  };
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
  const configs = generateAllScenarios();

  const modeReports = {};
  const modeResultMaps = {};

  for (const mode of MODES) {
    const reportPath = path.join(ARTIFACTS_DIR, mode, 'report.json');
    if (!(await exists(reportPath))) {
      throw new Error(`Missing report: ${reportPath}`);
    }
    const report = await readJson(reportPath);
    modeReports[mode] = report;
    modeResultMaps[mode] = new Map((report.results || []).map((r) => [r.id, r]));
  }

  const perMode = Object.fromEntries(
    MODES.map((mode) => [
      mode,
      { present: 0, missing: 0, decodeFail: 0, prefixMismatch: 0, nonPassStatus: 0 },
    ]),
  );

  let allPresent = 0;
  let allDecodedPrefixOk = 0;
  let staticExactAllThree = 0;
  let animatedExactLocalRemote = 0;

  const missing = [];
  const decodeIssues = [];
  const rows = [];

  for (const config of configs) {
    const row = { id: config.id, category: config.category, isAnimated: !!config.isAnimated, modes: {} };
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
        if (shas.local && shas.browser && shas.remote && shas.local === shas.browser && shas.local === shas.remote) {
          staticExactAllThree++;
        }
      } else if (shas.local && shas.remote && shas.local === shas.remote) {
        animatedExactLocalRemote++;
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
    perMode,
    missingCount: missing.length,
    decodeIssueCount: decodeIssues.length,
  };

  const jsonReport = { summary, missing, decodeIssues, rows };
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
    `- Static exact hash (local=browser=remote): ${summary.staticExactAllThreeCount}`,
    `- Animated exact hash (local=remote): ${summary.animatedExactLocalRemoteCount}`,
    '',
    '## Per Mode',
    '',
    '| Mode | Present | Missing | Decode Fail | Prefix Mismatch | Non-Pass in report.json |',
    '|---|---:|---:|---:|---:|---:|',
    ...MODES.map(
      (mode) =>
        `| ${mode} | ${perMode[mode].present} | ${perMode[mode].missing} | ${perMode[mode].decodeFail} | ${perMode[mode].prefixMismatch} | ${perMode[mode].nonPassStatus} |`,
    ),
    '',
    `Missing entries: ${summary.missingCount}`,
    `Decode issues: ${summary.decodeIssueCount}`,
    '',
    `JSON: \`reports/gallery-artifacts/consistency-report.json\``,
  ].join('\n');

  const mdPath = path.join(ARTIFACTS_DIR, 'consistency-report.md');
  await fs.writeFile(mdPath, `${md}\n`);

  console.log('\n=== Gallery Consistency Comparison ===\n');
  console.log(`Total scenarios: ${summary.totalScenarios}`);
  console.log(`All modes present: ${summary.allModesPresentCount}/${summary.totalScenarios}`);
  console.log(
    `All modes decode+prefix OK: ${summary.allModesDecodePrefixOkCount}/${summary.totalScenarios}`,
  );
  console.log(`Static exact hash (L=B=R): ${summary.staticExactAllThreeCount}`);
  console.log(`Animated exact hash (L=R): ${summary.animatedExactLocalRemoteCount}`);
  console.log(`\nJSON: ${jsonPath}`);
  console.log(`MD:   ${mdPath}\n`);

  if (summary.missingCount > 0 || summary.decodeIssueCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('[compare-gallery-artifacts] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
