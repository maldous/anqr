import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { TIER_LOCAL_SAFETY_NET } from "./tier-local-safety-net.mjs";
import { buildProviderSelectionCandidateNames } from "./build-provider-selection-candidate-names.mjs";
import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { ensureStateDir } from "./ensure-state-dir.mjs";
import { getProviderTier } from "./get-provider-tier.mjs";
import { isPreferredPaidProviderEligible } from "./is-preferred-paid-provider-eligible.mjs";
import { loadProbeResults } from "./load-probe-results.mjs";
import { matchesAllowedNames } from "./matches-allowed-names.mjs";
import { matchesExcludedNames } from "./matches-excluded-names.mjs";
import { tryProvider } from "./try-provider.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function selectProvider(options = {}) {
  ensureStateDir();
  const probeResults = loadProbeResults();
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
    allowedNames: allowedNames ? Array.from(allowedNames) : null,
    excludedNames: excludedNames ? Array.from(excludedNames) : null,
  });

  const preferredPaid = new Set(
    buildProviderSelectionCandidateNames().filter((name) =>
      isPreferredPaidProviderEligible(name, probeResults[name]),
    ),
  );
  const orderedNames = buildProviderSelectionCandidateNames();

  logDebug(`[selectProvider] Candidate order`, {
    candidateCount: orderedNames.length,
    topCandidates: orderedNames.slice(0, 10),
  });

  for (const providerName of orderedNames) {
    const provider = PROVIDERS.find((candidate) => candidate.name === providerName);
    if (
      !provider ||
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    )
      continue;
    const health = getProviderHealthState(provider.name);
    if (health.state === HEALTH_STATES.COOLING_DOWN || health.state === HEALTH_STATES.BLOCKED)
      continue;
    const selected = await tryProvider(provider);
    if (selected) {
      const source = preferredPaid.has(providerName) ? "preferred" : "ranked";
      logInfo(`[selectProvider] Selected ${source} provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
    }
  }

  logDebug(`[selectProvider] Trying fixed provider order (fallback)`);
  for (const provider of PROVIDERS) {
    if (
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    )
      continue;
    const selected = await tryProvider(provider);
    if (selected) {
      logInfo(`[selectProvider] Selected fallback provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
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
    const selected = await tryProvider(provider);
    if (selected) {
      logWarn(
        `[selectProvider] P0 SAFETY NET activated: ${selected.name} (all restrictions bypassed)`,
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
