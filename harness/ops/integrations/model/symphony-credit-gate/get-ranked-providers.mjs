import { getProviderHealthState } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { getEffectiveProviderScore } from "./get-effective-provider-score.mjs";
import { getEffectiveProviderTier } from "./get-effective-provider-tier.mjs";
import { isProviderToolConfirmed } from "./is-provider-tool-confirmed.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";
import { loadStats } from "./load-stats.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";

export function getRankedProviders(options = {}) {
  let excludeNames = null;
  if (options.excludeNames instanceof Set) excludeNames = options.excludeNames;
  else if (Array.isArray(options.excludeNames)) excludeNames = new Set(options.excludeNames);
  const excludeSet = excludeNames;
  const includeAvailable = options.includeAvailable !== false;
  const stats = loadStats();
  const probeResults = loadProbeResults();
  const ranked = [];
  const safetyNets = [];
  const pending = [];
  const pendingSafetyNets = [];
  const seenProviders = new Set();
  const providersWithData = new Set(Object.keys(stats.selections || {}));
  for (const name of Object.keys(stats.probeSelections || {})) providersWithData.add(name);
  for (const name of Object.keys(probeResults || {})) providersWithData.add(name);

  for (const name of providersWithData) {
    if (excludeSet && excludeSet.has(name)) continue;
    const provider = PROVIDERS.find((candidate) => candidate.name === name);
    const probeEntry = probeResults[name] || null;
    if (probeEntry?.permanentSkip || shouldSkipProviderFromCache(probeEntry)) continue;
    seenProviders.add(name);
    const tier = provider ? getEffectiveProviderTier(provider, probeEntry) : "free-cloud";
    const selections = stats.selections?.[name] || 0;
    const baseScore = stats.score?.[name];
    const health = getProviderHealthState(name);
    const effectiveScore =
      baseScore === null || baseScore === undefined
        ? null
        : getEffectiveProviderScore(name, baseScore, stats, health, probeEntry);
    const entry = {
      name,
      score: effectiveScore ?? "pending",
      tier,
      selections,
      toolConfirmed: isProviderToolConfirmed(probeEntry),
    };
    if (effectiveScore !== null && effectiveScore !== undefined) {
      if (tier === TIER_LOCAL_SAFETY_NET) safetyNets.push(entry);
      else ranked.push(entry);
    } else if (tier === TIER_LOCAL_SAFETY_NET) {
      pendingSafetyNets.push(entry);
    } else {
      pending.push(entry);
    }
  }

  if (includeAvailable) {
    for (const provider of PROVIDERS) {
      if (excludeSet && excludeSet.has(provider.name)) continue;
      if (seenProviders.has(provider.name)) continue;
      const probeEntry = getCachedProbeEntry(provider.name);
      if (probeEntry?.permanentSkip || shouldSkipProviderFromCache(probeEntry)) continue;
      const tier = getEffectiveProviderTier(provider, probeEntry);
      const entry = {
        name: provider.name,
        score: "pending",
        tier,
        selections: 0,
        toolConfirmed: isProviderToolConfirmed(probeEntry),
      };
      if (tier === TIER_LOCAL_SAFETY_NET) pendingSafetyNets.push(entry);
      else pending.push(entry);
    }
  }

  ranked.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      a.name.localeCompare(b.name),
  );
  safetyNets.sort(
    (a, b) =>
      b.score - a.score ||
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      a.name.localeCompare(b.name),
  );
  pending.sort(
    (a, b) =>
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name),
  );
  pendingSafetyNets.sort(
    (a, b) =>
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name),
  );
  return [...ranked, ...pending, ...safetyNets, ...pendingSafetyNets].map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
