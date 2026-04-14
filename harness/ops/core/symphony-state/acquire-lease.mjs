import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { getIssueState } from "./get-issue-state.mjs";
import { HOST_ID } from "./host-id.mjs";
import { transitionIssue } from "./transition-issue.mjs";

/**
 * Acquire a lease for an issue — transitions from claimed → executing.
 *
 * Delegates to `transitionIssue` for atomic phase validation and history
 * recording. The runner calls this after the scheduler has claimed the issue.
 *
 * @param {string} issueIdentifier
 * @param {object} details
 * @param {string} [details.owner]
 * @param {string} [details.nonce]
 * @param {string} [details.runId]
 * @param {number} [details.ttlMs]
 * @returns {{ ok: boolean, lease?: object, reason?: string }}
 */
export function acquireLease(issueIdentifier, details = {}) {
  const now = Date.now();
  const ttlMs = Number(details.ttlMs || DEFAULT_LEASE_MS);
  const lease = {
    owner: details.owner || HOST_ID,
    nonce: details.nonce || `${HOST_ID}-${now}`,
    run_id: details.runId || null,
    acquired_at: new Date(now).toISOString(),
    heartbeat_at: new Date(now).toISOString(),
    expires_at: new Date(now + ttlMs).toISOString(),
  };

  const result = transitionIssue(issueIdentifier, "executing", {
    lease,
    last_run_id: details.runId || null,
    reason: "lease_acquired",
  });

  if (!result.ok) {
    // Map transition failures to acquireLease's existing return contract
    if (result.from === "executing") {
      const current = getIssueState(issueIdentifier);
      return { ok: false, lease: current?.lease ?? null, reason: "lease_active" };
    }
    return { ok: false, reason: result.reason };
  }

  return { ok: true, lease };
}
