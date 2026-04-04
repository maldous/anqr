import { providerStates } from "./provider-states.mjs";

export function isProviderThrottled(providerName) {
  if (!providerStates.has(providerName)) return false;
  const state = providerStates.get(providerName);
  if (!state.rateLimit.throttledUntil) return false;
  if (Date.now() >= state.rateLimit.throttledUntil) {
    state.rateLimit.throttledUntil = null;
    return false;
  }
  return true;
}
