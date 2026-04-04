import { getIssueState, patchIssueState } from "../symphony-state.mjs";

export function markDiscordSource(issueIdentifier) {
  const state = getIssueState(issueIdentifier);
  if (state.source !== "discord") {
    patchIssueState(issueIdentifier, { ...state, source: "discord" });
  }
}
