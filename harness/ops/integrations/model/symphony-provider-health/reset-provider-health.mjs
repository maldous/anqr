import { HEALTH_STATES } from "./health-states.mjs";
import { setProviderHealthState } from "./set-provider-health-state.mjs";

export function resetProviderHealth(providerName) {
  setProviderHealthState(providerName, HEALTH_STATES.HEALTHY, {
    consecutiveSuccesses: 0,
    consecutiveFailures: 0,
    lastUpdated: Date.now(),
  });
}
