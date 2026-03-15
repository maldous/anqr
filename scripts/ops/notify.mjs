#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * notify.mjs — Notification dispatch
 *
 * Sends summary notifications after harness/guardian runs.
 *
 * Channels:
 *   stdout  — always (for systemd journal capture)
 *   email   — via msmtp (to matthew.aldous@gmail.com)
 *
 * Input:
 *   Reads reports/latest.json for harness summary.
 *
 * Usage:
 *   node scripts/ops/notify.mjs --channel=stdout
 *   node scripts/ops/notify.mjs --channel=email
 *   node scripts/ops/notify.mjs --channel=all
 *   node scripts/ops/notify.mjs --channel=all --dry-run
 *
 * Exit code:
 *   0 = notification sent
 *   1 = error reading report or sending notification
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sendNotification } from './lib/notify.mjs';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const REPORT_PATH = resolve(ROOT, 'reports/latest.json');

function parseArgs() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const channelArg = args.find((a) => a.startsWith('--channel='));
  const channel = channelArg ? channelArg.split('=')[1] : 'all';
  return { dryRun, channel };
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

function formatEmailBody(report) {
  const { profile, timestamp, total_duration_ms, summary, checks } = report;
  const failures = checks.filter((c) => !c.pass);
  const passes = checks.filter((c) => c.pass);
  const timing = (total_duration_ms / 1000).toFixed(1);

  const lines = [
    `Nightly Harness Report`,
    `======================`,
    '',
    `Profile:  ${profile}`,
    `Time:     ${timestamp}`,
    `Duration: ${timing}s`,
    `Result:   ${summary.passed}/${summary.total} passed, ${summary.failed} failed`,
    '',
  ];

  if (failures.length > 0) {
    lines.push('FAILURES:', '');
    for (const check of failures) {
      const t = check.duration_ms > 1000
        ? `${(check.duration_ms / 1000).toFixed(1)}s`
        : `${check.duration_ms}ms`;
      lines.push(`  ❌ ${check.name} (${t}): ${check.detail.split('\n')[0]}`);
    }
    lines.push('');
  }

  if (passes.length > 0) {
    lines.push('PASSED:', '');
    for (const check of passes) {
      lines.push(`  ✅ ${check.name}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

async function main() {
  const { dryRun, channel } = parseArgs();

  console.log(`[notify]${dryRun ? ' (DRY RUN)' : ''} channel=${channel}\n`);

  if (!existsSync(REPORT_PATH)) {
    console.error(`[notify] No report found at ${REPORT_PATH}`);
    console.error('[notify] Run harness-report.mjs first.');
    process.exit(1);
  }

  const report = JSON.parse(readFileSync(REPORT_PATH, 'utf-8'));

  // stdout channel
  if (channel === 'stdout' || channel === 'all') {
    console.log(formatStdout(report));
  }

  // email channel
  if (channel === 'email' || channel === 'all') {
    const severity = report.summary.failed > 0 ? 'warn' : 'info';
    const subject = `Nightly report: ${report.summary.passed}/${report.summary.total} passed`;

    if (dryRun) {
      console.log(`[notify] [DRY RUN] Would send email: ${subject}`);
    } else {
      const result = sendNotification({
        subject,
        body: formatEmailBody(report),
        severity,
      });
      if (result.sent) {
        console.log('[notify] Email sent ✅');
      } else {
        console.log(`[notify] Email not sent: ${result.reason}`);
      }
    }
  }

  console.log('\n[notify] done');
  process.exit(0);
}

main();
