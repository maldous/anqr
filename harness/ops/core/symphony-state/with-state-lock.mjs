// Generated from ../../../scripts/ops/core/symphony-state.mjs:111

import { acquireStateLock } from "./acquire-state-lock.mjs";
import { releaseStateLock } from "./release-state-lock.mjs";

export function withStateLock(fn) {
  if (!acquireStateLock()) {
    throw new Error("Failed to acquire state lock after maximum retries");
  }
  try {
    return fn();
  } finally {
    releaseStateLock();
  }
}
