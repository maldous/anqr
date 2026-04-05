import { HEALTH_STATES } from "../symphony-provider-health.mjs";

export function getProviderHealthPenalty(health) {
  if (!health) return 0;
  if (health.state === HEALTH_STATES.COOLING_DOWN) return 0.08;
  if (health.state === HEALTH_STATES.DEGRADED) return 0.03;
  return 0;
}
