// Generated from ../../../scripts/ops/lib/notify.mjs:41

import { DEDUP_WINDOW_MS } from "./dedup-window-ms.mjs";

export function checkDedup(state, subject) {
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  // Clean old entries
  state.sends = state.sends.filter((s) => s.ts > oneDayAgo);

  // Check deduplication: same subject within window
  const duplicate = state.sends.find((s) => s.subject === subject && s.ts > now - DEDUP_WINDOW_MS);
  if (duplicate) {
    return { allowed: false, reason: `duplicate subject within ${DEDUP_WINDOW_MS / 60000}min` };
  }

  return { allowed: true };
}
