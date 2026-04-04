// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:567

import { RUNNER_PROVIDER_FAILURE_WINDOW_SECS } from "../../../symphony-config.mjs";
import { shouldRetryProvider } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { loadFailures } from "./load-failures.mjs";

export function isRecentlyFailed(providerName) {
  const failures = loadFailures();
  const failedAt = failures[providerName];
  if (!failedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  const provider = PROVIDERS.find((p) => p.name === providerName);
  const windowSecs = provider?.failureWindowSecs || RUNNER_PROVIDER_FAILURE_WINDOW_SECS;
  const isRecent = now - failedAt < windowSecs;

  // Also check health state - if provider is disabled or blocked, don't retry
  if (!shouldRetryProvider(providerName, windowSecs * 1000)) {
    return true; // Treat as recently failed if health check says don't retry
  }

  return isRecent;
}
