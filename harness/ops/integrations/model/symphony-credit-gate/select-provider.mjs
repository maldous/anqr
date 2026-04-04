// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1565

import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { PREFERRED_PROVIDER_ORDER } from "./preferred-provider-order.mjs";
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

  // Skip preferred providers that are in cooling-down or blocked state
  const healthyPreferredProviders = PREFERRED_PROVIDER_ORDER.filter((name) => {
    const health = getProviderHealthState(name);
    return health.state !== HEALTH_STATES.COOLING_DOWN && health.state !== HEALTH_STATES.BLOCKED;
  });

  logDebug(`[selectProvider] Trying preferred providers`, {
    preferredOrder: PREFERRED_PROVIDER_ORDER,
    healthyPreferredProviders,
    skippedDueToHealth: PREFERRED_PROVIDER_ORDER.filter(
      (n) => !healthyPreferredProviders.includes(n),
    ),
  });
  for (const providerName of healthyPreferredProviders) {
    const provider = PROVIDERS.find((candidate) => candidate.name === providerName);
    if (
      !provider ||
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    ) {
      let reason;
      if (!provider) {
        reason = "not found";
      } else if (matchesAllowedNames(provider, allowedNames)) {
        reason = "excluded";
      } else {
        reason = "not allowed";
      }
      logDebug(`[selectProvider] Skipping preferred provider`, {
        providerName,
        reason,
      });
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      logInfo(`[selectProvider] Selected preferred provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
    }
  }

  // PRIMARY: try providers in dynamic ranking order - this is now the main path
  const ranked = getRankedProviders();
  logDebug(`[selectProvider] Dynamic ranking`, {
    rankedCount: ranked.length,
    topProviders: ranked.slice(0, 5).map((r) => ({ name: r.name, score: r.score, rank: r.rank })),
  });
  if (ranked.length > 0) {
    for (const { name, score, rank } of ranked) {
      const provider = PROVIDERS.find((p) => p.name === name);
      if (
        !provider ||
        !matchesAllowedNames(provider, allowedNames) ||
        matchesExcludedNames(provider, excludedNames)
      ) {
        let reason;
        if (!provider) {
          reason = "not found";
        } else if (matchesAllowedNames(provider, allowedNames)) {
          reason = "excluded";
        } else {
          reason = "not allowed";
        }
        logDebug(`[selectProvider] Skipping ranked provider`, {
          providerName: name,
          rank,
          score,
          reason,
        });
        continue;
      }
      const selected = await tryProvider(provider);
      if (selected) {
        logInfo(`[selectProvider] Selected ranked provider`, {
          providerName: selected.name,
          rank,
          score,
          tier: selected.tier,
        });
        return selected;
      }
    }
  }

  // Fallback: use fixed PROVIDERS order for providers with insufficient data or none ranked
  logDebug(`[selectProvider] Trying fixed provider order (fallback)`);
  for (const provider of PROVIDERS) {
    if (
      !matchesAllowedNames(provider, allowedNames) ||
      matchesExcludedNames(provider, excludedNames)
    ) {
      logDebug(`[selectProvider] Skipping fallback provider`, {
        providerName: provider.name,
        reason: matchesAllowedNames(provider, allowedNames) ? "excluded" : "not allowed",
      });
      continue;
    }
    const selected = await tryProvider(provider);
    if (selected) {
      logInfo(`[selectProvider] Selected fallback provider`, {
        providerName: selected.name,
        tier: selected.tier,
      });
      return selected;
    }
  }

  // Note: logProviderStats() can be called explicitly by callers for monitoring
  // Removed auto-logging to avoid ESM import side effects

  // -------------------------------------------------------------------------
  // P0 SAFETY NET — NEVER return null if local safety-net providers exist.
  // Ignores ALL caller restrictions (allowedNames, excludedNames) because a
  // degraded response from a local model is always better than a total outage.
  // -------------------------------------------------------------------------
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
