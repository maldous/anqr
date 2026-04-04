import { HOST_ID } from "./host-id.mjs";
import { getIssueState } from "./get-issue-state.mjs";
import { nowIso } from "./now-iso.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";
import { pruneHistory } from "./prune-history.mjs";

export function recordTransition(issueIdentifier, transition) {
  const current = getIssueState(issueIdentifier);
  const nextTransitions = pruneHistory([
    ...current.transitions,
    { at: nowIso(), host: HOST_ID, ...transition },
  ]);
  return patchIssueState(issueIdentifier, { transitions: nextTransitions });
}
