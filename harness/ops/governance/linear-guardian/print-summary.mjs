// Generated from ../../../scripts/ops/governance/linear-guardian.mjs:308

import { actions } from "./actions.mjs";
import { logInfo } from "./logger.mjs";

export function printSummary() {
  const counts = {};
  for (const a of actions) {
    counts[a.type] = (counts[a.type] || 0) + 1;
  }
  const parts = Object.entries(counts).map(([k, v]) => `${k}=${v}`);
  logInfo(`[linear-guardian] Summary: ${parts.join(", ") || "no actions"}`);
}
