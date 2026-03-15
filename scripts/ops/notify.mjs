#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * notify.mjs — Notification dispatch
 *
 * Sends summary notifications after harness/guardian runs.
 *
 * Channels:
 *   stdout  — always (for systemd journal capture)
 *
 * Input:
 *   Reads reports/latest.json for harness summary.
 *
 * Usage:
 *   node scripts/ops/notify.mjs --channel=stdout
 *   node scripts/ops/notify.mjs --channel=stdout --dry-run
 *
 * Exit code:
 *   0 = notification sent
 *   1 = error reading report or sending notification
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const REPORT_PATH = resolve(ROOT, 'reports/latest.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  return { dryRun };
}

function formatStdout(report) {
  const { profile, timestamp, total_duration_ms, summary, checks } = report;
  const timing = (total_duration_ms / 1000).toFixed(1);

  const lines = [
    `[notify] Harness report summary`,
    `[notify] Profile: ${profile} | Time: ${timestamp} | Duration: ${timing}s`,
    `[notify] Result: ${summary.passed}/${summary.total} passed, ${summary.failed} failed`,
    '',
  ];

  for (const check of checks) {
    const icon = check.pass ? '✅' : '❌';
    const t = check.duration_ms > 1000
      ? `${(check.duration_ms / 1000).toFixed(1)}s`
      : `${check.duration_ms}ms`;
    lines.push(`  ${icon} ${check.name} (${t})`);
  }

  return lines.join('\n');
}

async function main() {
  const { dryRun } = parseArgs();

  console.log(`[notify]${dryRun ? ' (DRY RUN)' : ''} channel=stdout\n`);

  if (!existsSync(REPORT_PATH)) {
    console.error(`[notify] No report found at ${REPORT_PATH}`);
    console.error('[notify] Run harness-report.mjs first.');
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));

  console.log(formatStdout(report));

  console.log('\n[notify] done');
  process.exit(0);
}

main();
