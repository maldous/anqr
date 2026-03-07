#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sendNotification } from './lib/notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_ROOT = path.join(PROJECT_ROOT, 'reports', 'nightly');

const PROFILE_ARG = process.argv.find((arg) => arg.startsWith('--profile=')) || '';
const PROFILE = PROFILE_ARG.split('=')[1] || 'full';

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function runStep(step, runDir) {
  const start = Date.now();
  const proc = spawnSync(step.cmd[0], step.cmd.slice(1), {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    env: process.env,
    timeout: step.timeoutMs,
  });

  const durationMs = Date.now() - start;
  const logPath = path.join(runDir, `${step.id}.log`);
  const out = [
    `# ${step.title}`,
    `command: ${step.cmd.join(' ')}`,
    `exitCode: ${proc.status ?? -1}`,
    `signal: ${proc.signal || ''}`,
    `durationMs: ${durationMs}`,
    '',
    '--- stdout ---',
    proc.stdout || '',
    '',
    '--- stderr ---',
    proc.stderr || '',
  ].join('\n');
  fs.writeFileSync(logPath, out);

  const ok = proc.status === 0;
  return {
    id: step.id,
    title: step.title,
    command: step.cmd.join(' '),
    critical: step.critical,
    status: ok ? 'PASS' : 'FAIL',
    exitCode: proc.status ?? -1,
    durationMs,
    logPath: path.relative(PROJECT_ROOT, logPath),
  };
}

function toMinutes(ms) {
  return Math.round((ms / 60000) * 10) / 10;
}

function main() {
  const stamp = new Date().toISOString().replace(/[:]/g, '-');
  const runDir = path.join(REPORTS_ROOT, stamp);
  ensureDir(runDir);

  const baseSteps = [
    {
      id: 'linear_guardian',
      title: 'Linear guardian enforcement (credit-aware lead + labels)',
      cmd: ['node', 'scripts/ops/linear-guardian.mjs', '--apply'],
      critical: true,
      timeoutMs: 3 * 60_000,
    },
    {
      id: 'typecheck',
      title: 'TypeScript typecheck',
      cmd: ['npm', 'run', '-s', 'typecheck'],
      critical: true,
      timeoutMs: 20 * 60_000,
    },
    {
      id: 'services_validate',
      title: 'External services validation',
      cmd: ['npm', 'run', '-s', 'validate:services'],
      critical: false,
      timeoutMs: 20 * 60_000,
    },
    {
      id: 'sentry_regression',
      title: 'Sentry unresolved regression check',
      cmd: ['npm', 'run', '-s', 'check:sentry'],
      critical: false,
      timeoutMs: 10 * 60_000,
    },
    {
      id: 'groq_free_audit',
      title: 'Groq free-tier auxiliary audit',
      cmd: ['node', 'scripts/ops/groq-free-audit.mjs'],
      critical: false,
      timeoutMs: 3 * 60_000,
    },
    {
      id: 'gemini_free_audit',
      title: 'Gemini free-tier auxiliary audit',
      cmd: ['node', 'scripts/ops/gemini-free-audit.mjs'],
      critical: false,
      timeoutMs: 3 * 60_000,
    },
    {
      id: 'hugging_free_audit',
      title: 'Hugging Face free-tier auxiliary audit',
      cmd: ['node', 'scripts/ops/hugging-free-audit.mjs'],
      critical: false,
      timeoutMs: 3 * 60_000,
    },
    {
      id: 'ollama_local_audit',
      title: 'Ollama local GPU audit',
      cmd: ['node', 'scripts/ops/ollama-local-audit.mjs'],
      critical: false,
      timeoutMs: 3 * 60_000,
    },
    {
      id: 'harness_continuous',
      title: 'Harness report (continuous profile)',
      cmd: ['node', 'scripts/ops/harness-report.mjs', '--profile=continuous'],
      critical: false,
      timeoutMs: 10 * 60_000,
    },
  ];

  const fullOnlySteps = [
    {
      id: 'unit_tests',
      title: 'Unit test suite',
      cmd: ['npm', 'run', '-s', 'test:unit:ci'],
      critical: true,
      timeoutMs: 45 * 60_000,
    },
    {
      id: 'harness_full',
      title: 'Harness report (full profile)',
      cmd: ['node', 'scripts/ops/harness-report.mjs', '--profile=full'],
      critical: false,
      timeoutMs: 30 * 60_000,
    },
  ];

  const steps = PROFILE === 'continuous' ? baseSteps : [...baseSteps, ...fullOnlySteps];

  const startedAt = new Date().toISOString();
  const results = steps.map((step) => runStep(step, runDir));
  const finishedAt = new Date().toISOString();

  const criticalFailed = results.filter((r) => r.critical && r.status === 'FAIL');
  const nonCriticalFailed = results.filter((r) => !r.critical && r.status === 'FAIL');

  const summary = {
    startedAt,
    finishedAt,
    totalMinutes: toMinutes(new Date(finishedAt).getTime() - new Date(startedAt).getTime()),
    ok: criticalFailed.length === 0,
    criticalFailed: criticalFailed.map((r) => r.id),
    nonCriticalFailed: nonCriticalFailed.map((r) => r.id),
    results,
    reportDir: path.relative(PROJECT_ROOT, runDir),
  };

  const summaryJsonPath = path.join(runDir, 'summary.json');
  const summaryMdPath = path.join(runDir, 'summary.md');
  fs.writeFileSync(summaryJsonPath, JSON.stringify(summary, null, 2) + '\n');

  const lines = [];
  lines.push(
    PROFILE === 'continuous' ? '# ANQR Continuous Ops Summary' : '# ANQR Nightly Ops Summary'
  );
  lines.push('');
  lines.push(`- Started: ${startedAt}`);
  lines.push(`- Finished: ${finishedAt}`);
  lines.push(`- Duration: ${summary.totalMinutes} minutes`);
  lines.push(`- Profile: ${PROFILE}`);
  lines.push(`- Critical status: ${summary.ok ? 'PASS' : 'FAIL'}`);
  lines.push('');
  lines.push('| Step | Status | Critical | Log |');
  lines.push('| --- | --- | --- | --- |');
  for (const r of results) {
    lines.push(`| ${r.id} | ${r.status} | ${r.critical ? 'yes' : 'no'} | ${r.logPath} |`);
  }
  lines.push('');
  if (criticalFailed.length > 0) {
    lines.push('## Critical Failures');
    for (const r of criticalFailed) lines.push(`- ${r.id} (${r.logPath})`);
    lines.push('');
  }
  if (nonCriticalFailed.length > 0) {
    lines.push('## Non-Critical Failures');
    for (const r of nonCriticalFailed) lines.push(`- ${r.id} (${r.logPath})`);
    lines.push('');
  }

  fs.writeFileSync(summaryMdPath, lines.join('\n'));

  const latestPath = path.join(REPORTS_ROOT, 'latest.json');
  fs.writeFileSync(latestPath, JSON.stringify(summary, null, 2) + '\n');

  // Email notification for notable events
  if (!summary.ok) {
    sendNotification({
      subject: `${PROFILE} ops failed: ${criticalFailed.map((r) => r.id).join(', ')}`,
      body: lines.join('\n'),
      severity: 'critical',
    });
  } else if (PROFILE === 'full') {
    sendNotification({
      subject: 'Nightly ops passed — all checks green',
      body: lines.join('\n'),
      severity: 'info',
    });
  }

  console.log(JSON.stringify(summary, null, 2));
  process.exit(summary.ok ? 0 : 1);
}

try {
  main();
} catch (err) {
  console.error(err.stack || err.message);
  process.exit(1);
}
