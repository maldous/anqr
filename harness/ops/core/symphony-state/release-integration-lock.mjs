// Generated from ../../../scripts/ops/core/symphony-state.mjs:607

import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function releaseIntegrationLock(holder) {
  return withStateLock(() => {
    const store = loadState();
    const lock = store.global.integrationLock;
    if (!lock || lock.holder !== holder) return { ok: false, reason: "lock_mismatch" };
    store.global.integrationLock = null;
    saveState(store);
    return { ok: true };
  });
}
