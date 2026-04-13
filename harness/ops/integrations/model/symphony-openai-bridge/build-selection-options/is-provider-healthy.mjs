import { getProviderHealthState, HEALTH_STATES } from "../../symphony-provider-health.mjs";

export function isProviderHealthy(providerName) {
  const health = getProviderHealthState(providerName);
  return (
    health.state !== HEALTH_STATES.COOLING_DOWN &&
    health.state !== HEALTH_STATES.BLOCKED &&
    health.state !== HEALTH_STATES.DISABLED
  );
}
