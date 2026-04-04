import { patchIssueState } from "./patch-issue-state.mjs";

export function markRetryExhausted(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    retry_exhausted: true,
    blocked_reason: details.reason || "retry_exhausted",
    last_failure_reason: details.reason || "retry_exhausted",
    last_failure_signature: details.signature || null,
    cooldown_until: null,
    lease: null,
  });
}
