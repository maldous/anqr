// Generated from ../../../scripts/ops/core/symphony-state.mjs:535

import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function setFinalizationState(issueIdentifier, patch = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const existing = current.finalization || {};
    current.finalization = normalizeRecord({
      ...current,
      finalization: {
        ...existing,
        ...patch,
        updatedAt: patch.updatedAt || new Date().toISOString(),
      },
    }).finalization;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return current.finalization;
  });
}
