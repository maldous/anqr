#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * nightly-ops-pass.mjs — Nightly operations orchestration
 *
 * Orchestrates the full nightly pipeline:
 *   1. Run harness-report.mjs (full profile)
 *   2. AST density audit (detailed standalone output)
 *   3. Sonar scanner analysis + report export
 *   4. Sonar Linear audit (blocking — creates critical issues)
 *   5. Run symphony-queue-control.mjs (--all)
 *   6. Run linear-guardian.mjs
 *   7. Run notify.mjs
 *   8. Archive report to reports/ with timestamp
 *
 * Designed to run under systemd timer (see services/systemd/).
 *
 * Legacy lesson: PATH and runtime environment under systemd differ from
 * interactive shells. The systemd unit must set explicit PATH, HOME, and
 * NODE_PATH to avoid nightly failures.
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/nightly-ops-pass.mjs
 *   LINEAR_API_KEY=... node scripts/ops/nightly-ops-pass.mjs --dry-run
 *
 * Exit code:
 *   0 = all steps completed (some checks may have failed)
 *   1 = orchestration error
 */

import { execSync } from 'node:child_process';
import { existsSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..', '..');
const REPORTS_DIR = resolve(ROOT, 'reports');
const LATEST_REPORT = resolve(REPORTS_DIR, 'latest.json');

const dryRun = process.argv.includes('--dry-run');
const dryRunFlag = dryRun ? ' --dry-run' : '';

const steps = [];

function runStep(name, command, timeout = 300_000) {
  const start = Date.now();
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[nightly] Step: ${name}`);
  console.log(`[nightly] Command: ${command}`);
  console.log('='.repeat(60) + '\n');

  let exitCode = 0;
  try {
    execSync(command, {
      cwd: ROOT,
      stdio: 'inherit',
      timeout,
      env: { ...process.env, FORCE_COLOR: '0' },
    });
  } catch (err) {
    exitCode = err.status || 1;
  }

  const duration_ms = Date.now() - start;
  const result = { name, exitCode, duration_ms };
  steps.push(result);

  const icon = exitCode === 0 ? '✅' : '⚠️';
  const timing = duration_ms > 1000
    ? `${(duration_ms / 1000).toFixed(1)}s`
    : `${duration_ms}ms`;
  console.log(`\n${icon} [nightly] ${name}: exit=${exitCode} (${timing})`);

  return exitCode;
}

function archiveReport() {
  if (!existsSync(LATEST_REPORT)) {
    console.log('[nightly] No report to archive');
    return;
  }

  const archiveDir = resolve(REPORTS_DIR, 'archive');
  if (!existsSync(archiveDir)) {
    mkdirSync(archiveDir, { recursive: true });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
  const archivePath = resolve(archiveDir, `report-${ts}.json`);
  copyFileSync(LATEST_REPORT, archivePath);
  console.log(`[nightly] Report archived to reports/archive/report-${ts}.json`);
}

function printSummary() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('[nightly] Pipeline summary');
  console.log('='.repeat(60));

  const totalDuration = steps.reduce((sum, s) => sum + s.duration_ms, 0);
  const passed = steps.filter((s) => s.exitCode === 0).length;
  const failed = steps.filter((s) => s.exitCode !== 0).length;

  for (const step of steps) {
    const icon = step.exitCode === 0 ? '✅' : '⚠️';
    const timing = step.duration_ms > 1000
      ? `${(step.duration_ms / 1000).toFixed(1)}s`
      : `${step.duration_ms}ms`;
    console.log(`  ${icon} ${step.name}: exit=${step.exitCode} (${timing})`);
  }

  console.log(`\n[nightly] ${passed}/${steps.length} steps clean, ${failed} with warnings (${(totalDuration / 1000).toFixed(1)}s total)`);
}

async function main() {
  const startTime = Date.now();
  console.log(`[nightly]${dryRun ? ' (DRY RUN)' : ''} starting at ${new Date().toISOString()}`);
  console.log(`[nightly] project root: ${ROOT}`);

  // Step 1: Harness report (full profile)
  // Exit code 1 is expected if checks fail — continue regardless
  runStep('harness-report', 'node scripts/ops/harness-report.mjs full');

  // Step 2: AST density audit (standalone — detailed output for nightly log)
  // The script exits 0 even with violations (output on stdout), so pipe through
  // a check that fails if any output is produced.
  runStep('ast-density', 'bash -c \'output=$(node scripts/audit-ast-density.mjs --threshold 1); if [ -n "$output" ]; then echo "$output"; exit 1; fi\'');

  // Step 3: Sonar scanner analysis + report export
  // Sonar scanner can take 10+ minutes on a full codebase — use extended timeout
  if (process.env.SONAR_TOKEN) {
    runStep('sonar-scan', "NODE_OPTIONS='' SONAR_SCANNER_OPTS='-Xms128m -Xmx256m' sonar-scanner", 600_000);
    runStep('sonar-export', 'bash scripts/sonar-export.sh');

    // Step 4: Sonar Linear audit (blocking — creates/updates critical Linear issues)
    if (!dryRun) {
      runStep('sonar-linear-audit', 'node scripts/ops/sonar-linear-audit.mjs');
    } else {
      console.log('\n[nightly] (DRY RUN) Skipping sonar-linear-audit — would create/update Linear issues');
    }
  } else {
    console.log('\n[nightly] SONAR_TOKEN not set — skipping sonar steps');
  }

  // Step 5: Queue control (feed, drain, enforce)
  runStep('queue-control', `node scripts/ops/symphony-queue-control.mjs --all${dryRunFlag}`);

  // Step 6: Guardian (process harness failures)
  runStep('guardian', `node scripts/ops/linear-guardian.mjs${dryRunFlag}`);

  // Step 7: Notify (dispatch summary)
  runStep('notify', `node scripts/ops/notify.mjs --channel=all${dryRunFlag}`);

  // Step 8: Archive report
  console.log(`\n${'='.repeat(60)}`);
  console.log('[nightly] Step: archive-report');
  console.log('='.repeat(60));
  archiveReport();

  // Summary
  printSummary();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n[nightly] completed in ${totalTime}s at ${new Date().toISOString()}`);
  process.exit(0);
}

main();
