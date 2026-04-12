import { getQueueSnapshot } from "../../symphony-queue-control.mjs";
import { listIssuesByState } from "../../linear-client.mjs";
import {
  getWorktreeState,
  getIssueState,
  leaseIsActive,
  listIntegrationCandidates,
  getFinalizationState,
  getGlobalValue,
} from "../../symphony-state.mjs";
import { QUEUE_STATES } from "../../symphony-config.mjs";
import { getHealthyLinearCapacity } from "../../orchestration/linear-reconciler/get-healthy-linear-capacity.mjs";

import { logInfo, logError } from "./logger.mjs";

function pad(str, len) {
  return String(str).padEnd(len);
}

export async function main() {
  if (!process.env.LINEAR_API_KEY) {
    logError("LINEAR_API_KEY is not set");
    process.exit(1);
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  ANQR Linear Processing Status");
  console.log("══════════════════════════════════════════════════════\n");

  // 1. Worktree health
  const capacity = getHealthyLinearCapacity();
  console.log("┌─ Worktree Health (wt1-wt4) ─────────────────────────");
  for (const wt of capacity.worktrees) {
    const status = wt.healthy ? (wt.executing ? "🔄 executing" : "✅ available") : "❌ " + wt.state;
    const issue = wt.issueIdentifier ? ` → ${wt.issueIdentifier}` : "";
    console.log(`│  ${pad(wt.wtId, 5)} ${pad(status, 18)} ${issue}`);
  }
  console.log(
    `│  Summary: ${capacity.healthy}/${capacity.total} healthy, ${capacity.available} available, ${capacity.unhealthy} unhealthy`,
  );
  console.log("└──────────────────────────────────────────────────────\n");

  // 2. Queue snapshot
  const snap = await getQueueSnapshot();
  console.log("┌─ Queue State ────────────────────────────────────────");
  console.log(`│  Todo (ready):        ${snap.readyDepth} issues`);
  console.log(`│  In Progress (active): ${snap.activeDepth} issues`);
  console.log(`│  Backlog (feedable):   ${snap.backlog.automatable.length} issues`);
  console.log("└──────────────────────────────────────────────────────\n");

  // 3. Active executions
  if (snap.inProgress.all.length > 0) {
    console.log("┌─ Active Executions ──────────────────────────────────");
    for (const issue of snap.inProgress.all) {
      const state = getIssueState(issue.identifier);
      const hasLease = leaseIsActive(state);
      const leaseInfo = hasLease ? "lease active" : "⚠️  no active lease";
      const wtId = state?.notes?.worktreeId || "unknown";
      console.log(
        `│  ${pad(issue.identifier, 12)} ${pad(wtId, 5)} ${pad(leaseInfo, 20)} ${issue.title?.slice(0, 40)}`,
      );
    }
    console.log("└──────────────────────────────────────────────────────\n");
  }

  // 4. Eligible Todo issues
  const todoAll = await listIssuesByState(QUEUE_STATES.readyStates);
  console.log("┌─ Todo Issues ─────────────────────────────────────────");
  if (todoAll.length === 0) {
    console.log("│  (none)");
  } else {
    for (const issue of todoAll.slice(0, 15)) {
      const state = getIssueState(issue.identifier);
      const cooldown = state?.cooldown_until
        ? new Date(state.cooldown_until) > new Date()
          ? "⏳ cooled down"
          : ""
        : "";
      const retries = state?.retry_count ? `retry ${state.retry_count}` : "";
      const flags = [cooldown, retries].filter(Boolean).join(", ");
      console.log(
        `│  ${pad(issue.identifier, 12)} P${issue.priority || "?"} ${pad(flags, 22)} ${issue.title?.slice(0, 35)}`,
      );
    }
    if (todoAll.length > 15) {
      console.log(`│  ... and ${todoAll.length - 15} more`);
    }
  }
  console.log("└──────────────────────────────────────────────────────\n");

  // 5. Integration queue
  const integrationQueue = listIntegrationCandidates();
  if (integrationQueue.length > 0) {
    console.log("┌─ Integration Queue ──────────────────────────────────");
    for (const id of integrationQueue) {
      const fin = getFinalizationState(id);
      const state = fin?.state || "unknown";
      const age = fin?.updatedAt
        ? `${Math.round((Date.now() - new Date(fin.updatedAt).getTime()) / 60000)}min ago`
        : "";
      console.log(`│  ${pad(id, 12)} ${pad(state, 30)} ${age}`);
    }
    console.log("└──────────────────────────────────────────────────────\n");
  }

  // 6. Reconciler status
  const lastReconciler = getGlobalValue("lastReconcilerRun");
  console.log("┌─ Reconciler ──────────────────────────────────────────");
  if (lastReconciler) {
    console.log(`│  Last run:    ${lastReconciler.timestamp}`);
    console.log(`│  Dispatched:  ${lastReconciler.dispatched}`);
    console.log(`│  Re-enqueued: ${lastReconciler.reEnqueued}`);
    console.log(`│  Duration:    ${lastReconciler.durationMs}ms`);
  } else {
    console.log("│  No reconciler data — reconciler may not have run yet");
  }
  console.log("└──────────────────────────────────────────────────────\n");

  // 7. Summary verdict
  const issues = [];
  if (capacity.unhealthy > 0) issues.push(`${capacity.unhealthy} unhealthy worktree(s)`);
  if (snap.inProgress.all.length > 0) {
    const staleSuspect = snap.inProgress.all.filter((i) => {
      const s = getIssueState(i.identifier);
      return !leaseIsActive(s);
    });
    if (staleSuspect.length > 0) issues.push(`${staleSuspect.length} stale In Progress issue(s)`);
  }
  if (todoAll.length > 0 && snap.activeDepth < capacity.healthy) {
    issues.push(`capacity underutilized (${snap.activeDepth}/${capacity.healthy})`);
  }

  if (issues.length === 0) {
    console.log("✅ Linear processing is healthy\n");
  } else {
    console.log("⚠️  Issues detected:");
    for (const issue of issues) {
      console.log(`   - ${issue}`);
    }
    console.log();
  }
}
