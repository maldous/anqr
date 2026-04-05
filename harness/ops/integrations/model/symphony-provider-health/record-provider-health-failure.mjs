import { isTransientProviderFailureType } from "../symphony-credit-gate/is-transient-provider-failure-type.mjs";

import { HEALTH_STATES } from "./health-states.mjs";
import { getProviderHealthState } from "./get-provider-health-state.mjs";
import { setProviderHealthState } from "./set-provider-health-state.mjs";

export function recordProviderHealthFailure(providerName, errorType = "unknown") {
  const current = getProviderHealthState(providerName);
  const consecutiveFailures = (current.consecutiveFailures || 0) + 1;
  const consecutiveSuccesses = 0;

  let newState = current.state;

  if (isTransientProviderFailureType(errorType)) {
    if (consecutiveFailures >= 3) {
      newState = HEALTH_STATES.COOLING_DOWN;
    } else if (consecutiveFailures >= 1) {
      newState = HEALTH_STATES.DEGRADED;
    }
  } else {
    newState = HEALTH_STATES.DEGRADED;
  }

  setProviderHealthState(providerName, newState, {
    consecutiveSuccesses,
    consecutiveFailures,
    lastFailure: Date.now(),
    lastErrorType: errorType,
  });
}
