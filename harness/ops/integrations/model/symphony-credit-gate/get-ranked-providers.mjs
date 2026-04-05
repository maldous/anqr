import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { getEffectiveProviderScore } from "./get-effective-provider-score.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { loadStats } from "./load-stats.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { isProviderToolConfirmed } from "./is-provider-tool-confirmed.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";

export function getRankedProviders(options = {}) {
  let excludeNames = null;
  if (options.excludeNames instanceof Set) {
    excludeNames = options.excludeNames;
  } else if (Array.isArray(options.excludeNames)) {
    excludeNames = new Set(options.excludeNames);
  }
  const excludeSet = excludeNames;
  const includeAvailable = options.includeAvailable !== false;
  const stats = loadStats();
  const ranked = [];
  const safetyNets = [];
  const pending = [];
  const pendingSafetyNets = [];
  const seenProviders = new Set();
  const providersWithData = new Set(Object.keys(stats.selections));

  for (const name of Object.keys(stats.probeSelections || {})) {
    providersWithData.add(name);
  }

  for (const name of providersWithData) {
    if (excludeSet && excludeSet.has(name)) continue;
    const health = getProviderHealthState(name);
    if (health.state === HEALTH_STATES.BLOCKED || health.state === HEALTH_STATES.DISABLED) {
      continue;
    }
    const provider = PROVIDERS.find((candidate) => candidate.name === name);
    const cachedProbe = getCachedProbeEntry(name);
    if (shouldSkipProviderFromCache(cachedProbe)) {
      continue;
    }
    seenProviders.add(name);
    const score = stats.score[name];
    const tier = provider ? getProviderTier(provider) : TIER_FREE_CLOUD;
    const effectiveTier =
      name === "codebuff" && cachedProbe?.mode === "free" ? TIER_FREE_CLOUD : tier;
    const selections = stats.selections[name] || 0;
    const toolConfirmed = isProviderToolConfirmed(cachedProbe);
    const cachedAvailable = cachedProbe?.available === true;

    if (score !== null && score !== undefined) {
      const entry = {
        name,
        score: getEffectiveProviderScore(name, score, stats, health, cachedProbe),
        tier: effectiveTier,
        selections,
        toolConfirmed,
        cachedAvailable,
      };
      if (effectiveTier === TIER_LOCAL_SAFETY_NET) {
        safetyNets.push(entry);
      } else {
        ranked.push(entry);
      }
    } else {
      const entry = {
        name,
        score: "pending",
        tier: effectiveTier,
        selections,
        toolConfirmed,
        cachedAvailable,
      };
      if (effectiveTier === TIER_LOCAL_SAFETY_NET) {
        pendingSafetyNets.push(entry);
      } else {
        pending.push(entry);
      }
    }
  }

  if (includeAvailable) {
    for (const provider of PROVIDERS) {
      if (excludeSet && excludeSet.has(provider.name)) continue;
      if (seenProviders.has(provider.name)) continue;
      const health = getProviderHealthState(provider.name);
      if (health.state === HEALTH_STATES.BLOCKED || health.state === HEALTH_STATES.DISABLED) {
        continue;
      }
      const cachedProbe = getCachedProbeEntry(provider.name);
      if (shouldSkipProviderFromCache(cachedProbe)) {
        continue;
      }
      const tier = getProviderTier(provider);
      const effectiveTier =
        provider.name === "codebuff" && cachedProbe?.mode === "free" ? TIER_FREE_CLOUD : tier;
      const entry = {
        name: provider.name,
        score: "pending",
        tier: effectiveTier,
        selections: 0,
        toolConfirmed: isProviderToolConfirmed(cachedProbe),
        cachedAvailable: cachedProbe?.available === true,
      };
      if (effectiveTier === TIER_LOCAL_SAFETY_NET) {
        pendingSafetyNets.push(entry);
      } else {
        pending.push(entry);
      }
    }
  }

  ranked.sort((a, b) => b.score - a.score);
  safetyNets.sort((a, b) => b.score - a.score);
  pending.sort(
    (a, b) =>
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      Number(b.cachedAvailable) - Number(a.cachedAvailable) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name),
  );
  pendingSafetyNets.sort(
    (a, b) =>
      Number(b.toolConfirmed) - Number(a.toolConfirmed) ||
      Number(b.cachedAvailable) - Number(a.cachedAvailable) ||
      (b.selections || 0) - (a.selections || 0) ||
      a.name.localeCompare(b.name),
  );

  return [...ranked, ...pending, ...safetyNets, ...pendingSafetyNets].map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
