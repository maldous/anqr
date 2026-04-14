import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../../symphony-queue-control.mjs";
import { listIssuesByState } from "../../../linear-client.mjs";
import { createDurableQueue } from "../../../lib/durable-kv.mjs";
import {
  canExecuteIssue,
  leaseIsActive,
  getIssueState,
  listIntegrationCandidates,
  getFinalizationState,
  enqueueIntegrationCandidate,
  setGlobalValue,
  loadState,
} from "../../../symphony-state.mjs";
import {
  QUEUE_STATES,
  TARGET_MIN,
  RECONCILER_DISPATCH_COOLDOWN_MS,
} from "../../../symphony-config.mjs";
import { isDiscordSourced } from "../../../core/discord-source.mjs";
import { getHealthyLinearCapacity } from "../get-healthy-linear-capacity.mjs";
import { computeReconciliationActions } from "../compute-reconciliation-actions.mjs";
import { logInfo, logWarn, logError, logDebug } from "../logger.mjs";
import { recoverInProgressIssue } from "./recover-in-progress-issue.mjs";

/**
 * ADR-0002: The reconciler feeds the desired-work queue for the scheduler.
 * It does not dispatch directly — the scheduler owns claim and dispatch.
 */
async function feedDesiredWorkQueue(eligibleIssues) {
  const desiredWorkQueue = createDurableQueue("symphony-desired-work");
  const existing = new Set(desiredWorkQueue.items().map((item) => item.identifier));
  let fed = 0;

  for (const issue of eligibleIssues) {
    if (existing.has(issue.identifier)) continue;
    desiredWorkQueue.enqueue({
      identifier: issue.identifier,
      title: issue.title,
      source: "reconciler",
      reason: "reconciler_backlog_pickup",
      timestamp: new Date().toISOString(),
    });
    fed++;
    logInfo(`Fed ${issue.identifier} to desired-work queue (scheduler will claim)`);
  }
  return fed;
}

export async function runReconciliationCycle() {
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
  const todoIssues = await listIssuesByState(QUEUE_STATES.readyStates);
  const inProgressIssues = await listIssuesByState(QUEUE_STATES.activeStates);
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
    }
  }

  const candidates = listIntegrationCandidates();
  const finalizationStates = {};
  const store = loadState();
  for (const id of new Set([...candidates, ...Object.keys(store.issues)])) {
    const fin = getFinalizationState(id);
    if (fin) finalizationStates[id] = fin;
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
  });

  logInfo(
    `Reconciliation: todo=${todoIssues.length} eligible=${summary.eligibleCount} active=${freshSnap.activeDepth} budget=${summary.dispatchBudget} dispatching=${summary.dispatchCount} stale=${summary.staleRecoveryCount} integration_queue=${summary.staleIntegrationCount}`,
  );

  let dispatched = 0;
  let reEnqueued = 0;
  let recovered = 0;

  for (const action of actions) {
    if (action.type === "dispatch") {
      // ADR-0002: Reconciler feeds the desired-work queue. The scheduler
      // owns claim and dispatch authority.
      const fed = await feedDesiredWorkQueue([{ identifier: action.issueIdentifier, title: action.title }]);
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

    if (action.type === "re_enqueue_integration") {
      try {
        enqueueIntegrationCandidate(action.issueIdentifier);
        reEnqueued++;
        logInfo(
          `Re-enqueued ${action.issueIdentifier} for integration (${action.reason}, ${Math.round(action.ageMs / 60000)}min)`,
        );
      } catch (err) {
        logError(`Re-enqueue error for ${action.issueIdentifier}: ${err.message}`);
      }
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
