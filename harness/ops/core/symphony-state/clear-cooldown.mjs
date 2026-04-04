import { patchIssueState } from "./patch-issue-state.mjs";

export function clearCooldown(issueIdentifier) {
  return patchIssueState(issueIdentifier, { cooldown_until: null });
}
