#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * email-ingest.mjs — Bidirectional email interface.
 *
 * Syncs mail via mbsync, searches for unprocessed emails from allowed senders,
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
import { createIssue, query, TEAM_ID } from './linear-client.mjs';
import { sendNotification, formatIssueLine } from './lib/notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'email-ingest');

const INGEST_EMAIL = process.env.ANQR_INGEST_EMAIL || 'email@anqr.link';
const HUMAN_USER_NAME = 'Matthew Aldous';
const ALLOWED_SENDERS = ['matthew.aldous@gmail.com', 'alexander.emmalyn.thomas@gmail.com'];
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
  return (proc.stdout || '').trim().split('\n').filter(Boolean);
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
      return part.content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
    if (Array.isArray(part.content)) {
      for (const sub of part.content) {
        if (sub['content-type'] === 'text/html' && typeof sub.content === 'string') {
          return sub.content
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
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

async function lookupHumanAssignee() {
  try {
    const teamData = await query(
      `query($teamId: String!) {
        team(id: $teamId) {
          members(first: 50) { nodes { id name active } }
        }
      }`,
      { teamId: TEAM_ID },
    );
    const member = teamData.team?.members?.nodes?.find(
      (m) => m.active && m.name === HUMAN_USER_NAME,
    );
    return member?.id || null;
  } catch {
    return null;
  }
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

  // Step 4: Lookup assignee for [EMAIL] issues
  const humanAssigneeId = DRY_RUN ? null : await lookupHumanAssignee();

  // Step 5: Process each email
  for (const messageId of messageIds) {
    const email = getMessageContent(messageId);
    if (!email) {
      summary.errors.push(`Failed to parse message: ${messageId}`);
      continue;
    }

    const senderAddr = (email.from.match(/<([^>]+)>/)?.[1] || email.from).trim().toLowerCase();
    const senderAllowed = ALLOWED_SENDERS.some((addr) => senderAddr === addr.toLowerCase());
    if (!senderAllowed) {
      console.error(
        `[email-ingest] Skipping unauthorized sender: ${email.from} (subject: ${email.subject || '(no subject)'})`,
      );
      tagAsProcessed(messageId);
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

    if (!process.env.LINEAR_API_KEY) {
      summary.errors.push(`Cannot create issue (no LINEAR_API_KEY): ${email.subject}`);
      tagAsProcessed(messageId);
      continue;
    }

    try {
      const title = email.subject ? `[EMAIL] ${email.subject}` : '[EMAIL] Untitled email issue';
      const description = [
        `From: ${email.from}`,
        `Date: ${email.date}`,
        '',
        email.body || '(empty body)',
      ].join('\n');

      const issue = await createIssue({
        title,
        description,
        priority: 2,
        ...(humanAssigneeId ? { assigneeId: humanAssigneeId } : {}),
      });

      if (issue) {
        summary.issuesCreated.push({
          messageId: email.id,
          subject: email.subject,
          from: email.from,
          identifier: issue.identifier,
          title: issue.title,
          bodySnippet: (email.body || '').slice(0, 300),
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

  // Step 6: Send confirmation notification
  if (summary.issuesCreated.length > 0 && !DRY_RUN) {
    const issueBlocks = summary.issuesCreated.map((i) =>
      formatIssueLine({
        identifier: i.identifier,
        title: i.subject || '(no subject)',
        snippet: i.bodySnippet,
      }),
    );
    sendNotification({
      subject: `Created ${summary.issuesCreated.length} issue(s) from email`,
      body: [
        `Processed ${summary.messagesFound} email(s) from ${INGEST_EMAIL}.`,
        '',
        'Issues created:',
        '',
        ...issueBlocks,
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
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(summary, null, 2) + '\n');
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  main().catch((err) => {
    console.error(`[email-ingest] Fatal: ${err.message}`);
    const failure = { ok: false, error: err.message, at: new Date().toISOString() };
    ensureDir(REPORTS_DIR);
    fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(failure, null, 2) + '\n');
    process.exit(1);
  });
}
