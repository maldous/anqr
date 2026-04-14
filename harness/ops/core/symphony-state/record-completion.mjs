import { transitionIssue } from "./transition-issue.mjs";
import { loadState } from "./load-state.mjs";
import { normalizeRecord } from "./normalize-record.mjs";
import { saveState } from "./save-state.mjs";
import { withStateLock } from "./with-state-lock.mjs";

/**
 * Record execution completion metadata.
 *
 * Attempts `transitionIssue("completed")` when the current phase
 * allows it (e.g., evidence_pending → completed).
 *
 * When the transition is not valid (e.g., issue is still in
 * `integration_pending` because integration hasn't run yet), only
 * sets `latency_ms` (pure observation metadata). Does NOT set
 * `completed_at` on the fallback path — `completed_at` is a
 * lifecycle-determining field that must only be set through a
 * validated transition.
 */
export function recordCompletion(issueIdentifier, details = {}) {
  const completedAt = details.completedAt || new Date().toISOString();
  const latencyMs = Number(details.latencyMs) || null;

  const result = transitionIssue(issueIdentifier, "completed", {
    completed_at: completedAt,
    latency_ms: latencyMs,
    reason: "execution_complete",
  });
  if (result.ok) return result.record;

  // Transition rejected (expected: runner records timing before
  // integration runs). Only set latency_ms — pure observation
  // metadata that does not affect lifecycle phase.
  if (latencyMs !== null) {
    return withStateLock(() => {
      const store = loadState();
      const current = normalizeRecord(store.issues[issueIdentifier] || { issueIdentifier });
      current.latency_ms = latencyMs;
      store.issues[issueIdentifier] = current;
      saveState(store);
      return current;
    });
  }

  return null;
}
