import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function heartbeatLease(issueIdentifier, nonce, ttlMs = DEFAULT_LEASE_MS) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    if (!current.lease || current.lease.nonce !== nonce) {
      const isStatewipe = !store.issues[issueIdentifier] || !current.lease;
      const reason = isStatewipe ? "lease_mismatch:state_wipe" : "lease_mismatch";
      if (isStatewipe) {
        console.error(
          `[heartbeat-lease] STATE WIPE DETECTED for ${issueIdentifier}: no record in store`,
          new Error("state-wipe stack").stack,
        );
      }
      return { ok: false, reason };
    }
    const now = Date.now();
    current.lease = {
      ...current.lease,
      heartbeat_at: new Date(now).toISOString(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, lease: current.lease };
  });
}
