import { MIN_SELECTIONS_FOR_RANKING } from "./min-selections-for-ranking.mjs";
import { PROVIDERS } from "./providers.mjs";
import { getProviderStats } from "./get-provider-stats.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";
import { logInfo } from "./logger.mjs";

export function logProviderStats(options = {}) {
  const ranked = getRankedProviders(options);
  const stats = getProviderStats();
  let excludeSet = null;
  if (options.excludeNames instanceof Set) {
    excludeSet = options.excludeNames;
  } else if (Array.isArray(options.excludeNames)) {
    excludeSet = new Set(options.excludeNames);
  }

  logInfo(`📊 Provider Rankings (dynamic scoring with context-awareness):`);
  if (ranked.length > 0) {
    for (const { rank, name, score, tier } of ranked) {
      const data = stats[name];
      const ctxLen = data?.contextLength || "?";
      const ctxLabel = ctxLen !== "?" && ctxLen > 0 ? `${Math.round(ctxLen / 1024)}K` : "?";
      const reliability = data?.probeUsageReliability ?? "?";
      logInfo(
        `  #${rank} ${name} [${tier}]: score=${score}, ${data.selections} sel, ${data.successRate} success, ${data.avgDurationMs}ms avg, ctx=${ctxLabel}, reliability=${reliability}`,
      );
    }
  } else {
    logInfo(`  (not enough data for ranking - need ${MIN_SELECTIONS_FOR_RANKING}+ selections)`);
  }

  // Get ALL providers from PROVIDERS list (not just those with stats)
  const allProviderNames = PROVIDERS.map((p) => p.name);

  logInfo(`📈 Provider Details (${allProviderNames.length} total):`);

  // Sort by selections descending, then by name
  const sortedProviders = allProviderNames.sort((a, b) => {
    const statsA = stats[a]?.selections || 0;
    const statsB = stats[b]?.selections || 0;
    if (statsB !== statsA) return statsB - statsA;
    return a.localeCompare(b);
  });

  for (const name of sortedProviders) {
    if (excludeSet && excludeSet.has(name)) continue;
    const data = stats[name];
    if (data) {
      const probeInfo =
        data.probeSelections > 0
          ? ` | probe: ${data.probeSelections}p ${data.probeSuccesses}✓ ${data.probeFailures}✗`
          : "";
      logInfo(
        `  ${name}: ${data.selections} sel, ${data.successes}✓ ${data.failures}✗, ${data.validationRate} valid, ${data.avgDurationMs}ms avg${probeInfo}`,
      );
    } else {
      logInfo(`  ${name}: 0 sel, 0✓ 0✗, N/A valid, -- ms avg (never selected)`);
    }
  }
}
