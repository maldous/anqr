import { getProviderHealthState } from "../symphony-provider-health.mjs";

const CHRONIC_FAILURE_THRESHOLD = 5;

export function isChronicProbeFailure(providerName) {
  const health = getProviderHealthState(providerName);
  const consecutiveFailures = health.consecutiveFailures || 0;
  const consecutiveSuccesses = health.consecutiveSuccesses || 0;
  return consecutiveFailures >= CHRONIC_FAILURE_THRESHOLD && consecutiveSuccesses === 0;
}
