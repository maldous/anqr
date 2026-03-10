#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'reliability-gate');

const CRITERIA = [
  {
    id: 'typecheck',
    title: 'TypeScript typecheck passes',
    command: ['npm', 'run', '-s', 'typecheck'],
    timeoutMs: 10 * 60_000,
    required: true,
  },
  {
    id: 'unit_tests',
    title: 'Unit test suite passes',
    command: ['npm', 'run', '-s', 'test:unit:ci'],
    timeoutMs: 20 * 60_000,
    required: true,
  },
  {
    id: 'i18n_regression',
    title: 'i18n regression guard passes',
    command: ['npm', 'run', '-s', 'test:i18n'],
    timeoutMs: 10 * 60_000,
    required: true,
  },
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function runCriterion(criterion) {
  const start = Date.now();
  const proc = spawnSync(criterion.command[0], criterion.command.slice(1), {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    env: process.env,
    timeout: criterion.timeoutMs,
  });
  const durationMs = Date.now() - start;

  return {
    id: criterion.id,
    title: criterion.title,
    required: criterion.required,
    command: criterion.command.join(' '),
    status: proc.status === 0 ? 'PASS' : 'FAIL',
    exitCode: proc.status ?? -1,
    signal: proc.signal || null,
    durationMs,
    stdout: proc.stdout || '',
    stderr: proc.stderr || '',
  };
}

function writeReport(report) {
  ensureDir(REPORTS_DIR);
  const stamp = report.startedAt.replace(/[:]/g, '-');
  const timestampedPath = path.join(REPORTS_DIR, `${stamp}.json`);
  const latestPath = path.join(REPORTS_DIR, 'latest.json');

  fs.writeFileSync(timestampedPath, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(latestPath, JSON.stringify(report, null, 2) + '\n');
}

function main() {
  const startedAt = new Date().toISOString();
  const criteriaResults = CRITERIA.map(runCriterion);
  const finishedAt = new Date().toISOString();
  const durationMs = new Date(finishedAt).getTime() - new Date(startedAt).getTime();

  const failedRequired = criteriaResults.filter((c) => c.required && c.status !== 'PASS');
  const overall = failedRequired.length === 0 ? 'PASS' : 'FAIL';

  const report = {
    startedAt,
    finishedAt,
    durationMs,
    overall,
    summary: {
      totalCriteria: criteriaResults.length,
      requiredCriteria: criteriaResults.filter((c) => c.required).length,
      failedRequired: failedRequired.map((c) => c.id),
    },
    criteria: criteriaResults.map((result) => ({
      id: result.id,
      title: result.title,
      required: result.required,
      command: result.command,
      status: result.status,
      exitCode: result.exitCode,
      signal: result.signal,
      durationMs: result.durationMs,
    })),
  };

  writeReport(report);

  for (const result of criteriaResults) {
    const logPath = path.join(REPORTS_DIR, `${result.id}.log`);
    const logBody = [
      `# ${result.title}`,
      `id: ${result.id}`,
      `required: ${result.required}`,
      `command: ${result.command}`,
      `status: ${result.status}`,
      `exitCode: ${result.exitCode}`,
      `signal: ${result.signal || ''}`,
      `durationMs: ${result.durationMs}`,
      '',
      '--- stdout ---',
      result.stdout,
      '',
      '--- stderr ---',
      result.stderr,
      '',
    ].join('\n');
    fs.writeFileSync(logPath, logBody);
  }

  console.log(JSON.stringify(report, null, 2));
  console.error(`Reliability gate: ${overall}`);
  process.exit(overall === 'PASS' ? 0 : 1);
}

main();
