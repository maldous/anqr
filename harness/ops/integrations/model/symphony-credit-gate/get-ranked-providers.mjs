import { getProviderHealthState } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { TIER_PAID } from "./tier-paid.mjs";
import { getProviderBootstrapScore } from "./get-provider-bootstrap-score.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { getEffectiveProviderScoreWithBreakdown } from "./get-effective-provider-score-with-breakdown.mjs";
import { getEffectiveProviderTier } from "./get-effective-provider-tier.mjs";
import { isProviderToolConfirmed } from "./is-provider-tool-confirmed.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";
import { loadStats } from "./load-stats.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";

export function getRankedProviders(options = {}) {
  function sortRankedEntries(a, b) {
    const scoreA = typeof a.score === "number" ? a.score : Number.NEGATIVE_INFINITY;
    const scoreB = typeof b.score === "number" ? b.score : Number.NEGATIVE_INFINITY;
    return (
      scoreB - scoreA ||
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name)
    );
  }

  function sortPendingEntries(a, b) {
    return (
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name)
    );
  }

  let excludeNames = null;
  if (options.excludeNames instanceof Set) excludeNames = options.excludeNames;
  else if (Array.isArray(options.excludeNames)) excludeNames = new Set(options.excludeNames);

  const includeAvailable = options.includeAvailable !== false;
  const stats = loadStats();
  const probeResults = loadProbeResults();
  const ranked = [];
  const pending = [];
  const safetyNets = [];
  const pendingSafetyNets = [];

  for (const provider of PROVIDERS) {
    if (excludeNames && excludeNames.has(provider.name)) continue;

    const probeEntry = probeResults[provider.name] || getCachedProbeEntry(provider.name) || null;
    if (probeEntry?.permanentSkip || shouldSkipProviderFromCache(probeEntry, provider.name))
      continue;

    if (!includeAvailable && !probeEntry) {
      continue;
    }

    const health = getProviderHealthState(provider.name);
    let baseScore = stats.score?.[provider.name];
    const selections = stats.selections?.[provider.name] || 0;
    const tier = getEffectiveProviderTier(provider, probeEntry);

    // Paid providers without a persisted score get a bootstrap fallback
    // so they land in the "ranked" array instead of "pending"
    if ((baseScore === null || baseScore === undefined) && tier === TIER_PAID) {
      baseScore = getProviderBootstrapScore(provider.name, stats);
    }
    let effectiveScore = null;
    let scoreBreakdown = null;
    if (baseScore !== null && baseScore !== undefined) {
      const result = getEffectiveProviderScoreWithBreakdown(provider.name, baseScore, stats, health, probeEntry);
      effectiveScore = result.effective;
      scoreBreakdown = result.breakdown;
    }

    const entry = {
      name: provider.name,
      score: effectiveScore ?? "pending",
      tier,
      selections,
      toolConfirmed: isProviderToolConfirmed(probeEntry),
      contextLength: stats.contextLength?.[provider.name] || provider.contextLength || null,
      scoreBreakdown,
    };

    if (typeof effectiveScore === "number") {
      if (tier === TIER_LOCAL_SAFETY_NET) safetyNets.push(entry);
      else ranked.push(entry);
      continue;
    }

    if (tier === TIER_LOCAL_SAFETY_NET) pendingSafetyNets.push(entry);
    else pending.push(entry);
  }

  ranked.sort(sortRankedEntries);
  safetyNets.sort(sortRankedEntries);
  pending.sort(sortPendingEntries);
  pendingSafetyNets.sort(sortPendingEntries);

  return [...ranked, ...pending, ...safetyNets, ...pendingSafetyNets].map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
