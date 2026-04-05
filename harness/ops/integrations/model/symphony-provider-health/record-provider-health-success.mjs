import { HEALTH_STATES } from "./health-states.mjs";
import { getProviderHealthState } from "./get-provider-health-state.mjs";
import { setProviderHealthState } from "./set-provider-health-state.mjs";

export function recordProviderHealthSuccess(providerName) {
  const current = getProviderHealthState(providerName);
  const consecutiveSuccesses = (current.consecutiveSuccesses || 0) + 1;
  const consecutiveFailures = 0;
  const newState = HEALTH_STATES.HEALTHY;

  setProviderHealthState(providerName, newState, {
    consecutiveSuccesses,
    consecutiveFailures,
    lastSuccess: Date.now(),
  });
}
