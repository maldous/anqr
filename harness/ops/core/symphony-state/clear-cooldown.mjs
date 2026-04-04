// Generated from ../../../scripts/ops/core/symphony-state.mjs:348

import { patchIssueState } from "./patch-issue-state.mjs";

export function clearCooldown(issueIdentifier) {
  return patchIssueState(issueIdentifier, { cooldown_until: null });
}
