#!/usr/bin/env node

/**
 * ANQR Email Ingest — Bidirectional email interface.
 *
 * Syncs mail via mbsync, searches for unprocessed emails from/to email@anqr.link,
 * creates Linear issues from them, and tags them as processed.
 *
 * Designed to run every 5 minutes via systemd timer.
 *
 * Usage:
 *   node scripts/ops/email-ingest.mjs           # Process new emails
 *   node scripts/ops/email-ingest.mjs --dry-run  # Preview without creating issues
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createGql } from './lib/linear-client.mjs';
import { sendNotification } from './lib/notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'email-ingest');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'ANQ';
const INGEST_EMAIL = process.env.ANQR_INGEST_EMAIL || 'email@anqr.link';
const DRY_RUN = process.argv.includes('--dry-run');
const NOTMUCH_QUERY = `(from:${INGEST_EMAIL} OR to:${INGEST_EMAIL}) AND tag:inbox AND NOT tag:anqr-processed`;

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function run(cmd, args, opts = {}) {
  return spawnSync(cmd, args, {
    encoding: 'utf-8',
    timeout: 60_000,
    ...opts,
  });
}

function syncMail() {
  const which = run('which', ['mbsync']);
  if (which.status !== 0) return { ok: false, reason: 'mbsync not installed' };

  const proc = run('mbsync', ['gmail'], { timeout: 120_000 });
  if (proc.status !== 0) {
    const err = (proc.stderr || '').trim();
    if (/lock/i.test(err)) return { ok: false, reason: 'mbsync lock held (another sync running)' };
    return { ok: false, reason: `mbsync exit ${proc.status}: ${err.slice(0, 200)}` };
  }
  return { ok: true };
}

function indexMail() {
  const which = run('which', ['notmuch']);
  if (which.status !== 0) return { ok: false, reason: 'notmuch not installed' };

  const proc = run('notmuch', ['new'], { timeout: 30_000 });
  return { ok: proc.status === 0 };
}

function searchUnprocessed() {
  const proc = run('notmuch', ['search', '--output=messages', '--', NOTMUCH_QUERY]);
  if (proc.status !== 0) return [];
  return (proc.stdout || '')
    .trim()
    .split('\n')
    .filter(Boolean);
}

function extractMessages(data) {
  const messages = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === 'object' && !Array.isArray(item) && item.id && item.headers) {
        messages.push(item);
      } else if (Array.isArray(item)) {
        messages.push(...extractMessages(item));
      }
    }
  }
  return messages;
}

function extractTextContent(bodyParts) {
  if (!Array.isArray(bodyParts)) return '';
  for (const part of bodyParts) {
    if (part['content-type'] === 'text/plain' && typeof part.content === 'string') {
      return part.content;
    }
    if (Array.isArray(part.content)) {
      const text = extractTextContent(part.content);
      if (text) return text;
    }
  }
  for (const part of bodyParts) {
    if (part['content-type'] === 'text/html' && typeof part.content === 'string') {
      return part.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    if (Array.isArray(part.content)) {
      for (const sub of part.content) {
        if (sub['content-type'] === 'text/html' && typeof sub.content === 'string') {
          return sub.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        }
      }
    }
  }
  return '';
}

function getMessageContent(messageId) {
  const proc = run('notmuch', ['show', '--format=json', '--entire-thread=false', '--', messageId]);
  if (proc.status !== 0) return null;

  let data;
  try {
    data = JSON.parse(proc.stdout);
  } catch {
    return null;
  }

  const messages = extractMessages(data);
  if (messages.length === 0) return null;

  const msg = messages[0];
  return {
    id: msg.id,
    subject: msg.headers?.Subject || '',
    from: msg.headers?.From || '',
    to: msg.headers?.To || '',
    date: msg.headers?.Date || '',
    timestamp: msg.timestamp || 0,
    body: extractTextContent(msg.body || []),
    tags: msg.tags || [],
  };
}

function tagAsProcessed(messageId) {
  run('notmuch', ['tag', '+anqr-processed', '-inbox', '--', messageId]);
}

async function createLinearIssue(gql, teamId, email) {
  const title = email.subject
    ? `[EMAIL] ${email.subject}`
    : '[EMAIL] Untitled email issue';

  const description = [
    `From: ${email.from}`,
    `Date: ${email.date}`,
    '',
    email.body || '(empty body)',
  ].join('\n');

  const result = await gql(
    `mutation($input: IssueCreateInput!) {
      issueCreate(input: $input) { success issue { identifier title } }
    }`,
    {
      input: {
        teamId,
        title,
        description,
        priority: 2,
      },
    }
  );

  return result.issueCreate?.issue || null;
}

async function main() {
  const startedAt = new Date().toISOString();
  const summary = {
    startedAt,
    syncResult: null,
    indexResult: null,
    messagesFound: 0,
    issuesCreated: [],
    errors: [],
    dryRun: DRY_RUN,
  };

  // Step 1: Sync mail
  summary.syncResult = syncMail();
  if (!summary.syncResult.ok) {
    console.error(`[email-ingest] Mail sync failed: ${summary.syncResult.reason}`);
    if (summary.syncResult.reason.includes('lock')) {
      // Lock contention is normal, exit quietly
      writeReport(summary);
      return;
    }
  }

  // Step 2: Index new mail
  summary.indexResult = indexMail();

  // Step 3: Search for unprocessed emails
  const messageIds = searchUnprocessed();
  summary.messagesFound = messageIds.length;

  if (messageIds.length === 0) {
    writeReport(summary);
    return;
  }

  console.error(`[email-ingest] Found ${messageIds.length} unprocessed email(s)`);

  // Step 4: Process each email
  let gql = null;
  let teamId = null;

  if (LINEAR_API_KEY && !DRY_RUN) {
    gql = createGql(LINEAR_API_KEY);
    const teamData = await gql(
      `query($key: String!) {
        teams(filter: { key: { eq: $key } }, first: 1) {
          nodes { id }
        }
      }`,
      { key: TEAM_KEY }
    );
    teamId = teamData.teams.nodes[0]?.id;
    if (!teamId) {
      summary.errors.push(`Team ${TEAM_KEY} not found`);
      writeReport(summary);
      return;
    }
  }

  for (const messageId of messageIds) {
    const email = getMessageContent(messageId);
    if (!email) {
      summary.errors.push(`Failed to parse message: ${messageId}`);
      continue;
    }

    console.error(`[email-ingest] Processing: ${email.subject || '(no subject)'}`);

    if (DRY_RUN) {
      summary.issuesCreated.push({
        messageId: email.id,
        subject: email.subject,
        from: email.from,
        wouldCreate: true,
      });
      continue;
    }

    if (!gql || !teamId) {
      summary.errors.push(`Cannot create issue (no LINEAR_API_KEY): ${email.subject}`);
      tagAsProcessed(messageId);
      continue;
    }

    try {
      const issue = await createLinearIssue(gql, teamId, email);
      if (issue) {
        summary.issuesCreated.push({
          messageId: email.id,
          subject: email.subject,
          from: email.from,
          identifier: issue.identifier,
          title: issue.title,
        });
        tagAsProcessed(messageId);
        console.error(`[email-ingest] Created ${issue.identifier}: ${issue.title}`);
      } else {
        summary.errors.push(`Issue creation returned no result for: ${email.subject}`);
        tagAsProcessed(messageId);
      }
    } catch (err) {
      summary.errors.push(`Issue creation failed for ${email.subject}: ${err.message}`);
    }
  }

  // Step 5: Send confirmation notification
  if (summary.issuesCreated.length > 0 && !DRY_RUN) {
    const lines = summary.issuesCreated.map(
      (i) => `- ${i.identifier}: ${i.subject || '(no subject)'}`
    );
    sendNotification({
      subject: `Created ${summary.issuesCreated.length} issue(s) from email`,
      body: [
        `Processed ${summary.messagesFound} email(s) from ${INGEST_EMAIL}.`,
        '',
        'Issues created:',
        ...lines,
      ].join('\n'),
      severity: 'info',
    });
  }

  summary.finishedAt = new Date().toISOString();
  writeReport(summary);
  console.log(JSON.stringify(summary, null, 2));
}

function writeReport(summary) {
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'latest.json'),
    JSON.stringify(summary, null, 2) + '\n'
  );
}

main().catch((err) => {
  console.error(`[email-ingest] Fatal: ${err.message}`);
  const failure = { ok: false, error: err.message, at: new Date().toISOString() };
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(
    path.join(REPORTS_DIR, 'latest.json'),
    JSON.stringify(failure, null, 2) + '\n'
  );
  process.exit(1);
});
