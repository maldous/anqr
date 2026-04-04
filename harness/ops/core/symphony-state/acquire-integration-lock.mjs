import { loadState } from "./load-state.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function acquireIntegrationLock(holder, ttlMs = 10 * 60 * 1000) {
  return withStateLock(() => {
    const store = loadState();
    const lock = store.global.integrationLock;
    if (lock && new Date(lock.expiresAt).getTime() > Date.now()) {
      return { ok: false, holder: lock.holder, expiresAt: lock.expiresAt };
    }
    store.global.integrationLock = {
      holder,
      acquiredAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    };
    saveState(store);
    return { ok: true, holder, expiresAt: store.global.integrationLock.expiresAt };
  });
}
