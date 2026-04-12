import { getQueueSnapshot, feedQueue, detectStuckWork } from "../../symphony-queue-control.mjs";
import { listIssuesByState } from "../../linear-client.mjs";
import {
  canExecuteIssue,
  leaseIsActive,
  getIssueState,
  listIntegrationCandidates,
  getFinalizationState,
  enqueueIntegrationCandidate,
  setGlobalValue,
} from "../../symphony-state.mjs";
import { QUEUE_STATES, TARGET_MIN, RECONCILER_DISPATCH_COOLDOWN_MS } from "../../symphony-config.mjs";
import { isDiscordSourced } from "../../core/discord-source.mjs";

import { getHealthyLinearCapacity } from "./get-healthy-linear-capacity.mjs";
import { computeReconciliationActions } from "./compute-reconciliation-actions.mjs";
import { logInfo, logWarn, logError, logDebug } from "./logger.mjs";

export async function runReconciliationCycle() {
  const cycleStart = Date.now();

  const capacity = getHealthyLinearCapacity();
  logInfo(
    `Capacity: ${capacity.healthy}/${capacity.total} healthy (${capacity.available} available, ${capacity.executing} executing, ${capacity.unhealthy} unhealthy)`,
  );

  for (const wt of capacity.worktrees) {
    if (!wt.healthy) {
      logWarn(`  ${wt.wtId}: ${wt.state} (unhealthy)`);
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
  const eligibleTodo = todoIssues
    .filter((issue) => canExecuteIssue(issue))
    .filter((issue) => !isDiscordSourced(issue));

  const activeLeases = new Set();
  for (const issue of freshSnap.inProgress.all) {
    const state = getIssueState(issue.identifier);
    if (leaseIsActive(state)) {
      activeLeases.add(issue.identifier);
    }
  }

  const candidates = listIntegrationCandidates();
  const finalizationStates = {};
  for (const id of candidates) {
    finalizationStates[id] = getFinalizationState(id);
  }

  const { actions, summary } = computeReconciliationActions({
    capacity,
    queueSnapshot: freshSnap,
    eligibleTodoIssues: eligibleTodo,
    activeLeases,
    integrationCandidates: candidates,
    finalizationStates,
  });

  logInfo(
    `Reconciliation: eligible=${summary.eligibleCount} budget=${summary.dispatchBudget} dispatching=${summary.dispatchCount}`,
  );

  let dispatched = 0;
  let reEnqueued = 0;

  for (const action of actions) {
    if (action.type === "dispatch") {
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
          dispatched++;
          logInfo(`Dispatched ${action.issueIdentifier}: ${action.title}`);
        } else {
          const text = await response.text();
          logWarn(`Dispatch failed for ${action.issueIdentifier}: ${response.status} ${text}`);
        }
      } catch (err) {
        logError(`Dispatch error for ${action.issueIdentifier}: ${err.message}`);
      }

      if (RECONCILER_DISPATCH_COOLDOWN_MS > 0) {
        await new Promise((r) => setTimeout(r, RECONCILER_DISPATCH_COOLDOWN_MS));
      }
    } else if (action.type === "re_enqueue_integration") {
      try {
        enqueueIntegrationCandidate(action.issueIdentifier);
        reEnqueued++;
        logInfo(
          `Re-enqueued ${action.issueIdentifier} for integration (stale ${Math.round(action.ageMs / 60000)}min)`,
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
      reEnqueued,
      summary,
      durationMs: cycleMs,
    });
  } catch {
    /* best-effort state persistence */
  }

  logInfo(`Cycle complete: dispatched=${dispatched} re-enqueued=${reEnqueued} (${cycleMs}ms)`);

  return { dispatched, reEnqueued, summary, durationMs: cycleMs };
}
