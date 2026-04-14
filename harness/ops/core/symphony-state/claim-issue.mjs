import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { HOST_ID } from "./host-id.mjs";
import { nowIso } from "./now-iso.mjs";
import { transitionIssue } from "./transition-issue.mjs";

/**
 * Atomically claim an issue for execution — ADR-0002.
 *
 * This is the ONLY function allowed to transition an issue from
 * `eligible` to `claimed`. It acquires a lease and records the
 * assignment metadata (worktreeId, source, correlation) in a single
 * locked transaction via `transitionIssue`.
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
  // ADR-0002: scheduler claims must always include a durable worktree assignment.
  if (!details.worktreeId) {
    return { ok: false, reason: "missing_worktree_assignment" };
  }

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
    worktreeId: details.worktreeId,
    source: details.source || "scheduler",
    correlationId: details.correlationId || null,
    claimedAt: nowIso(),
    claimedBy: "scheduler",
  };

  const result = transitionIssue(issueIdentifier, "claimed", {
    lease,
    assignment,
    reason: "scheduler_claim",
  });

  if (!result.ok) {
    // Map transition failure reasons to claimIssue's existing return contract
    if (result.from === "claimed" || result.from === "executing") {
      return { ok: false, reason: "already_claimed" };
    }
    if (result.from === "blocked") return { ok: false, reason: "blocked" };
    if (result.from === "cooldown") return { ok: false, reason: "cooldown_active" };
    return { ok: false, reason: result.reason, from: result.from };
  }

  return { ok: true, lease, assignment };
}
