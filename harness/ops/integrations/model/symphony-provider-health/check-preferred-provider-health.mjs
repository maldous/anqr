// Generated from ../../../../scripts/ops/integrations/model/symphony-provider-health.mjs:208

import { HEALTH_STATES } from "./health-states.mjs";
import { isLocalProvider } from "./is-local-provider.mjs";
import { loadHealthState } from "./load-health-state.mjs";
import { setProviderHealthState } from "./set-provider-health-state.mjs";
import { logInfo } from "./logger.mjs";

export function checkPreferredProviderHealth(preferredProviders = []) {
  const healthStates = loadHealthState();

  for (const providerName of preferredProviders) {
    const health = healthStates[providerName];
    if (!health) continue;

    // Check if preferred provider is now healthy and past cooldown
    if (health.state === HEALTH_STATES.HEALTHY) {
      logInfo(`Preferred provider ${providerName} is healthy - can be used again`);
      return providerName;
    }

    // Check if cooling-down period has expired
    if (health.state === HEALTH_STATES.COOLING_DOWN) {
      const timeSinceFailure = Date.now() - (health.lastFailure || 0);
      const cooldownMs = isLocalProvider(providerName) ? 120_000 : 360_000;

      if (timeSinceFailure >= cooldownMs) {
        // Reset to unknown so it can be re-probed
        setProviderHealthState(providerName, HEALTH_STATES.UNKNOWN, {
          consecutiveSuccesses: 0,
          consecutiveFailures: 0,
        });
        logInfo(`Preferred provider ${providerName} cooldown expired - ready for retry`);
        return providerName;
      }
    }
  }

  return null;
}
