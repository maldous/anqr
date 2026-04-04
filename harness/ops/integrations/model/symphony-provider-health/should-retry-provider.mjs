// Generated from ../../../../scripts/ops/integrations/model/symphony-provider-health.mjs:176

import { HEALTH_STATES } from "./health-states.mjs";
import { getProviderHealthState } from "./get-provider-health-state.mjs";

export function shouldRetryProvider(providerName, cooldownMs = 360_000) {
  const health = getProviderHealthState(providerName);

  // Never retry disabled or blocked providers
  if (health.state === HEALTH_STATES.DISABLED || health.state === HEALTH_STATES.BLOCKED) {
    return false;
  }

  // Check cooldown period for cooling-down state
  if (health.state === HEALTH_STATES.COOLING_DOWN) {
    const timeSinceFailure = Date.now() - (health.lastFailure || 0);
    return timeSinceFailure >= cooldownMs;
  }

  // Always retry healthy, degraded, or unknown providers
  return true;
}
