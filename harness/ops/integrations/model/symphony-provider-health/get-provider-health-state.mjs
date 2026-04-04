import { HEALTH_STATES } from "./health-states.mjs";
import { loadHealthState } from "./load-health-state.mjs";

export function getProviderHealthState(providerName) {
  const state = loadHealthState();
  return (
    state[providerName] || {
      state: HEALTH_STATES.UNKNOWN,
      lastUpdated: null,
      consecutiveFailures: 0,
      consecutiveSuccesses: 0,
    }
  );
}
