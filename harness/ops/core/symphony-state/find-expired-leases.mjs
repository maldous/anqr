// Generated from ../../../scripts/ops/core/symphony-state.mjs:445

import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";

export function findExpiredLeases(now = Date.now()) {
  const store = loadState();
  return Object.entries(store.issues)
    .filter(
      ([, record]) =>
        record.lease?.expires_at && new Date(record.lease.expires_at).getTime() <= now,
    )
    .map(([issueIdentifier, record]) => ({ issueIdentifier, record: normalizeRecord(record) }));
}
