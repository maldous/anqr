import { getQueueSnapshot } from "../../../symphony-queue-control.mjs";
import { listIssuesByState } from "../../../linear-client.mjs";
import {
  getIssueState,
  leaseIsActive,
  listIntegrationCandidates,
  getFinalizationState,
  getGlobalValue,
} from "../../../symphony-state.mjs";
import { QUEUE_STATES } from "../../../symphony-config.mjs";
import { getHealthyLinearCapacity } from "../../../orchestration/linear-reconciler/get-healthy-linear-capacity.mjs";
import { logWarn, logError } from "../logger.mjs";
import { pad } from "./pad.mjs";
import { hasActiveCooldown } from "./has-active-cooldown.mjs";

export async function main() {
  if (!process.env.LINEAR_API_KEY) {
    logError("LINEAR_API_KEY is not set");
    process.exit(1);
  }

  console.log("\n══════════════════════════════════════════════════════");
  console.log("  ANQR Linear Processing Status");
  console.log("══════════════════════════════════════════════════════\n");

  const capacity = getHealthyLinearCapacity();
  console.log("┌─ Worktree Health (wt1-wt4) ─────────────────────────");
  for (const wt of capacity.worktrees) {
    const status = wt.healthy ? (wt.executing ? "executing" : wt.state) : wt.state;
    const issue = wt.issueIdentifier ? ` -> ${wt.issueIdentifier}` : "";
    const detail = wt.reason || wt.lastError ? ` (${wt.reason || wt.lastError})` : "";
    console.log(`│  ${pad(wt.wtId, 5)} ${pad(status, 20)} ${issue}${detail}`);
    if (!wt.healthy) logWarn(`${wt.wtId} unhealthy: ${wt.state}${detail}`);
  }
  console.log(
    `│  Summary: ${capacity.healthy}/${capacity.total} healthy, ${capacity.available} available, ${capacity.unhealthy} unhealthy`,
  );
  console.log("└──────────────────────────────────────────────────────\n");

  const snap = await getQueueSnapshot();
  const todoAll = await listIssuesByState(QUEUE_STATES.readyStates);
  const inProgressAll = await listIssuesByState(QUEUE_STATES.activeStates);

  console.log("┌─ Queue State ────────────────────────────────────────");
  console.log(`│  Open Todo issues:      ${todoAll.length}`);
  console.log(
    `│  Eligible Todo issues:  ${todoAll.filter((i) => !hasActiveCooldown(i.identifier)).length}`,
  );
  console.log(`│  Active executions:     ${snap.activeDepth}`);
  console.log(`│  Integration queue:     ${listIntegrationCandidates().length}`);
  console.log("└──────────────────────────────────────────────────────\n");

  if (inProgressAll.length > 0) {
    console.log("┌─ Active / Stuck Analysis ────────────────────────────");
    for (const issue of inProgressAll) {
      const state = getIssueState(issue.identifier);
      const hasLease = leaseIsActive(state);
      const wtId = state?.finalization?.worktreeId || state?.notes?.worktreeId || "unknown";
      const why = hasLease ? "lease active" : "stuck: no valid lease";
      console.log(`│  ${pad(issue.identifier, 12)} ${pad(wtId, 6)} ${why}`);
      if (!hasLease) logWarn(`${issue.identifier} stuck: no valid lease`);
    }
    console.log("└──────────────────────────────────────────────────────\n");
  }

  const integrationQueue = listIntegrationCandidates();
  if (integrationQueue.length > 0) {
    console.log("┌─ Integration Queue ──────────────────────────────────");
    for (const id of integrationQueue) {
      const fin = getFinalizationState(id);
      const state = fin?.state || "unknown";
      const age = fin?.updatedAt
        ? `${Math.round((Date.now() - new Date(fin.updatedAt).getTime()) / 60000)}min ago`
        : "";
      console.log(`│  ${pad(id, 12)} ${pad(state, 28)} ${age}`);
    }
    console.log("└──────────────────────────────────────────────────────\n");
  }

  const lastReconciler = getGlobalValue("lastReconcilerRun");
  console.log("┌─ Reconciler / Nightly ───────────────────────────────");
  if (lastReconciler) {
    console.log(`│  Last reconciler run:   ${lastReconciler.timestamp}`);
    console.log(`│  Dispatched:            ${lastReconciler.dispatched}`);
    console.log(`│  Recovered stale:       ${lastReconciler.recovered || 0}`);
    console.log(`│  Re-enqueued:           ${lastReconciler.reEnqueued}`);
  } else {
    console.log("│  Last reconciler run:   never recorded");
    logWarn("Reconciler: never recorded");
  }
  const nightly = getGlobalValue("lastNightlySonarRun");
  console.log(`│  Nightly Sonar flow:    ${nightly?.timestamp || "never recorded"}`);
  console.log("└──────────────────────────────────────────────────────\n");
  if (!nightly?.timestamp) logWarn("Nightly Sonar: never recorded");
}
