import { STALE_THRESHOLD_MS, TASK_TIMEOUT_MS, RECOVERY_GRACE_MS } from "../../symphony-config.mjs";
import {
  getIssueState,
  leaseIsActive,
  releaseLease,
  recordTransition,
  setCooldown,
} from "../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../linear-client.mjs";

import { getQueueSnapshot } from "./get-queue-snapshot.mjs";
import { issueAge } from "./issue-age.mjs";
import { logAction } from "./log-action.mjs";
import { minutesAgo } from "./minutes-ago.mjs";

export async function detectStuckWork(snap = null, dryRun = false) {
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
    // Grace period: also skip recovery if heartbeat was recent (within RECOVERY_GRACE_MS)
    // This prevents recovering issues where the lease just barely expired but the runner is still alive
    const recentHeartbeat =
      state.lease?.heartbeat_at &&
      Date.now() - new Date(state.lease.heartbeat_at).getTime() < RECOVERY_GRACE_MS;
    if (hasActiveLease || recentHeartbeat) {
      logAction(
        "skip",
        `${hasActiveLease ? "Lease still active" : "Recent heartbeat detected"} for ${issue.identifier} — not recovering (${age}min stale)`,
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
