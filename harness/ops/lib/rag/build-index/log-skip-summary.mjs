// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:257

import { logInfo } from "./logger.mjs";
export function logSkipSummary(statsByReason) {
  const sorted = Array.from(statsByReason.entries()).sort((a, b) => b[1] - a[1]);
  for (const [reason, count] of sorted) {
    if (reason === "unsupported_extension") continue;
    logInfo(`   ${reason}: ${count}`);
  }
}
