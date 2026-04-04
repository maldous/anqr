// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:184

import { TRANSIENT_PATTERNS } from "./transient-patterns.mjs";

export function isTransientError(journalLog) {
  for (const pattern of TRANSIENT_PATTERNS) {
    if (pattern.test(journalLog)) {
      return true;
    }
  }
  return false;
}
