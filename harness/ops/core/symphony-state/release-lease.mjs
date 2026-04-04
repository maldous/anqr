// Generated from ../../../scripts/ops/core/symphony-state.mjs:432

import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function releaseLease(issueIdentifier, nonce = null) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    if (!current.lease) return { ok: true, released: false };
    if (nonce && current.lease.nonce !== nonce) return { ok: false, reason: "lease_mismatch" };
    current.lease = null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, released: true };
  });
}
