import { findProviderByName } from "./find-provider-by-name.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { getProviderStats } from "./get-provider-stats.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";
import { isProviderRankedPoolEligible } from "./is-provider-ranked-pool-eligible.mjs";
import { providerProbeRouteInfo } from "./provider-probe-route-info.mjs";

export function buildProviderProbeRankedHealthy(results) {
  const stats = getProviderStats();
  const byName = new Map(results.map((result) => [result.providerName, result]));
  const ranked = [];
  const seen = new Set();
  for (const rankedProvider of getRankedProviders()) {
    const provider = findProviderByName(rankedProvider.name);
    const result = byName.get(rankedProvider.name);
    const cachedProbe = getCachedProbeEntry(rankedProvider.name);
    const routeInfo = result?.routeInfo || (provider ? providerProbeRouteInfo(provider) : null);
    const bridgeRoute =
      result?.bridgeRoute ||
      (routeInfo?.isBridgeBlocked
        ? { status: "blocked", reason: "bridge blocked" }
        : routeInfo?.advertisedRouteIds?.length
          ? { status: "advertised", reason: routeInfo.advertisedRouteIds.join(", ") || "advertised" }
          : { status: "not_advertised", reason: "not advertised" });
    const candidate = {
      ...(cachedProbe || {}),
      ...(result || {}),
      routeInfo,
      bridgeRoute,
      toolProbe:
        result?.toolProbe ||
        cachedProbe?.toolProbe ||
        (routeInfo?.knownToolCapable
          ? { toolStatus: "capable", detail: "known tool capable" }
          : { toolStatus: "not_probed", detail: "not probed" }),
    };
    if (!isProviderRankedPoolEligible(candidate)) continue;
    seen.add(rankedProvider.name);
    const providerStats = stats[rankedProvider.name] || {};
    ranked.push({
      rank: rankedProvider.rank,
      providerName: rankedProvider.name,
      model: result?.model || provider?.model || cachedProbe?.model || "-",
      tier: rankedProvider.tier,
      score: rankedProvider.score,
      selections: providerStats.selections || 0,
      successRate: providerStats.successRate || "0%",
      probeSelections: providerStats.probeSelections || 0,
      probeSuccesses: providerStats.probeSuccesses || 0,
      probeFailures: providerStats.probeFailures || 0,
      probeAvgDurationMs: providerStats.probeAvgDurationMs || 0,
      reason:
        result?.reason ||
        cachedProbe?.reason ||
        cachedProbe?.message ||
        "historical evidence retained",
    });
  }
  for (const result of results) {
    if (seen.has(result.providerName)) continue;
    if (!isProviderRankedPoolEligible(result)) continue;
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
