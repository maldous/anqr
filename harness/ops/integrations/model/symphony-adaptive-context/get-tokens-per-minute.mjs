import { providerStates } from "./provider-states.mjs";
import { pruneTokenEvents } from "./prune-token-events.mjs";

export function getTokensPerMinute(providerName) {
  if (!providerStates.has(providerName)) return 0;
  const state = providerStates.get(providerName);
  pruneTokenEvents(state);
  let total = 0;
  for (const evt of state.tokenEvents) {
    total += evt.inputTokens + evt.outputTokens;
  }
  return total;
}
