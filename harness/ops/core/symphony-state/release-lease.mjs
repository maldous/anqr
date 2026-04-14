import { getIssueState } from "./get-issue-state.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { transitionIssue } from "./transition-issue.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Release the lease on an issue.
 *
 * When the lease is active, delegates to `transitionIssue` with the target
 * phase inferred from the record-without-lease (so the issue correctly
 * returns to its natural phase: eligible, integration_pending, etc.).
 *
 * When the lease is already expired (stale reference cleanup), directly
 * removes the field without a phase transition since the phase is already
 * determined by other fields.
 *
 * @param {string} issueIdentifier
 * @param {string|null} [nonce] - If provided, release only if nonce matches
 * @returns {{ ok: boolean, released?: boolean, reason?: string }}
 */
export function releaseLease(issueIdentifier, nonce = null) {
  const state = getIssueState(issueIdentifier);
  if (!state?.lease) return { ok: true, released: false };
  if (nonce && state.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };

  // If the lease is still active, this is a real lifecycle transition.
  // Infer what phase the record would be in after the lease is removed.
  if (leaseIsActive(state)) {
    const hypothetical = { ...state, lease: null };
    const targetPhase = inferExecutionPhase(hypothetical);

    const result = transitionIssue(issueIdentifier, targetPhase, {
      lease: null,
      reason: "lease_released",
    });

    if (result.ok) return { ok: true, released: true };

    // If transition failed (race condition — another actor changed state),
    // fall through to direct cleanup below.
  }

  // Stale lease cleanup: the lease has already expired, so the phase is
  // determined by other fields. Just remove the stale lease reference.
  // This is metadata cleanup, not a lifecycle transition.
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    if (!current.lease) return { ok: true, released: false };
    if (nonce && current.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };
    current.lease = null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, released: true };
  });
}
