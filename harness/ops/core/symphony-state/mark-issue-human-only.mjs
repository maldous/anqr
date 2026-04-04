import { getIssueState } from "./get-issue-state.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

export function markIssueHumanOnly(issueIdentifier, extra = {}) {
  return patchIssueState(issueIdentifier, {
    human_only: true,
    blocked_reason: extra.blocked_reason || null,
    source: extra.source || getIssueState(issueIdentifier).source || "human",
  });
}
