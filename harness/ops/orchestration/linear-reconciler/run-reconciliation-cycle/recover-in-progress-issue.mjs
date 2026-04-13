import { releaseLease } from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { logWarn, logError } from "../logger.mjs";

export async function recoverInProgressIssue(action) {
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
