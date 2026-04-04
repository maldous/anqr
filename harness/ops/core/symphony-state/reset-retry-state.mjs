// Generated from ../../../scripts/ops/core/symphony-state.mjs:377

import { patchIssueState } from "./patch-issue-state.mjs";

export function resetRetryState(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    retry_count: Number(details.retry_count ?? 0),
    retry_exhausted: false,
    blocked_reason: null,
    cooldown_until: null,
    lease: null,
    last_failure_reason: null,
    last_failure_signature: null,
  });
}
