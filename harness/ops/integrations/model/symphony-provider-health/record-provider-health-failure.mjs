import { HEALTH_STATES } from "./health-states.mjs";
import { getProviderHealthState } from "./get-provider-health-state.mjs";
import { setProviderHealthState } from "./set-provider-health-state.mjs";

export function recordProviderHealthFailure(providerName, errorType = "unknown") {
  const current = getProviderHealthState(providerName);
  const normalized = String(errorType || "").toLowerCase();
  const durable =
    normalized.includes("auth_invalid") ||
    normalized.includes("auth_missing") ||
    normalized.includes("quota_exhausted") ||
    normalized.includes("payment required") ||
    normalized.includes("forbidden") ||
    normalized.includes("invalid api key");
  const permanent = normalized.includes("never purchased credits");
  const consecutiveFailures = (current.consecutiveFailures || 0) + 1;
  const consecutiveSuccesses = 0;
  let newState = current.state;

  if (permanent) {
    newState = HEALTH_STATES.BLOCKED;
  } else if (durable) {
    newState = HEALTH_STATES.DEGRADED;
  } else if (consecutiveFailures >= 3) {
    newState = HEALTH_STATES.COOLING_DOWN;
  } else if (consecutiveFailures >= 1) {
    newState = HEALTH_STATES.DEGRADED;
  }

  setProviderHealthState(providerName, newState, {
    consecutiveSuccesses,
    consecutiveFailures,
    lastFailure: Date.now(),
    lastErrorType: errorType,
  });
}
