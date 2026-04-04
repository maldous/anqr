import { updateIssue, addComment, STATES } from "../../linear/linear-client.mjs";

import { PRIORITY_LABELS } from "./priority-labels.mjs";
import { logInfo } from "./logger.mjs";

export async function applyPromoteAndRequeue(
  linearIssue,
  priority,
  requeueToReady,
  logPrefix,
  entityLabel,
) {
  const actions = { promoted: null, requeued: null };

  if (linearIssue.priority > priority) {
    const fromLabel = PRIORITY_LABELS[linearIssue.priority] || `P${linearIssue.priority}`;
    const toLabel = PRIORITY_LABELS[priority] || `P${priority}`;
    await updateIssue(linearIssue.id, { priority });
    await addComment(
      linearIssue.id,
      [
        `\u26a0\ufe0f **Promoted to ${toLabel}** by nightly audit — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `Priority changed from ${fromLabel} to ${toLabel}. This ${entityLabel} must be resolved.`,
      ].join("\n"),
    );
    logInfo(`[${logPrefix}] Promoted ${linearIssue.identifier} from ${fromLabel} → ${toLabel}`);
    actions.promoted = { from: linearIssue.priority, to: priority };
  }

  if (requeueToReady && linearIssue.state.name !== "Todo") {
    const fromState = linearIssue.state.name;
    await updateIssue(linearIssue.id, { stateId: STATES.todo });
    await addComment(
      linearIssue.id,
      [
        `\u21a9\ufe0f **Requeued to Todo** by nightly audit — ${new Date().toISOString().slice(0, 10)}`,
        "",
        `Moved from ${fromState} back to Todo so the runner can pick it up.`,
      ].join("\n"),
    );
    logInfo(`[${logPrefix}] Requeued ${linearIssue.identifier} from ${fromState} → Todo`);
    actions.requeued = { fromState };
  }

  return actions;
}
