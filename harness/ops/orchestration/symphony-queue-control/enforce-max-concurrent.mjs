import { MAX_CONCURRENT_AGENTS, RECOVERY_GRACE_MS } from "../../symphony-config.mjs";
import { getIssueState, leaseIsActive, recordTransition } from "../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../linear-client.mjs";

import { getQueueSnapshot } from "./get-queue-snapshot.mjs";
import { issueAge } from "./issue-age.mjs";
import { logAction } from "./log-action.mjs";

export async function enforceMaxConcurrent(snap = null, dryRun = false) {
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
