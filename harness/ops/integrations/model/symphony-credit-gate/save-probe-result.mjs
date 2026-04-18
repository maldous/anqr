import {
  saveBridgeFile,
  loadBridgeFile,
} from "../../../core/symphony-shared-state/bridge-file-helpers.mjs";
import { withBridgeLock } from "../../../core/symphony-shared-state/with-bridge-lock.mjs";

import { isNeverPurchasedCredits } from "./is-never-purchased-credits.mjs";

const FILE_NAME = "provider-probe-results.json";

export function saveProbeResult(providerName, available, metadata = {}) {
  try {
    // Read-modify-write must be atomic under lock to avoid losing concurrent updates.
    withBridgeLock(FILE_NAME, () => {
      const results = loadBridgeFile(FILE_NAME);
      const detail = metadata.message || metadata.reason || metadata.detail || "";
      results[providerName] = {
        available,
        ts: Date.now(),
        status: metadata.status || null,
        reason: metadata.reason || null,
        message: metadata.message || null,
        detail: metadata.detail || null,
        mode: metadata.mode || null,
        permanentSkip: Boolean(metadata.permanentSkip || isNeverPurchasedCredits(detail)),
      };
      saveBridgeFile(FILE_NAME, results); // no withLock — already holding the lock
    });
  } catch {
    // best-effort — don't block provider selection on cache write failures
  }
}
