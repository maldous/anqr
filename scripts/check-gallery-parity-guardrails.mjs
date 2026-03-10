#!/usr/bin/env node

/**
 * CI-safe policy gate for gallery parity drift reports.
 *
 * This script reads reports/gallery-artifacts/consistency-report.json and enforces
 * thresholded parity policy when the report exists. If no report exists, it exits 0
 * so regular CI pipelines do not fail on heavyweight gallery generation.
 *
 * Env:
 *   GALLERY_PARITY_REPORT_PATH                 JSON report path override
 *   GALLERY_PARITY_REQUIRED_MODES              Comma list, default: local,browser,remote
 *   GALLERY_PARITY_MIN_PRESENT_RATIO           default: 1
 *   GALLERY_PARITY_MIN_DECODE_RATIO            default: 1
 *   GALLERY_PARITY_MIN_DIMENSION_RATIO         default: 1
 *   GALLERY_PARITY_MIN_SIZE_PARITY_RATIO       default: 0.98
 *   GALLERY_PARITY_MIN_VISUAL_HASH_RATIO       default: 0.98
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.resolve(
  process.env.GALLERY_PARITY_REPORT_PATH ||
    path.join(ROOT, 'reports', 'gallery-artifacts', 'consistency-report.json')
);

function parseRatio(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseFloat(raw);
  if (!Number.isFinite(value)) return fallback;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

function fmtPct(value) {
  return `${(value * 100).toFixed(2)}%`;
}

async function loadJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

async function main() {
  try {
    await fs.access(REPORT_PATH);
  } catch {
    console.log(
      `[gallery-parity-guard] skipped: report not found (${path.relative(ROOT, REPORT_PATH)})`
    );
    process.exit(0);
  }

  const requiredModes = String(process.env.GALLERY_PARITY_REQUIRED_MODES || 'local,browser,remote')
    .split(',')
    .map((m) => m.trim())
    .filter(Boolean);

  const minPresentRatio = parseRatio('GALLERY_PARITY_MIN_PRESENT_RATIO', 1);
  const minDecodeRatio = parseRatio('GALLERY_PARITY_MIN_DECODE_RATIO', 1);
  const minDimensionRatio = parseRatio('GALLERY_PARITY_MIN_DIMENSION_RATIO', 1);
  const minSizeParityRatio = parseRatio('GALLERY_PARITY_MIN_SIZE_PARITY_RATIO', 0.98);
  const minVisualHashRatio = parseRatio('GALLERY_PARITY_MIN_VISUAL_HASH_RATIO', 0.98);

  const report = await loadJson(REPORT_PATH);
  const summary = report?.summary || {};
  const totalScenarios = Math.max(1, Number(summary.totalScenarios || 0));
  const perMode = summary.perMode || {};

  const presentRatio = Number(summary.allModesPresentCount || 0) / totalScenarios;
  const decodeRatio = Number(summary.allModesDecodePrefixOkCount || 0) / totalScenarios;
  const dimensionRatio = Number(summary.allDimensionsAlignedCount || 0) / totalScenarios;
  const sizeRatio = Number(summary.allSizeParityCount || 0) / totalScenarios;
  const visualHashRatio = Number(summary.allVisualHashParityCount || 0) / totalScenarios;

  const failures = [];
  for (const mode of requiredModes) {
    if (!Object.prototype.hasOwnProperty.call(perMode, mode)) {
      failures.push(`missing required mode in report summary: ${mode}`);
    }
  }

  if (presentRatio < minPresentRatio) {
    failures.push(
      `all-modes present ratio ${fmtPct(presentRatio)} below threshold ${fmtPct(minPresentRatio)}`
    );
  }
  if (decodeRatio < minDecodeRatio) {
    failures.push(
      `decode+payload ratio ${fmtPct(decodeRatio)} below threshold ${fmtPct(minDecodeRatio)}`
    );
  }
  if (dimensionRatio < minDimensionRatio) {
    failures.push(
      `dimension parity ratio ${fmtPct(dimensionRatio)} below threshold ${fmtPct(minDimensionRatio)}`
    );
  }
  if (sizeRatio < minSizeParityRatio) {
    failures.push(
      `size parity ratio ${fmtPct(sizeRatio)} below threshold ${fmtPct(minSizeParityRatio)}`
    );
  }
  if (visualHashRatio < minVisualHashRatio) {
    failures.push(
      `visual-hash parity ratio ${fmtPct(visualHashRatio)} below threshold ${fmtPct(minVisualHashRatio)}`
    );
  }

  console.log('[gallery-parity-guard] policy rationale:');
  console.log(
    '- exact byte hashes are brittle across renderers; perceptual hash thresholds absorb encoder/platform noise while still detecting visual drift'
  );
  console.log(
    '- guard is CI-safe: absence of heavy parity artifacts skips cleanly, but existing reports are enforced strictly'
  );
  console.log(`- report: ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`- present ratio: ${fmtPct(presentRatio)} (min ${fmtPct(minPresentRatio)})`);
  console.log(`- decode ratio: ${fmtPct(decodeRatio)} (min ${fmtPct(minDecodeRatio)})`);
  console.log(`- dimension ratio: ${fmtPct(dimensionRatio)} (min ${fmtPct(minDimensionRatio)})`);
  console.log(`- size ratio: ${fmtPct(sizeRatio)} (min ${fmtPct(minSizeParityRatio)})`);
  console.log(`- visual hash ratio: ${fmtPct(visualHashRatio)} (min ${fmtPct(minVisualHashRatio)})`);
  if (summary.staticVisualHashMaxBits != null || summary.animatedVisualHashMaxBits != null) {
    console.log(
      `- visual hash thresholds: static<=${summary.staticVisualHashMaxBits ?? 'n/a'} bits, animated<=${summary.animatedVisualHashMaxBits ?? 'n/a'} bits`
    );
  }

  if (failures.length > 0) {
    console.error('\n[gallery-parity-guard] FAILED');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\n[gallery-parity-guard] passed');
}

main().catch((err) => {
  console.error('[gallery-parity-guard] Fatal:', err?.stack ?? err);
  process.exitCode = 1;
});
