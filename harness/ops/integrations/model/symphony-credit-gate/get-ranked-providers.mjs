import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_FREE_CLOUD } from "./tier-free-cloud.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { loadStats } from "./load-stats.mjs";

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

  // Build set of all providers with any data (runtime or probe)
  const providersWithData = new Set(Object.keys(stats.selections));
  for (const name of Object.keys(stats.probeSelections || {})) {
    providersWithData.add(name);
  }

  // First pass: include providers with stats and/or probe data
  for (const name of providersWithData) {
    if (excludeSet && excludeSet.has(name)) continue;

    // Skip unhealthy providers from ranking
    const health = getProviderHealthState(name);
    if (
      health.state === HEALTH_STATES.COOLING_DOWN ||
      health.state === HEALTH_STATES.BLOCKED ||
      health.state === HEALTH_STATES.DISABLED
    ) {
      continue;
    }

    seenProviders.add(name);
    const score = stats.score[name];
    const provider = PROVIDERS.find((p) => p.name === name);
    const tier = provider ? getProviderTier(provider) : TIER_FREE_CLOUD;
    const selections = stats.selections[name] || 0;

    if (score !== null && score !== undefined) {
      // Has enough data for ranking
      const entry = { name, score, tier, selections };
      if (tier === TIER_LOCAL_SAFETY_NET) {
        safetyNets.push(entry);
      } else {
        ranked.push(entry);
      }
    } else {
      // Not enough data yet (< 3 selections)
      const entry = { name, score: "pending", tier, selections };
      if (tier === TIER_LOCAL_SAFETY_NET) {
        pendingSafetyNets.push(entry);
      } else {
        pending.push(entry);
      }
    }
  }

  // Second pass: include available providers from probe that haven't been used yet
  if (includeAvailable) {
    for (const provider of PROVIDERS) {
      if (excludeSet && excludeSet.has(provider.name)) continue;
      if (seenProviders.has(provider.name)) continue;

      // Skip unhealthy providers from ranking
      const health = getProviderHealthState(provider.name);
      if (
        health.state === HEALTH_STATES.COOLING_DOWN ||
        health.state === HEALTH_STATES.BLOCKED ||
        health.state === HEALTH_STATES.DISABLED
      ) {
        continue;
      }

      const tier = getProviderTier(provider);
      const entry = { name: provider.name, score: "pending", tier, selections: 0 };
      if (tier === TIER_LOCAL_SAFETY_NET) {
        pendingSafetyNets.push(entry);
      } else {
        pending.push(entry);
      }
    }
  }

  // Sort each group by score descending (or by name for pending)
  ranked.sort((a, b) => b.score - a.score);
  safetyNets.sort((a, b) => b.score - a.score);
  pending.sort((a, b) => (b.selections || 0) - (a.selections || 0) || a.name.localeCompare(b.name));
  pendingSafetyNets.sort(
    (a, b) => (b.selections || 0) - (a.selections || 0) || a.name.localeCompare(b.name),
  );

  // Combine: ranked first, then pending, then safety nets (ranked + pending)
  const combined = [...ranked, ...pending, ...safetyNets, ...pendingSafetyNets];

  // Add rank position
  return combined.map((item, index) => ({ ...item, rank: index + 1 }));
}
