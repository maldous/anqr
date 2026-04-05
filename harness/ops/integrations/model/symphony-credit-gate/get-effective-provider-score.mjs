import { getProviderCachePenalty } from "./get-provider-cache-penalty.mjs";
import { getProviderHealthPenalty } from "./get-provider-health-penalty.mjs";
import { getProviderPreferenceBoost } from "./get-provider-preference-boost.mjs";
import { getProviderRecentSuccessBoost } from "./get-provider-recent-success-boost.mjs";

export function getEffectiveProviderScore(providerName, baseScore, stats, health, cachedProbe) {
  const score =
    baseScore +
    getProviderPreferenceBoost(providerName, cachedProbe) +
    getProviderRecentSuccessBoost(stats, providerName) -
    getProviderHealthPenalty(health) -
    getProviderCachePenalty(cachedProbe);
  return Math.max(0, Math.round(score * 100) / 100);
}
