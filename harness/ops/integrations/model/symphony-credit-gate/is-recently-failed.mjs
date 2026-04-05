import { RUNNER_PROVIDER_FAILURE_WINDOW_SECS } from "../../../symphony-config.mjs";
import { shouldRetryProvider } from "../symphony-provider-health.mjs";

import { findProviderByName } from "./find-provider-by-name.mjs";
import { loadFailures } from "./load-failures.mjs";
import { providerGatewayKey } from "./provider-gateway-key.mjs";

export function isRecentlyFailed(providerName) {
  const failures = loadFailures();
  const provider = findProviderByName(providerName);
  const windowSecs = provider?.failureWindowSecs || RUNNER_PROVIDER_FAILURE_WINDOW_SECS;
  const now = Math.floor(Date.now() / 1000);
  const gatewayKey = providerGatewayKey({ name: providerName });
  const providerFailure = failures[providerName];
  const gatewayFailure = failures[gatewayKey];
  const providerFailedAt =
    typeof providerFailure === "number" ? providerFailure : providerFailure?.failedAt || 0;
  const gatewayFailedAt =
    typeof gatewayFailure === "number" ? gatewayFailure : gatewayFailure?.failedAt || 0;
  const failedAt = Math.max(providerFailedAt, gatewayFailedAt);
  const isRecent = failedAt > 0 && now - failedAt < windowSecs;
  if (!shouldRetryProvider(providerName, windowSecs * 1000)) return true;
  if (gatewayKey !== providerName && !shouldRetryProvider(gatewayKey, windowSecs * 1000)) {
    return true;
  }
  return isRecent;
}
