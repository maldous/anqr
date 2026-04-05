import { RUNNER_PROVIDER_FAILURE_WINDOW_SECS } from "../../../symphony-config.mjs";
import { shouldRetryProvider } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { loadFailures } from "./load-failures.mjs";

export function isRecentlyFailed(providerName) {
  const failures = loadFailures();
  const entry = failures[providerName];
  if (!entry) return false;
  if (entry?.permanentSkip) return true;
  if (entry?.transient === false) return false;
  const failedAt = typeof entry === "number" ? entry : entry.ts;
  if (!failedAt) return false;
  const now = Math.floor(Date.now() / 1000);
  const provider = PROVIDERS.find((p) => p.name === providerName);
  const windowSecs = provider?.failureWindowSecs || RUNNER_PROVIDER_FAILURE_WINDOW_SECS;
  const isRecent = now - failedAt < windowSecs;
  if (!shouldRetryProvider(providerName, windowSecs * 1000)) {
    return true;
  }
  return isRecent;
}
