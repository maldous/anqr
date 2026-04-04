// Generated from ../../../scripts/ops/core/symphony-state.mjs:334

import { calculateExponentialBackoff } from "./calculate-exponential-backoff.mjs";
import { getIssueState } from "./get-issue-state.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

export function setCooldownWithBackoff(issueIdentifier, reason = "cooldown", signature = null) {
  const current = getIssueState(issueIdentifier);
  const retryCount = Number(current.retry_count || 0);
  const cooldownMs = calculateExponentialBackoff(retryCount);

  const patch = {
    cooldown_until: new Date(Date.now() + cooldownMs).toISOString(),
    last_failure_reason: reason,
  };
  if (signature !== null) patch.last_failure_signature = signature;

  return patchIssueState(issueIdentifier, patch);
}
