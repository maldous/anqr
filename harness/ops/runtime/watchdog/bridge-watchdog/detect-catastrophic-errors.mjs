// Generated from ../../../../scripts/ops/runtime/watchdog/bridge-watchdog.mjs:171

import { CATASTROPHIC_PATTERNS } from "./catastrophic-patterns.mjs";

export function detectCatastrophicErrors(journalLog) {
  for (const pattern of CATASTROPHIC_PATTERNS) {
    const match = journalLog.match(pattern);
    if (match) {
      return match[0];
    }
  }
  return null;
}
