import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { getRankedProviders } from "./get-ranked-providers.mjs";
import { matchesAllowedNames } from "./matches-allowed-names.mjs";
import { matchesExcludedNames } from "./matches-excluded-names.mjs";
import { tryProvider } from "./try-provider.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function selectProvider(options = {}) {
  ensureStateDir();
  const allowSafetyNetOverride = options.allowSafetyNetOverride === true;
  const selectionLog = options.selectionLog || null;
  const allowedNames =
    Array.isArray(options.allowedNames) && options.allowedNames.length > 0
      ? new Set(options.allowedNames)
      : null;
  const excludedNames =
    Array.isArray(options.excludeNames) && options.excludeNames.length > 0
      ? new Set(options.excludeNames)
      : null;
  logDebug(`[selectProvider] Entry`, {
    allowedCount: allowedNames?.size || 0,
    excludedCount: excludedNames?.size || 0,
    allowSafetyNetOverride,
    allowedNames: allowedNames ? Array.from(allowedNames) : null,
    excludedNames: excludedNames ? Array.from(excludedNames) : null,
  });

  // Single getRankedProviders call provides both candidate ordering and
  // score/rank metrics for selectionLog entries — avoids a duplicate call
  // through buildProviderSelectionCandidateNames.
  const rankedEntries = getRankedProviders({ includeAvailable: true, excludeNames: excludedNames });
  const orderedNames = [];
  const scoreByName = new Map();
  const seen = new Set();
  for (const entry of rankedEntries) {
    if (!entry?.name || seen.has(entry.name)) continue;
    seen.add(entry.name);
    orderedNames.push(entry.name);
    scoreByName.set(entry.name, {
      score: entry.score,
      rank: entry.rank,
      selections: entry.selections,
      toolConfirmed: entry.toolConfirmed,
      scoreBreakdown: entry.scoreBreakdown || null,
    });
  }

  logInfo(`[selectProvider] Candidate order (ranked)`, {
    candidateCount: orderedNames.length,
    top: orderedNames.slice(0, 12),
  });

  for (const providerName of orderedNames) {
    const provider = PROVIDERS.find((candidate) => candidate.name === providerName);
    const metrics = scoreByName.get(providerName) || null;
    if (!provider) {
      if (selectionLog)
        selectionLog.push({
          name: providerName,
          status: "skipped",
          reason: "not_found",
          ...metrics,
        });
      continue;
    }
    if (!matchesAllowedNames(provider, allowedNames)) {
      if (selectionLog)
        selectionLog.push({
          name: providerName,
          status: "skipped",
          reason: "not_in_allowed",
          ...metrics,
        });
      continue;
    }
    if (matchesExcludedNames(provider, excludedNames)) {
      if (selectionLog)
        selectionLog.push({
          name: providerName,
          status: "skipped",
          reason: "excluded",
          ...metrics,
        });
      continue;
    }
    const health = getProviderHealthState(provider.name);
    // SDK providers own their own failure handling; never skip them based on health state
    if (
      !provider.requiresSdk &&
      (health.state === HEALTH_STATES.COOLING_DOWN || health.state === HEALTH_STATES.BLOCKED)
    ) {
      if (selectionLog)
        selectionLog.push({
          name: providerName,
          status: "skipped",
          reason: health.state,
          ...metrics,
        });
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      if (selectionLog)
        selectionLog.push({
          name: selected.name,
          status: "selected",
          tier: selected.tier,
          ...metrics,
        });
      logInfo(`[selectProvider] Selected ranked provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
    }
    if (selectionLog)
      selectionLog.push({ name: providerName, status: "failed", reason: "try_failed", ...metrics });
  }

  if (!allowSafetyNetOverride) {
    logWarn(`[selectProvider] No provider available within requested constraints`, {
      allowedCount: allowedNames?.size || 0,
      excludedCount: excludedNames?.size || 0,
      totalProviders: PROVIDERS.length,
    });
    return null;
  }

  logWarn(
    `[selectProvider] All ranked providers exhausted — invoking explicit safety-net override`,
    {
      allowedCount: allowedNames?.size || 0,
      excludedCount: excludedNames?.size || 0,
      totalProviders: PROVIDERS.length,
    },
  );
  for (const provider of PROVIDERS) {
    if (getProviderTier(provider) !== TIER_LOCAL_SAFETY_NET) continue;
    clearProviderFailure(provider.name);
    const selected = await tryProvider(provider);
    if (selected) {
      if (selectionLog)
        selectionLog.push({
          name: selected.name,
          status: "safety_net_selected",
          tier: selected.tier,
          score: "safety_net",
          rank: null,
        });
      logWarn(
        `[selectProvider] P0 SAFETY NET activated: ${selected.name} (all ranked candidates exhausted)`,
        {
          providerName: selected.name,
          tier: selected.tier,
          bypassedAllowedNames: allowedNames ? Array.from(allowedNames) : null,
          bypassedExcludedNames: excludedNames ? Array.from(excludedNames) : null,
        },
      );
      return selected;
    }
  }

  logWarn(`[selectProvider] No provider available (safety-net also failed)`, {
    allowedCount: allowedNames?.size || 0,
    excludedCount: excludedNames?.size || 0,
    totalProviders: PROVIDERS.length,
  });
  return null;
}
