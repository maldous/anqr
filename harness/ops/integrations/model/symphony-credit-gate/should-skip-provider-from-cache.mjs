import { hasDurableProviderAccessFailure } from "./has-durable-provider-access-failure.mjs";
import { isChronicProbeFailure } from "./is-chronic-probe-failure.mjs";
import { isStaleQuotaExhausted } from "./is-stale-quota-exhausted.mjs";

const HARD_SKIP_STATUSES = new Set(["auth_missing", "auth_invalid"]);

export function shouldSkipProviderFromCache(entry, providerName) {
  if (!entry) return false;
  // Hard-skip providers with permanently broken auth
  if (HARD_SKIP_STATUSES.has(entry.status)) return true;
  if (hasDurableProviderAccessFailure(entry)) return true;
  // Skip providers whose quota has been exhausted for >24h (stale quota)
  if (providerName && isStaleQuotaExhausted(providerName)) return true;
  // Skip providers with chronic probe failures (5+ consecutive, 0 successes)
  if (providerName && isChronicProbeFailure(providerName)) return true;
  // Fresh quota_exhausted (< 24h) is NOT a hard skip — it may recover
  return false;
}
