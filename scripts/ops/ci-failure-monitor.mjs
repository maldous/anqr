#!/usr/bin/env node

/**
 * ANQR CI Failure Monitor — GitHub Actions → Linear issue bridge.
 *
 * Syncs mail via mbsync, searches for unprocessed GitHub CI notifications
 * ("Run failed:" / "Run succeeded:"), and manages Linear issues:
 *
 *   - "Run failed: <workflow>"   → creates [CI] issue if none open, else comments
 *   - "Run succeeded: <workflow>" → closes matching [CI] issue if one exists
 *
 * Deduplication: only one open issue per unique workflow name at a time.
 * Tag: processed emails are tagged `ci-monitor-processed` in notmuch.
 *
 * Designed to run every 5 minutes via cron or systemd timer.
 *
 * Usage:
 *   node scripts/ops/ci-failure-monitor.mjs           # Process new CI emails
 *   node scripts/ops/ci-failure-monitor.mjs --dry-run  # Preview without Linear changes
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createGql } from './lib/linear-client.mjs';
import { sendNotification, linearIssueUrl } from './lib/notify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../..');
const REPORTS_DIR = path.join(PROJECT_ROOT, 'reports', 'ci-monitor');

const LINEAR_API_KEY = process.env.LINEAR_API_KEY || '';
const TEAM_KEY = process.env.LINEAR_TEAM_KEY || 'ANQ';
const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_REPO = (process.env.CI_MONITOR_TARGET_REPO || 'maldous/anqr').trim().toLowerCase();

const NOTMUCH_QUERY =
  'from:notifications@github.com AND (subject:"Run failed:" OR subject:"Run succeeded:") AND NOT subject:"Re:" AND tag:inbox AND NOT tag:ci-monitor-processed';

// Parse subject: "[maldous/anqr] Run failed: Quality Checks - master (aa6adb2)"
const SUBJECT_RE = /\[([^\]]+)\]\s+Run (failed|succeeded):\s+(.+?)\s+-\s+(\S+)\s+\(([a-f0-9]+)\)/;
const ATTEMPT_SUFFIX_RE = /,\s*Attempt\s*#\d+\s*$/i;

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
    date: msg.headers?.Date || '',
    timestamp: msg.timestamp || 0,
    tags: msg.tags || [],
  };
}

function parseSubject(subject) {
  const match = subject.match(SUBJECT_RE);
  if (!match) return null;
  const rawWorkflow = match[3];
  const workflow = normalizeWorkflowName(rawWorkflow);
  return {
    repo: match[1],
    status: match[2], // 'failed' or 'succeeded'
    workflow, // normalized key for dedupe (e.g. 'Quality Checks')
    workflowRaw: rawWorkflow, // original workflow label from email subject
    branch: match[4], // e.g. 'master'
    commit: match[5], // e.g. 'aa6adb2'
  };
}

function normalizeWorkflowName(workflow) {
  return workflow.replace(ATTEMPT_SUFFIX_RE, '').trim();
}

function tagAsProcessed(messageId) {
  run('notmuch', ['tag', '+ci-monitor-processed', '-inbox', '--', messageId]);
}

function issueTitle(workflow) {
  return `[CI] Run failed: ${workflow}`;
}

function extractWorkflowFromIssueTitle(title) {
  const prefix = '[CI] Run failed:';
  if (!title || !title.startsWith(prefix)) return '';
  return title.slice(prefix.length).trim();
}

async function findOpenCIIssues(gql, teamId, workflow) {
  const normalized = normalizeWorkflowName(workflow);
  const result = await gql(
    `query($teamId: ID!) {
      issues(
        filter: {
          team: { id: { eq: $teamId } },
          title: { startsWith: "[CI] Run failed:" },
          state: { type: { in: ["backlog", "unstarted", "started"] } }
        },
        first: 250
      ) {
        nodes { id identifier title state { name } }
      }
    }`,
    { teamId }
  );
  return (result.issues.nodes || []).filter((issue) => {
    const issueWorkflow = normalizeWorkflowName(extractWorkflowFromIssueTitle(issue.title));
    return issueWorkflow === normalized;
  });
}

async function createCIIssue(gql, teamId, parsed, emailDate) {
  const title = issueTitle(parsed.workflow);
  const description = [
    `GitHub Actions workflow **${parsed.workflow}** failed on \`${parsed.branch}\` at commit \`${parsed.commit}\`.`,
    '',
    `- Repository: ${parsed.repo}`,
    `- Branch: ${parsed.branch}`,
    `- Commit: ${parsed.commit}`,
    `- Date: ${emailDate}`,
    '',
    'This issue was auto-created by the CI failure monitor.',
    'It will be auto-closed when a "Run succeeded" email arrives for the same workflow.',
    '',
    '## Resolution',
    '',
    'Investigate the CI failure, fix the root cause, and push a passing commit.',
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
        priority: 1, // urgent — CI is broken
      },
    }
  );

  return result.issueCreate?.issue || null;
}

async function commentOnIssue(gql, issueId, body) {
  await gql(
    `mutation($input: CommentCreateInput!) {
      commentCreate(input: $input) { success }
    }`,
    { input: { issueId, body } }
  );
}

async function closeIssue(gql, issue, teamId, parsed, emailDate) {
  // Find the "Done" state for the team
  const teamData = await gql(
    `query($teamId: ID!) {
      workflowStates(
        filter: { team: { id: { eq: $teamId } }, name: { eq: "Done" } }
        first: 1
      ) {
        nodes { id name }
      }
    }`,
    { teamId }
  );
  const doneState = teamData.workflowStates.nodes[0];
  if (!doneState) {
    console.error('[ci-monitor] Could not find "Done" state');
    return false;
  }

  await commentOnIssue(
    gql,
    issue.id,
    [
      `CI workflow **${parsed.workflow}** now passing on \`${parsed.branch}\` at commit \`${parsed.commit}\`.`,
      '',
      `Resolved: ${emailDate}`,
      '',
      'Auto-closed by CI failure monitor.',
    ].join('\n')
  );

  await gql(
    `mutation($id: String!, $input: IssueUpdateInput!) {
      issueUpdate(id: $id, input: $input) { success }
    }`,
    { id: issue.id, input: { stateId: doneState.id } }
  );

  return true;
}

async function main() {
  const startedAt = new Date().toISOString();
  const summary = {
    startedAt,
    syncResult: null,
    indexResult: null,
    messagesFound: 0,
    failures: [],
    successes: [],
    issuesCreated: [],
    issuesClosed: [],
    issuesCommented: [],
    skipped: [],
    errors: [],
    dryRun: DRY_RUN,
  };

  // Step 1: Sync mail
  summary.syncResult = syncMail();
  if (!summary.syncResult.ok) {
    console.error(`[ci-monitor] Mail sync failed: ${summary.syncResult.reason}`);
    if (summary.syncResult.reason.includes('lock')) {
      writeReport(summary);
      return;
    }
  }

  // Step 2: Index new mail
  summary.indexResult = indexMail();

  // Step 3: Search for unprocessed CI emails
  const messageIds = searchUnprocessed();
  summary.messagesFound = messageIds.length;

  if (messageIds.length === 0) {
    writeReport(summary);
    return;
  }

  console.error(`[ci-monitor] Found ${messageIds.length} unprocessed CI notification(s)`);

  // Step 4: Parse and sort emails chronologically
  const emails = [];
  for (const messageId of messageIds) {
    const content = getMessageContent(messageId);
    if (!content) {
      summary.errors.push(`Failed to parse message: ${messageId}`);
      continue;
    }

    const parsed = parseSubject(content.subject);
    if (!parsed) {
      summary.skipped.push({ messageId, subject: content.subject, reason: 'unparseable subject' });
      if (!DRY_RUN) tagAsProcessed(messageId);
      continue;
    }

    emails.push({ messageId, content, parsed });
  }

  // Sort by timestamp so we process failures before successes chronologically
  emails.sort((a, b) => a.content.timestamp - b.content.timestamp);

  // Step 5: Connect to Linear
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

  // Step 6: Process each email
  for (const { messageId, content, parsed } of emails) {
    const parsedRepo = parsed.repo.trim().toLowerCase();
    if (TARGET_REPO && parsedRepo !== TARGET_REPO) {
      summary.skipped.push({
        messageId,
        subject: content.subject,
        reason: `repo mismatch (${parsed.repo} != ${TARGET_REPO})`,
      });
      if (!DRY_RUN) tagAsProcessed(messageId);
      continue;
    }

    const workflowLabel =
      parsed.workflowRaw && parsed.workflowRaw !== parsed.workflow
        ? `${parsed.workflowRaw} → ${parsed.workflow}`
        : parsed.workflow;
    const logPrefix = `[ci-monitor] ${parsed.status}: ${workflowLabel} (${parsed.commit})`;

    if (parsed.status === 'failed') {
      summary.failures.push({
        workflow: parsed.workflow,
        branch: parsed.branch,
        commit: parsed.commit,
        date: content.date,
      });

      if (DRY_RUN) {
        console.error(`${logPrefix} — would create/comment issue`);
        continue;
      }

      if (!gql || !teamId) {
        summary.errors.push(`Cannot create issue (no LINEAR_API_KEY): ${parsed.workflow}`);
        tagAsProcessed(messageId);
        continue;
      }

      try {
        const existing = await findOpenCIIssues(gql, teamId, parsed.workflow);

        if (existing.length > 0) {
          const primary = existing[0];
          // Issue already open — add a comment with the new failure
          await commentOnIssue(
            gql,
            primary.id,
            [
              `Another failure on \`${parsed.branch}\` at commit \`${parsed.commit}\`.`,
              `Date: ${content.date}`,
            ].join('\n')
          );
          summary.issuesCommented.push({
            identifier: primary.identifier,
            workflow: parsed.workflow,
            commit: parsed.commit,
          });
          console.error(`${logPrefix} — commented on ${primary.identifier}`);
        } else {
          // No open issue — create one
          const issue = await createCIIssue(gql, teamId, parsed, content.date);
          if (issue) {
            summary.issuesCreated.push({
              identifier: issue.identifier,
              workflow: parsed.workflow,
              commit: parsed.commit,
            });
            console.error(`${logPrefix} — created ${issue.identifier}`);
          } else {
            summary.errors.push(`Issue creation returned no result for: ${parsed.workflow}`);
          }
        }
      } catch (err) {
        summary.errors.push(`Failed for ${parsed.workflow}: ${err.message}`);
      }

      tagAsProcessed(messageId);
    } else if (parsed.status === 'succeeded') {
      summary.successes.push({
        workflow: parsed.workflow,
        branch: parsed.branch,
        commit: parsed.commit,
        date: content.date,
      });

      if (DRY_RUN) {
        console.error(`${logPrefix} — would close issue if open`);
        continue;
      }

      if (!gql || !teamId) {
        tagAsProcessed(messageId);
        continue;
      }

      try {
        const existing = await findOpenCIIssues(gql, teamId, parsed.workflow);

        if (existing.length > 0) {
          for (const issue of existing) {
            const closed = await closeIssue(gql, issue, teamId, parsed, content.date);
            if (closed) {
              summary.issuesClosed.push({
                identifier: issue.identifier,
                workflow: parsed.workflow,
                commit: parsed.commit,
              });
              console.error(`${logPrefix} — closed ${issue.identifier}`);
            }
          }
        }
        // No open issue to close — that's fine, just mark processed
      } catch (err) {
        summary.errors.push(`Failed closing for ${parsed.workflow}: ${err.message}`);
      }

      tagAsProcessed(messageId);
    }
  }

  // Step 7: Send notification if issues were created
  if (summary.issuesCreated.length > 0 && !DRY_RUN) {
    const detailLines = summary.issuesCreated.map((i) =>
      [
        `• ${i.identifier}: ${i.workflow}`,
        `  Commit: ${i.commit}`,
        `  ${linearIssueUrl(i.identifier)}`,
      ].join('\n')
    );
    sendNotification({
      subject: `CI failure: ${summary.issuesCreated.map((i) => i.workflow).join(', ')}`,
      body: [
        `Created ${summary.issuesCreated.length} CI failure issue(s):`,
        '',
        ...detailLines,
        '',
        'These will auto-close when the workflow passes.',
      ].join('\n'),
      severity: 'critical',
    });
  }

  if (summary.issuesClosed.length > 0 && !DRY_RUN) {
    sendNotification({
      subject: `CI resolved: ${summary.issuesClosed.map((i) => i.workflow).join(', ')}`,
      body: [
        `Closed ${summary.issuesClosed.length} CI failure issue(s):`,
        '',
        ...summary.issuesClosed.map((i) =>
          [
            `• ${i.identifier}: ${i.workflow} now passing`,
            `  Commit: ${i.commit}`,
            `  ${linearIssueUrl(i.identifier)}`,
          ].join('\n')
        ),
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

main().catch((err) => {
  console.error(`[ci-monitor] Fatal: ${err.message}`);
  const failure = { ok: false, error: err.message, at: new Date().toISOString() };
  ensureDir(REPORTS_DIR);
  fs.writeFileSync(path.join(REPORTS_DIR, 'latest.json'), JSON.stringify(failure, null, 2) + '\n');
  process.exit(1);
});
