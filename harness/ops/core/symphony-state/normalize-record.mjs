import { pruneHistory } from "./prune-history.mjs";

export function normalizeRecord(record = {}) {
  return {
    issueIdentifier: record.issueIdentifier || null,
    source: record.source || null,
    human_only: Boolean(record.human_only),
    retry_count: Number(record.retry_count || 0),
    retry_exhausted: Boolean(record.retry_exhausted),
    cooldown_until: record.cooldown_until || null,
    blocked_reason: record.blocked_reason || null,
    last_failure_reason: record.last_failure_reason || null,
    last_failure_signature: record.last_failure_signature || null,
    last_run_id: record.last_run_id || null,
    last_attempt_at: record.last_attempt_at || null,
    external_keys: Array.isArray(record.external_keys) ? record.external_keys : [],
    lease: record.lease && typeof record.lease === "object" ? record.lease : null,
    assignment:
      record.assignment && typeof record.assignment === "object"
        ? {
            worktreeId: record.assignment.worktreeId || null,
            source: record.assignment.source || null,
            correlationId: record.assignment.correlationId || null,
            claimedAt: record.assignment.claimedAt || null,
            claimedBy: record.assignment.claimedBy || null,
          }
        : null,
    transitions: pruneHistory(Array.isArray(record.transitions) ? record.transitions : []),
    notes: record.notes || {},
    latency_ms: Number(record.latency_ms) || null,
    completed_at: record.completed_at || null,
    finalization:
      record.finalization && typeof record.finalization === "object"
        ? {
            state: record.finalization.state || null,
            worktreeId: record.finalization.worktreeId || null,
            stickyOwner: record.finalization.stickyOwner || null,
            branch: record.finalization.branch || null,
            baseMainSha: record.finalization.baseMainSha || null,
            headSha: record.finalization.headSha || null,
            integratedMainSha: record.finalization.integratedMainSha || null,
            attempts: Number(record.finalization.attempts || 0),
            lastError: record.finalization.lastError || null,
            updatedAt: record.finalization.updatedAt || null,
          }
        : null,
  };
}
