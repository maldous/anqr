import { TARGET_MAX } from "../../symphony-config.mjs";
import { updateIssue, addComment, STATES } from "../../linear-client.mjs";
import { recordTransition } from "../../symphony-state.mjs";

import { getQueueSnapshot } from "./get-queue-snapshot.mjs";
import { logAction } from "./log-action.mjs";

export async function drainOverflow(snap = null, dryRun = false) {
  const live = snap || (await getQueueSnapshot());
  // Drain based on Todo (runnable) count - that's what runners actually pick from
  const excess = live.readyDepth - TARGET_MAX;
  if (excess <= 0) {
    logAction(
      "info",
      `Ready depth ${live.readyDepth} <= target_max ${TARGET_MAX} — no draining needed`,
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
