import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function patchIssueState(issueIdentifier, patch = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const next = normalizeRecord({ ...current, ...patch, issueIdentifier });
    store.issues[issueIdentifier] = next;
    saveState(store);
    return next;
  });
}
