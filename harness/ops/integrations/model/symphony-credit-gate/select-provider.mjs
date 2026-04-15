import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { buildProviderSelectionCandidateNames } from "./build-provider-selection-candidate-names.mjs";
import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
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

  const orderedNames = buildProviderSelectionCandidateNames({ excludeNames: excludedNames });

  logInfo(`[selectProvider] Candidate order (ranked)`, {
    candidateCount: orderedNames.length,
    top: orderedNames.slice(0, 12),
  });

  for (const providerName of orderedNames) {
    const provider = PROVIDERS.find((candidate) => candidate.name === providerName);
    if (!provider) {
      if (selectionLog) selectionLog.push({ name: providerName, status: "skipped", reason: "not_found" });
      continue;
    }
    if (!matchesAllowedNames(provider, allowedNames)) {
      if (selectionLog) selectionLog.push({ name: providerName, status: "skipped", reason: "not_in_allowed" });
      continue;
    }
    if (matchesExcludedNames(provider, excludedNames)) {
      if (selectionLog) selectionLog.push({ name: providerName, status: "skipped", reason: "excluded" });
      continue;
    }
    const health = getProviderHealthState(provider.name);
    if (health.state === HEALTH_STATES.COOLING_DOWN || health.state === HEALTH_STATES.BLOCKED) {
      if (selectionLog) selectionLog.push({ name: providerName, status: "skipped", reason: health.state });
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      if (selectionLog) selectionLog.push({ name: selected.name, status: "selected", tier: selected.tier });
      logInfo(`[selectProvider] Selected ranked provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
    }
    if (selectionLog) selectionLog.push({ name: providerName, status: "failed", reason: "try_failed" });
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
      if (selectionLog) selectionLog.push({ name: selected.name, status: "safety_net_selected", tier: selected.tier });
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
