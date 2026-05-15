import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../../symphony-queue-control.mjs";
import { listIssuesByState } from "../../../linear-client.mjs";
import {
  canExecuteIssue,
  leaseIsActive,
  getIssueState,
  listIntegrationCandidates,
  getFinalizationState,
  setGlobalValue,
  loadState,
} from "../../../symphony-state.mjs";
import {
  QUEUE_STATES,
  TARGET_MIN,
  RECONCILER_DISPATCH_COOLDOWN_MS,
  RECOVERY_GRACE_MS,
  RECONCILER_FULL_POLL_INTERVAL_CYCLES,
} from "../../../symphony-config.mjs";
import { isDiscordSourced } from "../../../core/discord-source.mjs";
import { getHealthyLinearCapacity } from "../get-healthy-linear-capacity.mjs";
import { computeReconciliationActions } from "../compute-reconciliation-actions.mjs";
import { logInfo, logWarn, logDebug } from "../logger.mjs";
import { recoverInProgressIssue } from "./recover-in-progress-issue.mjs";
import { recoverInReviewIssue } from "./recover-in-review-issue.mjs";
import { feedDesiredWorkQueue } from "./feed-desired-work-queue.mjs";

export async function runReconciliationCycle(isFullPollCycle = true) {
  const cycleStart = Date.now();

  const capacity = getHealthyLinearCapacity();
  logInfo(
    `Capacity: ${capacity.healthy}/${capacity.total} healthy (${capacity.available} available, ${capacity.executing} executing, ${capacity.unhealthy} unhealthy)`,
  );

  for (const wt of capacity.worktrees) {
    if (!wt.healthy) {
      logWarn(`  ${wt.wtId}: ${wt.state} (unhealthy${wt.reason ? `, ${wt.reason}` : ""})`);
    }
  }

  if (capacity.healthy === 0) {
    logWarn("No healthy Linear worktrees — skipping reconciliation");
    return { skipped: true, reason: "no_healthy_worktrees" };
  }

  const snap = await getQueueSnapshot();
  await detectStuckWork(snap, false);

  if (snap.readyDepth < TARGET_MIN) {
    logDebug(`Queue depth ${snap.readyDepth} < target ${TARGET_MIN} — feeding`);
    await feedQueue(snap, false);
  }

  const freshSnap = await getQueueSnapshot();

  // InProgress and InReview polls always run — needed for stuck-work recovery.
  const inProgressIssues = await listIssuesByState(QUEUE_STATES.activeStates);
  const inReviewIssues = await listIssuesByState(QUEUE_STATES.closeoutStates);

  // Todo poll is throttled — webhooks handle real-time dispatch.
  // Only do a full Todo poll on periodic backstop cycles (or single-cycle runs).
  let todoIssues = [];
  if (isFullPollCycle) {
    todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);
    logDebug(`[reconciler] Full Todo poll: ${todoIssues.length} issues (every ${RECONCILER_FULL_POLL_INTERVAL_CYCLES} cycles)`);
  } else {
    logDebug("[reconciler] Skipping Todo poll — trusting webhooks (next full poll in < 30 min)");
  }

  const eligibleTodo = todoIssues
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => !isDiscordSourced(issue));

  const activeLeases = new Set();
  const activeIssueIdentifiers = new Set();
  for (const issue of freshSnap.inProgress.all) {
    activeIssueIdentifiers.add(issue.identifier);
    const state = getIssueState(issue.identifier);
    if (leaseIsActive(state)) {
      activeLeases.add(issue.identifier);
    } else if (state.lease?.heartbeat_at) {
      // Grace period: protect issues whose lease just expired but whose heartbeat
      // was recent — the runner is alive, just between heartbeat cycles.
      const heartbeatAge = Date.now() - new Date(state.lease.heartbeat_at).getTime();
      if (heartbeatAge < RECOVERY_GRACE_MS) {
        activeLeases.add(issue.identifier);
      }
    }
  }

  const candidates = listIntegrationCandidates();
  const finalizationStates = {};
  const store = loadState();
  for (const id of new Set([...candidates, ...Object.keys(store.issues)])) {
    const fin = getFinalizationState(id);
    if (fin) {
      finalizationStates[id] = fin;
    } else if (store.issues[id]?.human_only) {
      // human_only issues are intentionally parked in In Review — don't recover them as orphans
      finalizationStates[id] = { state: "human_review_pending", reason: "human_only" };
    }
  }

  const { actions, summary } = computeReconciliationActions({
    capacity,
    queueSnapshot: freshSnap,
    eligibleTodoIssues: eligibleTodo,
    activeLeases,
    integrationCandidates: candidates,
    finalizationStates,
    inProgressIssues,
    activeIssueIdentifiers,
    inReviewIssues,
  });

  logInfo(
    `Reconciliation: todo=${todoIssues.length} eligible=${summary.eligibleCount} active=${freshSnap.activeDepth} budget=${summary.dispatchBudget} dispatching=${summary.dispatchCount} stale=${summary.staleRecoveryCount} orphaned_review=${summary.orphanedReviewCount} integration_queue=${summary.staleIntegrationCount}${isFullPollCycle ? "" : " (skipped Todo poll)"}`,
  );

  let dispatched = 0;
  let reEnqueued = 0;
  let recovered = 0;

  for (const action of actions) {
    if (action.type === "dispatch") {
      // ADR-0002: Reconciler feeds the desired-work queue. The scheduler
      // owns claim and dispatch authority.
      const fed = await feedDesiredWorkQueue([
        { identifier: action.issueIdentifier, title: action.title },
      ]);
      dispatched += fed;
      if (RECONCILER_DISPATCH_COOLDOWN_MS > 0) {
        await new Promise((r) => setTimeout(r, RECONCILER_DISPATCH_COOLDOWN_MS));
      }
      continue;
    }

    if (action.type === "recover_in_progress") {
      if (await recoverInProgressIssue(action)) recovered++;
      continue;
    }

    if (action.type === "recover_in_review") {
      if (await recoverInReviewIssue(action)) recovered++;
      continue;
    }

    if (action.type === "re_enqueue_integration") {
      // Phase 5: integration candidates are derived from finalization.state.
      // No explicit enqueue needed — the candidate is already visible.
      reEnqueued++;
      logInfo(
        `Re-enqueued ${action.issueIdentifier} for integration (${action.reason}, ${Math.round(action.ageMs / 60000)}min)`,
      );
    }
  }

  const cycleMs = Date.now() - cycleStart;

  try {
    setGlobalValue("lastReconcilerRun", {
      timestamp: new Date().toISOString(),
      dispatched,
      recovered,
      reEnqueued,
      summary,
      durationMs: cycleMs,
    });
  } catch {
    /* best-effort state persistence */
  }

  logInfo(
    `Cycle complete: dispatched=${dispatched} recovered=${recovered} re-enqueued=${reEnqueued} (${cycleMs}ms)`,
  );

  return { dispatched, recovered, reEnqueued, summary, durationMs: cycleMs };
}
