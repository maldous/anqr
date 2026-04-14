import { getIssueState } from "./get-issue-state.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { isValidWorktreeTransition } from "./transition-map.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { normalizeWorktreeRecord } from "./worktree-record-schema.mjs";
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
 * Remediation Blocker 4: after releasing the issue-side lease, also clears
 * durable worktree ownership so issue and worktree truth cannot drift apart.
 *
 * @param {string} issueIdentifier
 * @param {string|null} [nonce] - If provided, release only if nonce matches
 * @returns {{ ok: boolean, released?: boolean, reason?: string }}
 */
export function releaseLease(issueIdentifier, nonce = null) {
  const state = getIssueState(issueIdentifier);
  if (!state?.lease) return { ok: true, released: false };
  if (nonce && state.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };

  // Capture worktreeId before releasing — needed for bidirectional cleanup.
  const worktreeId =
    state.assignment?.worktreeId || state.finalization?.worktreeId || null;

  let issueResult;

  // If the lease is still active, this is a real lifecycle transition.
  // Infer what phase the record would be in after the lease is removed.
  if (leaseIsActive(state)) {
    const hypothetical = { ...state, lease: null };
    const targetPhase = inferExecutionPhase(hypothetical);

    const transResult = transitionIssue(issueIdentifier, targetPhase, {
      lease: null,
      reason: "lease_released",
    });

    if (transResult.ok) {
      // transitionIssue returns { ok, record } — normalise to releaseLease's
      // { ok, released } contract so callers (and the bidirectional cleanup
      // guard below) work correctly.
      issueResult = { ok: true, released: true, record: transResult.record };
    } else {
      // Race condition — another actor changed state. Fall through to
      // direct cleanup.
      issueResult = _directLeaseCleanup(issueIdentifier, nonce);
    }
  } else {
    // Stale lease cleanup: the lease has already expired, so the phase is
    // determined by other fields. Just remove the stale lease reference.
    issueResult = _directLeaseCleanup(issueIdentifier, nonce);
  }

  // Blocker 4: Clear worktree ownership bidirectionally.
  // Sequential lock — safe because the issue-side lock was released above.
  if (issueResult.ok && issueResult.released && worktreeId) {
    _clearWorktreeOwnership(worktreeId, issueIdentifier);
  }

  return issueResult;
}

/**
 * Direct metadata cleanup for stale/expired leases.
 * @private
 */
function _directLeaseCleanup(issueIdentifier, nonce) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(
      store.issues[issueIdentifier] || { issueIdentifier },
    );
    if (!current.lease) return { ok: true, released: false };
    if (nonce && current.lease.nonce !== nonce) {
      return { ok: false, reason: "lease_mismatch" };
    }
    current.lease = null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, released: true };
  });
}

/**
 * Clear worktree ownership if it still belongs to the given issue.
 *
 * Performs the ownership check AND state transition inside a single
 * withStateLock call to avoid the race where another actor claims the
 * worktree between the ownership read and the transition.
 * @private
 */
function _clearWorktreeOwnership(worktreeId, issueIdentifier) {
  withStateLock(() => {
    const store = loadState();
    const wt = store.worktreeStates[worktreeId];
    if (!wt) return;

    // Only clear if the worktree is still owned by this issue.
    const owner = wt.assignedIssue || wt.issueIdentifier || null;
    if (owner !== issueIdentifier) return;

    // Validate the transition using the canonical transition map.
    const from = wt.state || "available";
    if (!isValidWorktreeTransition(from, "available")) return;

    const merged = {
      ...wt,
      state: "available",
      assignedIssue: null,
      updatedAt: new Date().toISOString(),
    };
    store.worktreeStates[worktreeId] = normalizeWorktreeRecord(worktreeId, merged);
    saveState(store);
  });
}
