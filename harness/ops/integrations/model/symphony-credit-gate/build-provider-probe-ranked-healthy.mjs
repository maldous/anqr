import { getProviderStats } from "./get-provider-stats.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";
import { isProviderCurrentPoolHealthy } from "./is-provider-current-pool-healthy.mjs";

export function buildProviderProbeRankedHealthy(results) {
  const stats = getProviderStats();
  const byName = new Map(results.map((result) => [result.providerName, result]));
  const ranked = [];
  const seen = new Set();
  for (const rankedProvider of getRankedProviders()) {
    const result = byName.get(rankedProvider.name);
    if (!isProviderCurrentPoolHealthy(result)) continue;
    seen.add(rankedProvider.name);
    const providerStats = stats[rankedProvider.name] || {};
    ranked.push({
      rank: rankedProvider.rank,
      providerName: rankedProvider.name,
      model: result.model,
      tier: rankedProvider.tier,
      score: rankedProvider.score,
      selections: providerStats.selections || 0,
      successRate: providerStats.successRate || "0%",
      probeSelections: providerStats.probeSelections || 0,
      probeSuccesses: providerStats.probeSuccesses || 0,
      probeFailures: providerStats.probeFailures || 0,
      probeAvgDurationMs: providerStats.probeAvgDurationMs || 0,
      reason: result.reason,
    });
  }
  for (const result of results) {
    if (!isProviderCurrentPoolHealthy(result) || seen.has(result.providerName)) continue;
    const providerStats = stats[result.providerName] || {};
    ranked.push({
      rank: null,
      providerName: result.providerName,
      model: result.model,
      tier: providerStats.tier || result.tier,
      score: providerStats.score ?? "pending",
      selections: providerStats.selections || 0,
      successRate: providerStats.successRate || "0%",
      probeSelections: providerStats.probeSelections || 0,
      probeSuccesses: providerStats.probeSuccesses || 0,
      probeFailures: providerStats.probeFailures || 0,
      probeAvgDurationMs: providerStats.probeAvgDurationMs || 0,
      reason: result.reason,
    });
  }
  return ranked;
}
