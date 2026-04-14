import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { HOST_ID } from "./host-id.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { nowIso } from "./now-iso.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Atomically claim an issue for execution — ADR-0002.
 *
 * This is the ONLY function allowed to transition an issue from
 * `eligible` to `claimed`. It acquires a lease and records the
 * assignment metadata (worktreeId, source, correlation) in a single
 * locked transaction.
 *
 * @param {string} issueIdentifier
 * @param {object} details
 * @param {string} details.worktreeId - assigned worktree (required; claims without assignment are rejected)
 * @param {string} [details.source]   - ingress source (webhook, reconciler, operator)
 * @param {string} [details.correlationId]
 * @param {number} [details.ttlMs]
 * @returns {{ ok: boolean, lease?: object, assignment?: object, reason?: string }}
 */
export function claimIssue(issueIdentifier, details = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const now = Date.now();

    // Reject if already claimed (active lease exists)
    if (leaseIsActive(current, now)) {
      return { ok: false, reason: "already_claimed", lease: current.lease };
    }

    // Reject if blocked, exhausted, or on cooldown
    if (current.human_only) return { ok: false, reason: "human_only" };
    if (current.retry_exhausted) return { ok: false, reason: "retry_exhausted" };
    if (current.blocked_reason) return { ok: false, reason: "blocked" };
    if (current.cooldown_until && new Date(current.cooldown_until).getTime() > now) {
      return { ok: false, reason: "cooldown_active" };
    }

    // ADR-0002: scheduler claims must always include a durable worktree assignment.
    // Claims without assignment are rejected rather than created with a null worktree.
    if (!details.worktreeId) {
      return { ok: false, reason: "missing_worktree_assignment" };
    }

    const ttlMs = Number(details.ttlMs || DEFAULT_LEASE_MS);
    const nonce = `scheduler-${HOST_ID}-${now}`;

    // Create lease
    const lease = {
      owner: "scheduler",
      nonce,
      run_id: null,
      acquired_at: new Date(now).toISOString(),
      heartbeat_at: new Date(now).toISOString(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };

    // Create assignment record
    const assignment = {
      worktreeId: details.worktreeId,
      source: details.source || "scheduler",
      correlationId: details.correlationId || null,
      claimedAt: nowIso(),
      claimedBy: "scheduler",
    };

    current.lease = lease;
    current.assignment = assignment;
    store.issues[issueIdentifier] = current;
    saveState(store);

    return { ok: true, lease, assignment };
  });
}
