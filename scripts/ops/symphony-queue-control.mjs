#!/usr/bin/env node

/**
 * symphony-queue-control.mjs — Symphony queue management
 *
 * Enforces execution constraints for local-only Ollama operation:
 *   - Backlog-to-project feeder (Backlog → Todo when queue < target_min)
 *   - Drain overflow (Todo → Backlog when queue > target_max)
 *   - Max concurrent enforcement (only 1 In Progress at a time)
 *   - Stuck work detection (In Progress beyond task timeout)
 *   - Stale execution escalation (In Progress beyond stale threshold)
 *
 * Usage:
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --check
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --feed
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --drain
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --enforce
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --all
 *   LINEAR_API_KEY=... node scripts/ops/symphony-queue-control.mjs --all --dry-run
 *
 * Exit code:
 *   0 = queue control pass completed
 *   1 = error communicating with Linear
 */

import { fileURLToPath } from 'node:url';
import {
  listIssuesByState,
  updateIssue,
  addComment,
  STATES,
} from './linear-client.mjs';

import {
  TARGET_MIN,
  TARGET_MAX,
  MAX_CONCURRENT_AGENTS,
  STALE_THRESHOLD_MS,
  TASK_TIMEOUT_MS,
  QUEUE_STATES,
} from './symphony-config.mjs';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const actions = [];

function logAction(type, detail) {
  actions.push({ type, detail, ts: new Date().toISOString() });
  const icons = {
    feed: '📥', drain: '📤', demote: '⬇️', stuck: '🔧',
    stale: '⏰', info: 'ℹ️', concurrent: '🔒',
  };
  console.log(`${icons[type] || '•'} ${type}: ${detail}`);
}

function isAutomatable(issue) {
  return !issue.title.includes('[HUMAN]');
}

function issueAge(issue, field) {
  return Date.now() - new Date(issue[field]).getTime();
}

function minutesAgo(issue, field) {
  return Math.floor(issueAge(issue, field) / 60_000);
}

// ---------------------------------------------------------------------------
// Queue state snapshot
// ---------------------------------------------------------------------------

export async function getQueueSnapshot() {
  const [backlog, todo, inProgress] = await Promise.all([
    listIssuesByState(QUEUE_STATES.feedSource),
    listIssuesByState(QUEUE_STATES.readyStates),
    listIssuesByState(QUEUE_STATES.activeStates),
  ]);

  const backlogAuto = backlog.filter(isAutomatable);
  const todoAuto = todo.filter(isAutomatable);
  const inProgressAuto = inProgress.filter(isAutomatable);

  return {
    backlog: { all: backlog, automatable: backlogAuto },
    todo: { all: todo, automatable: todoAuto },
    inProgress: { all: inProgress, automatable: inProgressAuto },
    readyDepth: todoAuto.length,
    activeDepth: inProgressAuto.length,
    queueDepth: todoAuto.length + inProgressAuto.length,
  };
}

// ---------------------------------------------------------------------------
// Check: report queue health
// ---------------------------------------------------------------------------

function printQueueHealth(snap) {
  console.log('[queue-control] Queue health snapshot\n');
  console.log(`  Backlog (automatable): ${snap.backlog.automatable.length} / ${snap.backlog.all.length} total`);
  console.log(`  Todo (automatable):    ${snap.todo.automatable.length} / ${snap.todo.all.length} total`);
  console.log(`  In Progress (auto):    ${snap.inProgress.automatable.length} / ${snap.inProgress.all.length} total`);
  console.log(`  Queue depth (ready+active): ${snap.queueDepth}`);
  console.log('');
  console.log(`  target_min=${TARGET_MIN}  target_max=${TARGET_MAX}  max_concurrent=${MAX_CONCURRENT_AGENTS}`);

  const issues = [];
  if (snap.queueDepth < TARGET_MIN) issues.push(`queue below target_min (${snap.queueDepth}<${TARGET_MIN})`);
  if (snap.queueDepth > TARGET_MAX) issues.push(`queue above target_max (${snap.queueDepth}>${TARGET_MAX})`);
  if (snap.activeDepth > MAX_CONCURRENT_AGENTS) issues.push(`concurrent agents exceed max (${snap.activeDepth}>${MAX_CONCURRENT_AGENTS})`);

  if (issues.length > 0) {
    console.log(`\n  ⚠️  Issues: ${issues.join('; ')}`);
  } else {
    console.log('\n  ✅ Queue healthy');
  }
}

// ---------------------------------------------------------------------------
// Feed: promote Backlog → Todo when queue < target_min
// ---------------------------------------------------------------------------

export async function feedQueue(snap, dryRun) {
  const deficit = TARGET_MIN - snap.queueDepth;

  if (deficit <= 0) {
    logAction('info', `Queue depth ${snap.queueDepth} >= target_min ${TARGET_MIN} — no feeding needed`);
    return;
  }

  const candidates = snap.backlog.automatable
    .sort((a, b) => a.priority - b.priority);

  const toFeed = candidates.slice(0, deficit);

  if (toFeed.length === 0) {
    logAction('info', 'No automatable backlog issues to feed');
    return;
  }

  for (const issue of toFeed) {
    if (dryRun) {
      logAction('feed', `[DRY RUN] Would promote ${issue.identifier} to Todo: ${issue.title}`);
    } else {
      await updateIssue(issue.id, { stateId: STATES.todo });
      logAction('feed', `Promoted ${issue.identifier} to Todo: ${issue.title}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Drain: demote overflow Todo → Backlog when queue > target_max
// ---------------------------------------------------------------------------

async function drainOverflow(snap, dryRun) {
  const excess = snap.queueDepth - TARGET_MAX;

  if (excess <= 0) {
    logAction('info', `Queue depth ${snap.queueDepth} <= target_max ${TARGET_MAX} — no draining needed`);
    return;
  }

  const candidates = snap.todo.automatable
    .sort((a, b) => b.priority - a.priority);

  const toDrain = candidates.slice(0, excess);

  for (const issue of toDrain) {
    if (dryRun) {
      logAction('drain', `[DRY RUN] Would demote ${issue.identifier} to Backlog: ${issue.title}`);
    } else {
      await updateIssue(issue.id, { stateId: STATES.backlog });
      await addComment(issue.id, '📤 **Demoted to Backlog** — queue overflow (exceeded target_max). Will be re-promoted when capacity is available.');
      logAction('drain', `Demoted ${issue.identifier} to Backlog: ${issue.title}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Enforce: max concurrent agents
// ---------------------------------------------------------------------------

async function enforceMaxConcurrent(snap, dryRun) {
  const active = snap.inProgress.automatable;

  if (active.length <= MAX_CONCURRENT_AGENTS) {
    logAction('info', `${active.length} active agent(s) <= max ${MAX_CONCURRENT_AGENTS} — OK`);
    return;
  }

  const sorted = active.sort((a, b) => a.priority - b.priority);
  const keep = sorted.slice(0, MAX_CONCURRENT_AGENTS);
  const demote = sorted.slice(MAX_CONCURRENT_AGENTS);

  for (const issue of keep) {
    logAction('info', `Keeping ${issue.identifier} in progress (P${issue.priority}): ${issue.title}`);
  }

  for (const issue of demote) {
    if (dryRun) {
      logAction('concurrent', `[DRY RUN] Would demote ${issue.identifier} to Todo (P${issue.priority}): ${issue.title}`);
    } else {
      await updateIssue(issue.id, { stateId: STATES.todo });
      await addComment(issue.id, `🔒 **Moved back to Todo** — max_concurrent_agents=${MAX_CONCURRENT_AGENTS} exceeded. Only one agent may execute at a time.`);
      logAction('concurrent', `Demoted ${issue.identifier} to Todo: ${issue.title}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Enforce: stuck work detection (In Progress > task timeout)
// ---------------------------------------------------------------------------

async function detectStuckWork(snap, dryRun) {
  const active = snap.inProgress.automatable;
  const stuck = active.filter((i) => issueAge(i, 'updatedAt') > TASK_TIMEOUT_MS);

  if (stuck.length === 0) {
    logAction('info', 'No stuck work detected');
    return;
  }

  for (const issue of stuck) {
    const age = minutesAgo(issue, 'updatedAt');
    const isStale = issueAge(issue, 'updatedAt') > STALE_THRESHOLD_MS;

    if (isStale) {
      if (dryRun) {
        logAction('stale', `[DRY RUN] Would escalate+demote ${issue.identifier}: stale ${age}min (${issue.title})`);
      } else {
        await updateIssue(issue.id, { stateId: STATES.todo });
        await addComment(issue.id, `⏰ **Stale execution — moved to Todo** — no update for ${age} minutes (threshold: ${STALE_THRESHOLD_MS / 60_000}min). Needs re-evaluation or decomposition.`);
        logAction('stale', `Escalated+demoted ${issue.identifier}: stale ${age}min`);
      }
    } else {
      if (dryRun) {
        logAction('stuck', `[DRY RUN] Would flag ${issue.identifier}: stuck ${age}min (${issue.title})`);
      } else {
        await addComment(issue.id, `🔧 **Stuck detection** — no update for ${age} minutes (task timeout: ${TASK_TIMEOUT_MS / 60_000}min). Consider splitting into smaller subtasks.`);
        logAction('stuck', `Flagged ${issue.identifier}: stuck ${age}min`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const doCheck = args.includes('--check');
  const doFeed = args.includes('--feed');
  const doDrain = args.includes('--drain');
  const doEnforce = args.includes('--enforce');
  const doAll = args.includes('--all');

  if (!doCheck && !doFeed && !doDrain && !doEnforce && !doAll) {
    console.error('Usage: symphony-queue-control.mjs --check|--feed|--drain|--enforce|--all [--dry-run]');
    process.exit(2);
  }

  console.log(`[queue-control]${dryRun ? ' (DRY RUN)' : ''} starting\n`);

  const snap = await getQueueSnapshot();

  if (doCheck || doAll) {
    printQueueHealth(snap);
    console.log('');
  }

  if (doFeed || doAll) {
    console.log('[queue-control] === Feed ===');
    await feedQueue(snap, dryRun);
    console.log('');
  }

  if (doDrain || doAll) {
    console.log('[queue-control] === Drain ===');
    await drainOverflow(snap, dryRun);
    console.log('');
  }

  if (doEnforce || doAll) {
    console.log('[queue-control] === Enforce concurrent ===');
    await enforceMaxConcurrent(snap, dryRun);
    console.log('');

    console.log('[queue-control] === Detect stuck work ===');
    await detectStuckWork(snap, dryRun);
    console.log('');
  }

  printSummary();
  process.exit(0);
}

function printSummary() {
  const counts = {};
  for (const a of actions) {
    counts[a.type] = (counts[a.type] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([k, v]) => `${k}=${v}`);
  console.log(`[queue-control] Summary: ${parts.join(', ') || 'no actions'}`);
}

// Only run CLI when executed directly, not when imported as a library
if (process.argv[1] === fileURLToPath(import.meta.url)) main();
