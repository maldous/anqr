import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { buildProviderSelectionCandidateNames } from "./build-provider-selection-candidate-names.mjs";
import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { findProviderByName } from "./find-provider-by-name.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { matchesAllowedNames } from "./matches-allowed-names.mjs";
import { matchesExcludedNames } from "./matches-excluded-names.mjs";
import { tryProvider } from "./try-provider.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";
import { PROVIDERS } from "./providers.mjs";

export async function selectProvider(options = {}) {
  ensureStateDir();
  const allowedNames =
    Array.isArray(options.allowedNames) && options.allowedNames.length > 0
      ? new Set(options.allowedNames)
      : null;
  const excludedNames =
    Array.isArray(options.excludeNames) && options.excludeNames.length > 0
      ? new Set(options.excludeNames)
      : null;
  const candidateNames = buildProviderSelectionCandidateNames();
  const leasePhases = ["family", "model", "shared"];

  logDebug(`[selectProvider] Entry`, {
    allowedCount: allowedNames?.size || 0,
    excludedCount: excludedNames?.size || 0,
    candidateCount: candidateNames.length,
  });

  for (const leasePhase of leasePhases) {
    logDebug(`[selectProvider] Trying provider phase`, { leasePhase });
    for (const providerName of candidateNames) {
      const provider = findProviderByName(providerName);
      if (
        !provider ||
        !matchesAllowedNames(provider, allowedNames) ||
        matchesExcludedNames(provider, excludedNames)
      )
        continue;
      const cachedProbe = getCachedProbeEntry(provider.name);
      if (provider.name === "codebuff" && cachedProbe?.mode === "free" && leasePhase === "family")
        continue;
      const selected = await tryProvider(provider, { leasePhase });
      if (selected) {
        logInfo(`[selectProvider] Selected provider`, {
          providerName: selected.name,
          tier: selected.tier,
          leasePhase,
        });
        return selected;
      }
    }
  }

  logWarn(
    `[selectProvider] All providers exhausted — invoking P0 safety-net override (ignoring allowedNames/excludedNames)`,
    {
      allowedCount: allowedNames?.size || 0,
      excludedCount: excludedNames?.size || 0,
      totalProviders: PROVIDERS.length,
    },
  );
  for (const provider of PROVIDERS) {
    if (getProviderTier(provider) !== TIER_LOCAL_SAFETY_NET) continue;
    clearProviderFailure(provider.name);
    const selected = await tryProvider(provider, { leasePhase: "shared" });
    if (selected) {
      logWarn(
        `[selectProvider] P0 SAFETY NET activated: ${selected.name} (all restrictions bypassed)`,
        {
          providerName: selected.name,
          tier: selected.tier,
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
