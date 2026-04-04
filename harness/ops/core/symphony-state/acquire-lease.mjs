// Generated from ../../../scripts/ops/core/symphony-state.mjs:389

import { DEFAULT_LEASE_MS } from "./default-lease-ms.mjs";
import { HOST_ID } from "./host-id.mjs";
import { leaseIsActive } from "./lease-is-active.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

export function acquireLease(issueIdentifier, details = {}) {
  return withStateLock(() => {
    const store = loadState();
    const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
    const now = Date.now();
    if (leaseIsActive(current, now)) {
      return { ok: false, lease: current.lease, reason: "lease_active" };
    }
    const ttlMs = Number(details.ttlMs || DEFAULT_LEASE_MS);
    const lease = {
      owner: details.owner || HOST_ID,
      nonce: details.nonce || `${HOST_ID}-${now}`,
      run_id: details.runId || null,
      acquired_at: new Date(now).toISOString(),
      heartbeat_at: new Date(now).toISOString(),
      expires_at: new Date(now + ttlMs).toISOString(),
    };
    current.lease = lease;
    current.last_run_id = details.runId || current.last_run_id || null;
    store.issues[issueIdentifier] = current;
    saveState(store);
    return { ok: true, lease };
  });
}
