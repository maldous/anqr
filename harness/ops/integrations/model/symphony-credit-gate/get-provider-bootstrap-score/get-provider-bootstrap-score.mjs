import { computeContextBootstrapBoost } from "./compute-context-bootstrap-boost.mjs";

export function getProviderBootstrapScore(providerName, stats) {
  const probeSelections = stats.probeSelections?.[providerName] || 0;
  const probeSuccesses = stats.probeSuccesses?.[providerName] || 0;
  const probeRate = probeSelections > 0 ? probeSuccesses / probeSelections : 0.5;
  const lastSuccess = stats.lastSuccess?.[providerName] || stats.lastSelected?.[providerName] || 0;
  const ageDays = lastSuccess > 0 ? (Date.now() - lastSuccess) / (1000 * 60 * 60 * 24) : 30;
  const recency = Math.max(0, 1 - ageDays / 30);
  const contextLength = stats.contextLength?.[providerName] || 0;
  const contextBoost = computeContextBootstrapBoost(contextLength);
  // NOTE: getProviderPreferenceBoost is NOT added here to avoid double-counting
  // — it's applied in getEffectiveProviderScoreWithBreakdown instead
  const bootstrap =
    0.45 +
    probeRate * 0.2 +
    recency * 0.15 +
    contextBoost;
  return Math.round(Math.min(0.95, bootstrap) * 100) / 100;
}
