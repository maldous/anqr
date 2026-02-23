#!/usr/bin/env node

// =============================================================================
// ANQR Sentry Regression Monitor
// =============================================================================
// Checks all Sentry projects for unresolved issues. Exits non-zero if any exist.
//
// Usage:
//   node scripts/check-sentry-regression.mjs
//
// Environment variables:
//   SENTRY_TOKEN — Sentry API bearer token (required for check to run)
//
// Exit codes:
//   0 — no unresolved issues (or SENTRY_TOKEN not set — skipped with warning)
//   1 — one or more unresolved issues found
// =============================================================================

import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

const SENTRY_ORG = 'anqr';
const SENTRY_PROJECTS = ['anqr-web', 'anqr-mobile', 'anqr-api'];
const REQUEST_TIMEOUT_MS = 10_000;
const ISSUES_PER_PROJECT = 25;

function httpsGet(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(
      url,
      {
        headers: { 'User-Agent': 'ANQR-SentryCheck/1.0', ...extraHeaders },
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf-8'),
          });
        });
      }
    );
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout after ${REQUEST_TIMEOUT_MS}ms: ${url}`));
    });
    req.on('error', reject);
  });
}

function safeJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function truncate(str, maxLen) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen - 1) + '\u2026';
}

async function fetchUnresolvedIssues(project, headers) {
  const url = `https://sentry.io/api/0/projects/${SENTRY_ORG}/${project}/issues/?query=is:unresolved&limit=${ISSUES_PER_PROJECT}`;
  const res = await httpsGet(url, headers);

  if (res.statusCode !== 200) {
    const data = safeJSON(res.body);
    const detail = data?.detail || `HTTP ${res.statusCode}`;
    throw new Error(`API error for ${project}: ${detail}`);
  }

  const issues = safeJSON(res.body);
  if (!Array.isArray(issues)) {
    throw new Error(`Unexpected response for ${project}: not an array`);
  }

  return issues.map((issue) => ({
    id: issue.id,
    shortId: issue.shortId || '',
    title: issue.title || '(untitled)',
    culprit: issue.culprit || '',
    level: issue.level || 'error',
    count: Number(issue.count) || 0,
    userCount: Number(issue.userCount) || 0,
    firstSeen: issue.firstSeen || '',
    lastSeen: issue.lastSeen || '',
  }));
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toISOString().replace('T', ' ').slice(0, 19);
}

async function main() {
  const startTime = Date.now();

  console.log('');
  console.log('============================================');
  console.log('ANQR Sentry Regression Monitor');
  console.log('============================================');
  console.log('');

  const token = process.env.SENTRY_TOKEN;
  if (!token) {
    console.log('⚠️  SENTRY_TOKEN not set — skipping Sentry regression check');
    console.log('');
    process.exit(0);
  }

  const headers = { Authorization: `Bearer ${token}` };
  const report = {
    title: 'ANQR Sentry Regression Monitor',
    generated: new Date().toISOString(),
    durationMs: 0,
    projects: {},
    totalUnresolved: 0,
    passed: false,
  };

  let totalUnresolved = 0;

  for (const project of SENTRY_PROJECTS) {
    try {
      const issues = await fetchUnresolvedIssues(project, headers);
      report.projects[project] = { status: 'ok', unresolved: issues.length, issues };
      totalUnresolved += issues.length;

      if (issues.length === 0) {
        console.log(`✓ ${project}: 0 unresolved issues`);
      } else {
        console.log(
          `✗ ${project}: ${issues.length} unresolved issue${issues.length === 1 ? '' : 's'}`
        );
        for (const issue of issues) {
          console.log(`    ${issue.shortId || issue.id}  ${truncate(issue.title, 60)}`);
          console.log(
            `      Events: ${issue.count}  Users: ${issue.userCount}  Level: ${issue.level}`
          );
          console.log(
            `      First: ${formatDate(issue.firstSeen)}  Last: ${formatDate(issue.lastSeen)}`
          );
          if (issue.culprit) {
            console.log(`      Culprit: ${truncate(issue.culprit, 70)}`);
          }
        }
      }
    } catch (e) {
      console.log(`⚠ ${project}: ${e.message}`);
      report.projects[project] = { status: 'error', error: e.message, unresolved: 0, issues: [] };
    }
  }

  report.totalUnresolved = totalUnresolved;
  report.passed = totalUnresolved === 0;
  report.durationMs = Date.now() - startTime;

  // Summary
  console.log('');
  if (totalUnresolved === 0) {
    console.log('✓ Sentry regression check PASSED — 0 unresolved issues');
  } else {
    console.log(
      `✗ Sentry regression check FAILED — ${totalUnresolved} unresolved issue${totalUnresolved === 1 ? '' : 's'} across ${SENTRY_PROJECTS.length} projects`
    );
  }
  console.log('');

  // Write report
  const reportsDir = path.join(PROJECT_ROOT, 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }
  const reportPath = path.join(reportsDir, 'sentry-regression.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
  console.log(`Report written to: ${path.relative(PROJECT_ROOT, reportPath)}`);
  console.log('');

  process.exit(totalUnresolved > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
