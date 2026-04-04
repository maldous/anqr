// Generated from ../../../scripts/ops/core/symphony-state.mjs:455

import { patchIssueState } from "./patch-issue-state.mjs";

export function recordCompletion(issueIdentifier, details = {}) {
  return patchIssueState(issueIdentifier, {
    completed_at: details.completedAt || new Date().toISOString(),
    latency_ms: Number(details.latencyMs) || null,
  });
}
