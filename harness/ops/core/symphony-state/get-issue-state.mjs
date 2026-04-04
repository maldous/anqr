import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";

export function getIssueState(issueIdentifier) {
  const store = loadState();
  return normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
}
