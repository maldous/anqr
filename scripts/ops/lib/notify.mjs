/**
 * ANQR Ops Email Notification Helper.
 *
 * Sends email notifications via msmtp with rate limiting and deduplication.
 * Used by nightly-ops-pass, symphony-runner, and email-ingest scripts.
 */
/* eslint-disable no-console */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const STATE_DIR = path.join(PROJECT_ROOT, 'reports', 'notify');
const RATE_LIMIT_FILE = path.join(STATE_DIR, 'state.json');

const RECIPIENT = process.env.ANQR_NOTIFY_EMAIL || 'matthew.aldous@gmail.com';
const MAX_PER_HOUR = 10;
const MAX_PER_DAY = 30;
const DEDUP_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadState() {
  try {
    return JSON.parse(fs.readFileSync(RATE_LIMIT_FILE, 'utf-8'));
  } catch {
    return { sends: [] };
  }
}

function saveState(state) {
  ensureDir(STATE_DIR);
  fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(state, null, 2) + '\n');
}

function checkRateLimit(state, subject) {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Clean old entries
  state.sends = state.sends.filter((s) => s.ts > oneDayAgo);

  // Check deduplication: same subject within window
  const duplicate = state.sends.find((s) => s.subject === subject && s.ts > now - DEDUP_WINDOW_MS);
  if (duplicate) {
    return { allowed: false, reason: `duplicate subject within ${DEDUP_WINDOW_MS / 60000}min` };
  }

  // Check hourly limit
  const hourCount = state.sends.filter((s) => s.ts > oneHourAgo).length;
  if (hourCount >= MAX_PER_HOUR) {
    return { allowed: false, reason: `hourly limit reached (${MAX_PER_HOUR}/h)` };
  }

  // Check daily limit
  if (state.sends.length >= MAX_PER_DAY) {
    return { allowed: false, reason: `daily limit reached (${MAX_PER_DAY}/d)` };
  }

  return { allowed: true };
}

const LINEAR_WORKSPACE = process.env.LINEAR_WORKSPACE || 'anqr';

/**
 * Return a direct URL to a Linear issue.
 * @param {string} identifier — e.g. "ANQ-245"
 */
export function linearIssueUrl(identifier) {
  return `https://linear.app/${LINEAR_WORKSPACE}/issue/${identifier}`;
}

/**
 * Format a single issue block for notification emails.
 * Includes identifier, title, optional metadata lines, snippet, and URL.
 *
 * @param {{ identifier: string, title?: string, snippet?: string, meta?: string[] }} opts
 */
export function formatIssueLine({ identifier, title, snippet, meta = [] }) {
  const url = linearIssueUrl(identifier);
  const parts = [`• ${identifier}`];
  if (title) parts[0] += `: ${title}`;
  for (const line of meta) {
    const text = String(line || '').trim();
    if (text) parts.push(`  ${text}`);
  }
  parts.push(`  ${url}`);
  if (snippet) {
    const trimmed = snippet.replace(/\s+/g, ' ').trim();
    const preview = trimmed.length > 600 ? `${trimmed.slice(0, 597)}...` : trimmed;
    if (preview) parts.push(`  > ${preview}`);
  }
  return parts.join('\n');
}

/**
 * Send an email notification via msmtp.
 *
 * @param {{ subject: string, body: string, severity?: 'info' | 'warn' | 'critical' }} opts
 * @returns {{ sent: boolean, reason?: string }}
 */
export function sendNotification({ subject, body, severity = 'info' }) {
  const msmtpPath = spawnSync('which', ['msmtp'], { encoding: 'utf-8' });
  if (msmtpPath.status !== 0) {
    return { sent: false, reason: 'msmtp not found' };
  }

  const severityTag =
    severity === 'critical' ? '[CRITICAL] ' : severity === 'warn' ? '[WARN] ' : '';
  const formattedSubject = `[ANQR] ${severityTag}${subject}`;

  const state = loadState();
  const rateCheck = checkRateLimit(state, formattedSubject);
  if (!rateCheck.allowed) {
    console.error(`[notify] Rate-limited: ${rateCheck.reason} — skipping: ${formattedSubject}`);
    return { sent: false, reason: rateCheck.reason };
  }

  const timestamp = new Date().toISOString();
  const email = [
    `To: ${RECIPIENT}`,
    `From: ${RECIPIENT}`,
    `Subject: ${formattedSubject}`,
    'Content-Type: text/plain; charset=utf-8',
    `X-ANQR-Severity: ${severity}`,
    `X-ANQR-Timestamp: ${timestamp}`,
    '',
    body,
    '',
    '---',
    `Sent by ANQR Ops at ${timestamp}`,
  ].join('\n');

  const proc = spawnSync('msmtp', [RECIPIENT], {
    input: email,
    encoding: 'utf-8',
    timeout: 30_000,
  });

  if (proc.status !== 0) {
    const err = (proc.stderr || proc.error?.message || 'unknown error').trim();
    console.error(`[notify] msmtp failed (exit ${proc.status}): ${err}`);
    return { sent: false, reason: `msmtp exit ${proc.status}: ${err}` };
  }

  state.sends.push({ ts: Date.now(), subject: formattedSubject });
  saveState(state);
  console.error(`[notify] Sent: ${formattedSubject}`);
  return { sent: true };
}
