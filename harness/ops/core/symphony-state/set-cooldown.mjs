// Generated from ../../../scripts/ops/core/symphony-state.mjs:319

import { patchIssueState } from "./patch-issue-state.mjs";

export function setCooldown(issueIdentifier, ms, reason = "cooldown", signature = null) {
  const patch = {
    cooldown_until: new Date(Date.now() + ms).toISOString(),
    last_failure_reason: reason,
  };
  if (signature !== null) patch.last_failure_signature = signature;
  return patchIssueState(issueIdentifier, patch);
}
