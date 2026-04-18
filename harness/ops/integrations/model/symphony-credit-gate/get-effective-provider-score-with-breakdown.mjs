import { getProviderCachePenalty } from "./get-provider-cache-penalty.mjs";
import { getProviderHealthPenalty } from "./get-provider-health-penalty.mjs";
import { getProviderPreferenceBoost } from "./get-provider-preference-boost.mjs";
import { getProviderRecentSuccessBoost } from "./get-provider-recent-success-boost.mjs";

/**
 * Returns the effective score AND its component breakdown.
 * Used by selectionLog to explain "why provider A beat provider B".
 */
export function getEffectiveProviderScoreWithBreakdown(
  providerName,
  baseScore,
  stats,
  health,
  cachedProbe,
) {
  const preferenceBoost = getProviderPreferenceBoost(providerName, cachedProbe);
  const recentSuccessBoost = getProviderRecentSuccessBoost(stats, providerName);
  const healthPenalty = getProviderHealthPenalty(health);
  const cachePenalty = getProviderCachePenalty(cachedProbe);
  const raw = baseScore + preferenceBoost + recentSuccessBoost - healthPenalty - cachePenalty;
  const effective = Math.max(0, Math.round(raw * 100) / 100);
  return {
    effective,
    breakdown: { baseScore, preferenceBoost, recentSuccessBoost, healthPenalty, cachePenalty },
  };
}
