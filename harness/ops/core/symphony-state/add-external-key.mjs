// Generated from ../../../scripts/ops/core/symphony-state.mjs:236

import { getIssueState } from "./get-issue-state.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

export function addExternalKey(issueIdentifier, key) {
  if (!key) return getIssueState(issueIdentifier);
  return patchIssueState(issueIdentifier, {
    external_keys: [...new Set([...getIssueState(issueIdentifier).external_keys, key])],
  });
}
