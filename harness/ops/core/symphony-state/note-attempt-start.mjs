import { getIssueState } from "./get-issue-state.mjs";
import { nowIso } from "./now-iso.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

export function noteAttemptStart(issueIdentifier, details = {}) {
  const current = getIssueState(issueIdentifier);
  return patchIssueState(issueIdentifier, {
    retry_count: Number(current.retry_count || 0) + 1,
    retry_exhausted: false,
    blocked_reason: null,
    last_run_id: details.runId || current.last_run_id || null,
    last_attempt_at: nowIso(),
    source: details.source || current.source || null,
    last_failure_reason: null,
    last_failure_signature: null,
  });
}
