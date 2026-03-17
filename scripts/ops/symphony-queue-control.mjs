#!/usr/bin/env node
/* eslint-disable no-console */

import { fileURLToPath } from "node:url";
import { listIssuesByState, updateIssue, addComment, STATES } from "./linear-client.mjs";
import {
  TARGET_MIN,
  TARGET_MAX,
  MAX_CONCURRENT_AGENTS,
  STALE_THRESHOLD_MS,
  TASK_TIMEOUT_MS,
  QUEUE_STATES,
} from "./symphony-config.mjs";
import {
  canExecuteIssue,
  canFeedIssue,
  getIssueState,
  leaseIsActive,
  releaseLease,
  recordTransition,
  setCooldown,
} from "./symphony-state.mjs";

const actions = [];
const RECOVERY_GRACE_MS = Number(process.env.ANQR_SYMPHONY_RECOVERY_GRACE_MS || 5 * 60 * 1000);

function logAction(type, detail) {
  actions.push({ type, detail, ts: new Date().toISOString() });
  const icons = {
    feed: "📥",
    drain: "📤",
    stale: "⏰",
    info: "ℹ️",
    concurrent: "🔒",
    recover: "🩹",
    skip: "⏭️",
  };
  console.log(`${icons[type] || "•"} ${type}: ${detail}`);
}

function issueAge(issue, field) {
  return Date.now() - new Date(issue[field]).getTime();
}

function minutesAgo(issue, field) {
  return Math.floor(issueAge(issue, field) / 60_000);
}

export async function getQueueSnapshot() {
  const [backlog, todo, inProgress] = await Promise.all([
    listIssuesByState(QUEUE_STATES.feedSource),
    listIssuesByState(QUEUE_STATES.readyStates),
    listIssuesByState(QUEUE_STATES.activeStates),
  ]);

  const backlogAuto = backlog.filter((issue) => canFeedIssue(issue));
  const todoAuto = todo.filter((issue) => canExecuteIssue(issue));
  const inProgressAuto = inProgress.filter(
    (issue) => canExecuteIssue(issue) || leaseIsActive(getIssueState(issue.identifier)),
  );

  return {
    backlog: { all: backlog, automatable: backlogAuto },
    todo: { all: todo, automatable: todoAuto },
    inProgress: { all: inProgress, automatable: inProgressAuto },
    readyDepth: todoAuto.length,
    activeDepth: inProgressAuto.length,
    queueDepth: todoAuto.length + inProgressAuto.length,
  };
}

function printQueueHealth(snap) {
  console.log("[queue-control] Queue health snapshot\n");
  console.log(
    `  Backlog (feed-eligible): ${snap.backlog.automatable.length} / ${snap.backlog.all.length} total`,
  );
  console.log(
    `  Todo (runnable):         ${snap.todo.automatable.length} / ${snap.todo.all.length} total`,
  );
  console.log(
    `  In Progress (managed):   ${snap.inProgress.automatable.length} / ${snap.inProgress.all.length} total`,
  );
  console.log(`  Queue depth:             ${snap.queueDepth}`);
  console.log(
    `\n  target_min=${TARGET_MIN}  target_max=${TARGET_MAX}  max_concurrent=${MAX_CONCURRENT_AGENTS}`,
  );
}

export async function feedQueue(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  const deficit = TARGET_MIN - live.queueDepth;
  if (deficit <= 0) {
    logAction(
      "info",
      `Queue depth ${live.queueDepth} >= target_min ${TARGET_MIN} — no feeding needed`,
    );
    return;
  }

  const candidates = [...live.backlog.automatable].sort(
    (a, b) => (a.priority ?? 99) - (b.priority ?? 99),
  );
  const toFeed = candidates.slice(0, deficit);
  if (toFeed.length === 0) {
    logAction("info", "No feed-eligible backlog issues");
    return;
  }

  for (const issue of toFeed) {
    if (dryRun) {
      logAction("feed", `[DRY RUN] Would promote ${issue.identifier} to Todo: ${issue.title}`);
      continue;
    }
    await updateIssue(issue.id, { stateId: STATES.todo });
    recordTransition(issue.identifier, {
      actor: "queue-control",
      reason: "feed",
      from: "Backlog",
      to: "Todo",
    });
    logAction("feed", `Promoted ${issue.identifier} to Todo: ${issue.title}`);
  }
}

async function drainOverflow(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  const excess = live.queueDepth - TARGET_MAX;
  if (excess <= 0) {
    logAction(
      "info",
      `Queue depth ${live.queueDepth} <= target_max ${TARGET_MAX} — no draining needed`,
    );
    return;
  }

  const candidates = [...live.todo.automatable].sort(
    (a, b) => (b.priority ?? 99) - (a.priority ?? 99),
  );
  const toDrain = candidates.slice(0, excess);
  for (const issue of toDrain) {
    if (dryRun) {
      logAction("drain", `[DRY RUN] Would demote ${issue.identifier} to Backlog: ${issue.title}`);
      continue;
    }
    await updateIssue(issue.id, { stateId: STATES.backlog });
    await addComment(issue.id, "📤 **Demoted to Backlog** — queue overflow (target_max exceeded).");
    recordTransition(issue.identifier, {
      actor: "queue-control",
      reason: "drain_overflow",
      from: "Todo",
      to: "Backlog",
    });
    logAction("drain", `Demoted ${issue.identifier} to Backlog: ${issue.title}`);
  }
}

async function enforceMaxConcurrent(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  const active = [...live.inProgress.all].sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));
  if (active.length <= MAX_CONCURRENT_AGENTS) {
    logAction("info", `${active.length} active issue(s) <= max ${MAX_CONCURRENT_AGENTS} — OK`);
    return;
  }

  const keep = active.slice(0, MAX_CONCURRENT_AGENTS);
  const demote = active.slice(MAX_CONCURRENT_AGENTS);
  for (const issue of keep) {
    logAction("info", `Keeping ${issue.identifier} in progress: ${issue.title}`);
  }

  for (const issue of demote) {
    const state = getIssueState(issue.identifier);
    const hasActiveLease = leaseIsActive(state);
    const staleEnough = issueAge(issue, "updatedAt") > RECOVERY_GRACE_MS;
    if (hasActiveLease || !staleEnough) {
      logAction(
        "skip",
        `Leaving ${issue.identifier} In Progress — ${hasActiveLease ? "active lease" : "recently updated"}`,
      );
      continue;
    }
    if (dryRun) {
      logAction("concurrent", `[DRY RUN] Would demote ${issue.identifier} to Todo: ${issue.title}`);
      continue;
    }
    await updateIssue(issue.id, { stateId: STATES.todo });
    await addComment(
      issue.id,
      `🔒 **Moved back to Todo** — max_concurrent_agents=${MAX_CONCURRENT_AGENTS} exceeded and no active lease was present.`,
    );
    recordTransition(issue.identifier, {
      actor: "queue-control",
      reason: "max_concurrent_reclaim",
      from: "In Progress",
      to: "Todo",
    });
    logAction("concurrent", `Demoted ${issue.identifier} to Todo: ${issue.title}`);
  }
}

async function detectStuckWork(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  const active = live.inProgress.all;
  if (active.length === 0) {
    logAction("info", "No active work detected");
    return;
  }

  for (const issue of active) {
    const ageMs = issueAge(issue, "updatedAt");
    if (ageMs <= TASK_TIMEOUT_MS) continue;
    const age = minutesAgo(issue, "updatedAt");
    const state = getIssueState(issue.identifier);
    const hasActiveLease = leaseIsActive(state);
    if (hasActiveLease) {
      logAction(
        "skip",
        `Lease still active for ${issue.identifier} — not recovering (${age}min stale)`,
      );
      continue;
    }
    if (dryRun) {
      logAction(
        "recover",
        `[DRY RUN] Would recover ${issue.identifier} from In Progress to Todo (${age}min stale)`,
      );
      continue;
    }
    releaseLease(issue.identifier);
    await updateIssue(issue.id, { stateId: STATES.todo });
    await addComment(
      issue.id,
      `⏰ **Recovered from stale execution** — no active lease and no update for ${age} minutes. Returned to Todo.`,
    );
    setCooldown(issue.identifier, 5 * 60 * 1000, "stale_recovery");
    recordTransition(issue.identifier, {
      actor: "queue-control",
      reason: ageMs > STALE_THRESHOLD_MS ? "stale_recovery" : "task_timeout_recovery",
      from: "In Progress",
      to: "Todo",
    });
    logAction("recover", `Recovered ${issue.identifier}: ${age}min stale`);
  }
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const doCheck = args.has("--check");
  const doFeed = args.has("--feed");
  const doDrain = args.has("--drain");
  const doEnforce = args.has("--enforce");
  const doAll = args.has("--all");

  if (!doCheck && !doFeed && !doDrain && !doEnforce && !doAll) {
    console.error(
      "Usage: symphony-queue-control.mjs --check|--feed|--drain|--enforce|--all [--dry-run]",
    );
    process.exit(2);
  }

  console.log(`[queue-control]${dryRun ? " (DRY RUN)" : ""} starting\n`);

  if (doCheck || doAll) {
    printQueueHealth(await getQueueSnapshot());
    console.log("");
  }
  if (doFeed || doAll) {
    console.log("[queue-control] === Feed ===");
    await feedQueue(null, dryRun);
    console.log("");
  }
  if (doDrain || doAll) {
    console.log("[queue-control] === Drain ===");
    await drainOverflow(null, dryRun);
    console.log("");
  }
  if (doEnforce || doAll) {
    console.log("[queue-control] === Enforce concurrent ===");
    await enforceMaxConcurrent(null, dryRun);
    console.log("");
    console.log("[queue-control] === Detect stuck work ===");
    await detectStuckWork(null, dryRun);
    console.log("");
  }

  const counts = {};
  for (const action of actions) counts[action.type] = (counts[action.type] || 0) + 1;
  console.log(
    `[queue-control] Summary: ${
      Object.entries(counts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ") || "no actions"
    }`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (err) {
    console.error(`[queue-control] Fatal: ${err.message}`);
    process.exit(1);
  }
}
