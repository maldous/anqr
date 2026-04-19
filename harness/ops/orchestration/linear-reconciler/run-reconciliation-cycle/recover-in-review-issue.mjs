import { releaseLease } from "../../../symphony-state.mjs";
import { updateIssue, addComment, STATES } from "../../../linear-client.mjs";
import { logWarn, logError } from "../logger.mjs";

/**
 * Recover an orphaned In Review issue — one that is in "In Review" in Linear
 * but has no local finalization state, making it invisible to the integrator.
 *
 * These issues arise when local state is lost (service restart, state file
 * corruption) after the runner moved the issue to In Review but before the
 * integrator picked it up. Without finalization, the integrator ignores them
 * and the reconciler never scanned for them — they were permanently stuck.
 *
 * Recovery action: return the issue to Todo so the scheduler can re-dispatch
 * it for a fresh execution cycle.
 *
 * @param {object} action - Reconciliation action with issueIdentifier and issueId
 * @returns {Promise<boolean>}
 */
export async function recoverInReviewIssue(action) {
  try {
    // Best-effort lease release in case a stale lease exists
    releaseLease(action.issueIdentifier);

    await updateIssue(action.issueId, { stateId: STATES.todo });
    await addComment(
      action.issueId,
      `🔄 **Recovered by reconciler** — issue was In Review with no local finalization state (orphaned). Returned to Todo for re-dispatch.`,
    );
    logWarn(`Recovered orphaned In Review issue ${action.issueIdentifier}`);
    return true;
  } catch (err) {
    logError(`Recover In Review failed for ${action.issueIdentifier}: ${err.message}`);
    return false;
  }
}
