import { getEffectiveProviderScoreWithBreakdown } from "./get-effective-provider-score-with-breakdown.mjs";

export function getEffectiveProviderScore(providerName, baseScore, stats, health, cachedProbe) {
  return getEffectiveProviderScoreWithBreakdown(providerName, baseScore, stats, health, cachedProbe)
    .effective;
}
