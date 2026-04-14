import { HOST_ID } from "./host-id.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { isValidIssueTransition } from "./is-valid-issue-transition.mjs";
import { isValidWorktreeTransition } from "./is-valid-worktree-transition.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { normalizeWorktreeRecord } from "./worktree-record-schema.mjs";
import { nowIso } from "./now-iso.mjs";
import { pruneHistory } from "./prune-history.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Release the lease on an issue and clear worktree ownership atomically.
 *
 * Performs both the issue-side lease release AND worktree-side ownership
 * cleanup inside a single `withStateLock` call. This eliminates the race
 * window that existed when these were done as sequential locked operations.
 *
 * Active lease path: infers the target phase from the record-without-lease,
 * validates the transition, records it in history, and clears the lease.
 *
 * Stale/expired lease path: directly removes the lease field without a
 * phase transition (the phase is already determined by other fields).
 *
 * Bidirectional: after releasing the issue-side lease, also transitions
 * the assigned worktree to "available" if it is still owned by this issue.
 *
 * @param {string} issueIdentifier
 * @param {string|null} [nonce] - If provided, release only if nonce matches
 * @returns {{ ok: boolean, released?: boolean, reason?: string }}
 */
export function releaseLease(issueIdentifier, nonce = null) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });

    if (!current.lease) return { ok: true, released: false };
    if (nonce && current.lease.nonce !== nonce) {
      return { ok: false, reason: "lease_mismatch" };
    }

    // Capture worktreeId before clearing — needed for bidirectional cleanup.
    const worktreeId = current.assignment?.worktreeId || current.finalization?.worktreeId || null;

    // --- Issue side: release the lease ---
    if (leaseIsActive(current)) {
      // Active lease: infer target phase and validate transition.
      const from = inferExecutionPhase(current);
      const hypothetical = { ...current, lease: null };
      const targetPhase = inferExecutionPhase(hypothetical);

      if (isValidIssueTransition(from, targetPhase)) {
        // Apply validated transition with history record.
        const next = normalizeRecord({ ...current, lease: null, issueIdentifier });
        next.transitions = pruneHistory([
          ...next.transitions,
          {
            at: nowIso(),
            host: HOST_ID,
            from,
            to: targetPhase,
            reason: "lease_released",
          },
        ]);
        store.issues[issueIdentifier] = next;
      } else {
        // Race condition: phase changed between read and validate.
        // Direct cleanup — still safe because we're removing the lease.
        current.lease = null;
        store.issues[issueIdentifier] = current;
      }
    } else {
      // Stale/expired lease: direct cleanup. The phase is already
      // determined by other fields, so no transition needed.
      current.lease = null;
      store.issues[issueIdentifier] = current;
    }

    // --- Worktree side: clear ownership if still owned by this issue ---
    if (worktreeId) {
      const wt = store.worktreeStates[worktreeId];
      if (wt) {
        const owner = wt.assignedIssue || wt.issueIdentifier || null;
        if (owner === issueIdentifier) {
          const wtFrom = wt.state || "available";
          if (isValidWorktreeTransition(wtFrom, "available")) {
            store.worktreeStates[worktreeId] = normalizeWorktreeRecord(worktreeId, {
              ...wt,
              state: "available",
              assignedIssue: null,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }

    // --- Single save for both sides ---
    saveState(store);
    return { ok: true, released: true };
  });
}
