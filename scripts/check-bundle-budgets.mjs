#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const assetsDir = path.join(root, 'dist', 'assets');
const reportJsonPath = path.join(root, 'reports', 'bundle-budget.json');
const reportMdPath = path.join(root, 'reports', 'bundle-budget.md');

function toKiB(bytes) {
  return bytes / 1024;
}

function readBudget(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function sumBytes(files) {
  let total = 0;
  for (const file of files) {
    const stat = fs.statSync(path.join(assetsDir, file));
    total += stat.size;
  }
  return total;
}

function listJsFiles() {
  if (!fs.existsSync(assetsDir)) {
    throw new Error('dist/assets not found. Run `npm run build` first.');
  }
  return fs
    .readdirSync(assetsDir)
    .filter((name) => name.endsWith('.js'))
    .sort();
}

function buildMarkdown(report) {
  const lines = [
    '# Bundle Budget Report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Main entry: ${toKiB(report.metrics.mainEntryBytes).toFixed(1)} KiB (max ${report.budgets.mainEntryMaxKiB} KiB)`,
    `- Non-i18n total: ${toKiB(report.metrics.nonI18nBytes).toFixed(1)} KiB (max ${report.budgets.nonI18nMaxKiB} KiB)`,
    `- i18n total: ${toKiB(report.metrics.i18nBytes).toFixed(1)} KiB (warn ${report.budgets.i18nWarnKiB} KiB, max ${report.budgets.i18nMaxKiB} KiB)`,
    '',
    '## Status',
    '',
    `- Main entry: ${report.status.mainEntry}`,
    `- Non-i18n total: ${report.status.nonI18n}`,
    `- i18n total: ${report.status.i18n}`,
  ];

  return `${lines.join('\n')}\n`;
}

function main() {
  const mainEntryMaxKiB = readBudget('BUNDLE_BUDGET_MAIN_ENTRY_KIB', 1000);
  const nonI18nMaxKiB = readBudget('BUNDLE_BUDGET_NON_I18N_TOTAL_KIB', 10000);
  const i18nWarnKiB = readBudget('BUNDLE_BUDGET_I18N_WARN_KIB', 25000);
  const i18nMaxKiB = readBudget('BUNDLE_BUDGET_I18N_MAX_KIB', 30000);

  const jsFiles = listJsFiles();
  const mainEntryCandidates = jsFiles.filter((name) => /^index-.*\.js$/u.test(name));

  if (mainEntryCandidates.length === 0) {
    throw new Error('No main entry chunk (index-*.js) found in dist/assets.');
  }

  const mainEntry = mainEntryCandidates[0];
  // Match i18n chunks: locale-*, static-*, and language-code-prefixed chunks
  // (e.g. es-419-HASH.js, en-GB-HASH.js produced by Rolldown for BCP 47 codes)
  const i18nPattern = /^(locale-|static-|[a-z]{2,3}-([A-Z]{2}|\d{3})-)/;
  const i18nFiles = jsFiles.filter((name) => i18nPattern.test(name));
  const nonI18nFiles = jsFiles.filter((name) => !i18nFiles.includes(name));

  const mainEntryBytes = fs.statSync(path.join(assetsDir, mainEntry)).size;
  const nonI18nBytes = sumBytes(nonI18nFiles);
  const i18nBytes = sumBytes(i18nFiles);

  const mainEntryStatus = toKiB(mainEntryBytes) <= mainEntryMaxKiB ? 'PASS' : 'FAIL';
  const nonI18nStatus = toKiB(nonI18nBytes) <= nonI18nMaxKiB ? 'PASS' : 'FAIL';
  const i18nKiB = toKiB(i18nBytes);
  const i18nStatus = i18nKiB <= i18nWarnKiB ? 'PASS' : i18nKiB <= i18nMaxKiB ? 'WARN' : 'FAIL';

  const report = {
    generatedAt: new Date().toISOString(),
    budgets: {
      mainEntryMaxKiB,
      nonI18nMaxKiB,
      i18nWarnKiB,
      i18nMaxKiB,
    },
    metrics: {
      mainEntry,
      mainEntryBytes,
      nonI18nBytes,
      i18nBytes,
      jsChunkCount: jsFiles.length,
      i18nChunkCount: i18nFiles.length,
      nonI18nChunkCount: nonI18nFiles.length,
    },
    status: {
      mainEntry: mainEntryStatus,
      nonI18n: nonI18nStatus,
      i18n: i18nStatus,
    },
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(reportMdPath, buildMarkdown(report));

  console.log(
    '[bundle-budget] main entry:',
    `${toKiB(mainEntryBytes).toFixed(1)} KiB`,
    `(${mainEntryStatus})`
  );
  console.log(
    '[bundle-budget] non-i18n total:',
    `${toKiB(nonI18nBytes).toFixed(1)} KiB`,
    `(${nonI18nStatus})`
  );
  console.log('[bundle-budget] i18n total:', `${i18nKiB.toFixed(1)} KiB`, `(${i18nStatus})`);

  if (mainEntryStatus === 'FAIL' || nonI18nStatus === 'FAIL' || i18nStatus === 'FAIL') {
    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('[bundle-budget] failed:', error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
