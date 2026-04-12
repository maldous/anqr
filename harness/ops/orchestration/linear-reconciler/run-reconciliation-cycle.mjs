import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../symphony-queue-control.mjs";
import { listIssuesByState, updateIssue, addComment, STATES } from "../../linear-client.mjs";
import {
  canExecuteIssue,
  leaseIsActive,
  getIssueState,
  listIntegrationCandidates,
  getFinalizationState,
  enqueueIntegrationCandidate,
  setGlobalValue,
  releaseLease,
  loadState,
} from "../../symphony-state.mjs";
import {
  QUEUE_STATES,
  TARGET_MIN,
  RECONCILER_DISPATCH_COOLDOWN_MS,
} from "../../symphony-config.mjs";
import { isDiscordSourced } from "../../core/discord-source.mjs";

import { getHealthyLinearCapacity } from "./get-healthy-linear-capacity.mjs";
import { computeReconciliationActions } from "./compute-reconciliation-actions.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

async function dispatchIssue(action) {
  try {
    const response = await fetch("http://127.0.0.1:4319/v1/linear/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer local-symphony",
      },
      body: JSON.stringify({
        identifier: action.issueIdentifier,
        title: action.title,
        action: "reconciler",
        source: "linear-reconciler",
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (response.ok || response.status === 202) {
      logInfo(`Dispatched ${action.issueIdentifier}: ${action.title}`);
      return true;
    }

    const text = await response.text();
    logWarn(`Dispatch failed for ${action.issueIdentifier}: ${response.status} ${text}`);
    return false;
  } catch (err) {
    logError(`Dispatch error for ${action.issueIdentifier}: ${err.message}`);
    return false;
  }
}

async function recoverInProgressIssue(action) {
  try {
    releaseLease(action.issueIdentifier);
    await updateIssue(action.issueId, { stateId: STATES.todo });
    await addComment(
      action.issueId,
      `⏰ **Recovered by reconciler** — issue was In Progress with no valid active lease. Returned to Todo for re-dispatch.`,
    );
    logWarn(`Recovered stale In Progress issue ${action.issueIdentifier}`);
    return true;
  } catch (err) {
    logError(`Recover In Progress failed for ${action.issueIdentifier}: ${err.message}`);
    return false;
  }
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
      if (await dispatchIssue(action)) dispatched++;
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

  logInfo(`Cycle complete: dispatched=${dispatched} recovered=${recovered} re-enqueued=${reEnqueued} (${cycleMs}ms)`);

  return { dispatched, recovered, reEnqueued, summary, durationMs: cycleMs };
}
