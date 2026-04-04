import { getIssueState } from "./get-issue-state.mjs";
import { nowIso } from "./now-iso.mjs";
import { patchIssueState } from "./patch-issue-state.mjs";

export function recordRetryEvent(issueIdentifier, event = {}) {
  const current = getIssueState(issueIdentifier);
  const retryEvents = Array.isArray(current.notes?.retry_events) ? current.notes.retry_events : [];

  const newEvent = {
    timestamp: nowIso(),
    type: event.type || "retry",
    retry_count: Number(current.retry_count || 0),
    provider: event.provider || null,
    reason: event.reason || null,
    cooldown_ms: event.cooldown_ms || null,
    ...event,
  };

  // Keep last 20 retry events
  const updatedEvents = [...retryEvents, newEvent].slice(-20);

  return patchIssueState(issueIdentifier, {
    notes: {
      ...current.notes,
      retry_events: updatedEvents,
    },
  });
}
