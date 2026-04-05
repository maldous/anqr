import { getProviderPreferenceBoost } from "./get-provider-preference-boost.mjs";

export function getProviderBootstrapScore(providerName, stats) {
  const probeSelections = stats.probeSelections?.[providerName] || 0;
  const probeSuccesses = stats.probeSuccesses?.[providerName] || 0;
  const probeRate = probeSelections > 0 ? probeSuccesses / probeSelections : 0.5;
  const lastSuccess = stats.lastSuccess?.[providerName] || stats.lastSelected?.[providerName] || 0;
  const ageDays = lastSuccess > 0 ? (Date.now() - lastSuccess) / (1000 * 60 * 60 * 24) : 30;
  const recency = Math.max(0, 1 - ageDays / 30);
  const bootstrap =
    0.45 + probeRate * 0.2 + recency * 0.15 + getProviderPreferenceBoost(providerName);
  return Math.round(Math.min(0.95, bootstrap) * 100) / 100;
}
