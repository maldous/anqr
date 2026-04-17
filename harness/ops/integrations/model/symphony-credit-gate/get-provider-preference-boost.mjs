import { PROVIDERS } from "./providers.mjs";
import { TIER_PAID } from "./tier-paid.mjs";

/**
 * Returns a preference boost for paid-tier providers so they rank above
 * free-cloud providers even without usage history. The boost (0.35) is
 * large enough to clear the ~0.86 ceiling of top free models and interacts
 * correctly with health/cache penalties — a degraded paid provider still
 * gets deprioritized.
 *
 * Boost of 0.35 ensures paid providers with bootstrap score (~0.55)
 * outrank top free providers (~0.86): 0.55 + 0.35 = 0.90.
 */
export function getProviderPreferenceBoost(providerName, _cachedProbe) {
  const provider = PROVIDERS.find((p) => p.name === providerName);
  if (provider && provider.tier === TIER_PAID) {
    return 0.35;
  }
  return 0;
}
