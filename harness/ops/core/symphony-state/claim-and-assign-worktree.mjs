/**
 * Atomic claim + worktree assignment — Remediation Blocker 3.
 *
 * Claims an issue and sets the assigned worktree to "executing" in a
 * single `withStateLock` transaction.  This eliminates the crash window
 * that existed when `claimIssue()` and `transitionWorktree()` were
 * called sequentially in `schedule-cycle.mjs`.
 *
 * If either the issue claim or the worktree transition fails validation,
 * the store is NOT saved — both sides remain unchanged.
 *
 * @module claim-and-assign-worktree
 */

import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { HOST_ID } from "./host-id.mjs";
import { inferExecutionPhase } from "./infer-execution-phase.mjs";
import { isValidIssueTransition } from "./is-valid-issue-transition.mjs";
import { isValidWorktreeTransition } from "./is-valid-worktree-transition.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { normalizeWorktreeRecord } from "./worktree-record-schema.mjs";
import { nowIso } from "./now-iso.mjs";
import { pruneHistory } from "./prune-history.mjs";
import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Atomically claim an issue and assign a worktree in one locked transaction.
 *
 * @param {string} issueIdentifier
 * @param {object} details
 * @param {string} details.worktreeId - Assigned worktree (required)
 * @param {string} [details.source]   - Ingress source
 * @param {string} [details.correlationId]
 * @param {number} [details.ttlMs]
 * @returns {{ ok: boolean, lease?: object, assignment?: object, worktreeRecord?: object, reason?: string }}
 */
export function claimAndAssignWorktree(issueIdentifier, details = {}) {
  if (!details.worktreeId) {
    return { ok: false, reason: "missing_worktree_assignment" };
  }

  const { worktreeId } = details;
  const now = Date.now();
  const ttlMs = Number(details.ttlMs || DEFAULT_LEASE_MS);
  const nonce = `scheduler-${HOST_ID}-${now}`;

  const lease = {
    owner: "scheduler",
    nonce,
    run_id: null,
    acquired_at: new Date(now).toISOString(),
    heartbeat_at: new Date(now).toISOString(),
    expires_at: new Date(now + ttlMs).toISOString(),
  };

  const assignment = {
    worktreeId,
    source: details.source || "scheduler",
    correlationId: details.correlationId || null,
    claimedAt: nowIso(),
    claimedBy: "scheduler",
  };

  return withStateLock(() => {
    const store = loadState();

    // --- Issue side: validate claim transition ---
    const currentIssue = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const issueFrom = inferExecutionPhase(currentIssue);

    if (!isValidIssueTransition(issueFrom, "claimed")) {
      if (issueFrom === "claimed" || issueFrom === "executing") {
        return { ok: false, reason: "already_claimed" };
      }
      if (issueFrom === "blocked") return { ok: false, reason: "blocked" };
      if (issueFrom === "cooldown") return { ok: false, reason: "cooldown_active" };
      return { ok: false, reason: "invalid_transition", from: issueFrom };
    }

    // --- Worktree side: validate executing transition ---
    const existingWt = store.worktreeStates[worktreeId] || {};
    const wtFrom = existingWt.state || "available";

    if (!isValidWorktreeTransition(wtFrom, "executing")) {
      return { ok: false, reason: "worktree_unavailable", worktreeState: wtFrom };
    }

    // --- Both valid — apply issue claim ---
    const issuePatch = { lease, assignment };
    const nextIssue = normalizeRecord({
      ...currentIssue,
      ...issuePatch,
      issueIdentifier,
    });
    nextIssue.transitions = pruneHistory([
      ...nextIssue.transitions,
      {
        at: nowIso(),
        host: HOST_ID,
        from: issueFrom,
        to: "claimed",
        reason: "scheduler_claim",
      },
    ]);
    store.issues[issueIdentifier] = nextIssue;

    // --- Apply worktree assignment ---
    const mergedWt = {
      ...existingWt,
      state: "executing",
      assignedIssue: issueIdentifier,
      updatedAt: new Date().toISOString(),
    };
    const worktreeRecord = normalizeWorktreeRecord(worktreeId, mergedWt);
    store.worktreeStates[worktreeId] = worktreeRecord;

    // --- Single save ---
    saveState(store);

    return { ok: true, lease, assignment, worktreeRecord };
  });
}
