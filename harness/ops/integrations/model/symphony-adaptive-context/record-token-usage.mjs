import { getOrCreateState } from "./get-or-create-state.mjs";
import { pruneRequestEvents } from "./prune-request-events.mjs";
import { pruneTokenEvents } from "./prune-token-events.mjs";

export function recordTokenUsage(providerName, usage) {
  const { inputTokens, outputTokens } = usage || {};
  const state = getOrCreateState(providerName);
  const now = Date.now();
  state.tokenEvents.push({
    ts: now,
    inputTokens: inputTokens || 0,
    outputTokens: outputTokens || 0,
  });
  state.requestEvents.push({ ts: now });
  pruneTokenEvents(state);
  pruneRequestEvents(state);
}
