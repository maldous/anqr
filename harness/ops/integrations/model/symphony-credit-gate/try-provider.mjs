import { getProviderHealthState, HEALTH_STATES } from "../symphony-provider-health.mjs";

import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { isRecentlyFailed } from "./is-recently-failed.mjs";
import { isRecentlyProbed } from "./is-recently-probed.mjs";
import { probeOpenAIModels } from "./probe-open-aimodels.mjs";
import { recordProviderSelection } from "./record-provider-selection.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";
import { toSelectedProvider } from "./to-selected-provider.mjs";
import { logDebug, logInfo } from "./logger.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";

export async function tryProvider(provider) {
  logDebug(`[tryProvider] Attempting provider`, {
    providerName: provider.name,
    tier: provider.tier,
    hasEnvVar: !!provider.envVar,
    requiresSdk: !!provider.requiresSdk,
  });

  const health = getProviderHealthState(provider.name);
  if (health.state === HEALTH_STATES.BLOCKED || health.state === HEALTH_STATES.DISABLED) {
    logDebug(`${provider.name}: skipped (health state: ${health.state})`, {
      providerName: provider.name,
      healthState: health.state,
    });
    return null;
  }

  const apiKey = await resolveProviderApiKey(provider);
  if (provider.envVar && !apiKey) {
    logDebug(`${provider.name}: skipped (no ${provider.envVar})`, {
      envVar: provider.envVar,
    });
    return null;
  }

  if (isRecentlyFailed(provider.name)) {
    logDebug(`${provider.name}: skipped (recently failed)`, {
      providerName: provider.name,
    });
    return null;
  }

  const cachedProbeEntry = getCachedProbeEntry(provider.name);
  if (cachedProbeEntry) {
    if (
      cachedProbeEntry.available === true &&
      (cachedProbeEntry.toolProbe?.toolStatus === "capable" ||
        provider.requiresSdk ||
        provider.name === "codex" ||
        provider.name === "codebuff")
    ) {
      logDebug(`${provider.name}: available (shared rich cache)`, {
        providerName: provider.name,
        status: cachedProbeEntry.status,
        toolStatus: cachedProbeEntry.toolProbe?.toolStatus || null,
      });
      clearProviderFailure(provider.name);
      recordProviderSelection(provider.name);
      return toSelectedProvider(provider, apiKey);
    }
    if (shouldSkipProviderFromCache(cachedProbeEntry)) {
      logDebug(`${provider.name}: skipped (shared rich cache failure)`, {
        providerName: provider.name,
        status: cachedProbeEntry.status,
      });
      return null;
    }
  }

  if (provider.requiresSdk) {
    logInfo(`${provider.name}: using SDK ✅`, {
      providerName: provider.name,
      model: provider.model,
    });
    clearProviderFailure(provider.name);
    recordProviderSelection(provider.name);
    return toSelectedProvider(provider, apiKey);
  }

  const cached = isRecentlyProbed(provider.name);
  if (cached) {
    const ageSecs = Math.round((Date.now() - cached.ts) / 1000);
    if (cached.available) {
      logDebug(`${provider.name}: available (shared cache, ${ageSecs}s old)`, {
        providerName: provider.name,
      });
      clearProviderFailure(provider.name);
      recordProviderSelection(provider.name);
      return toSelectedProvider(provider, apiKey);
    }
    logDebug(`${provider.name}: unavailable (shared cache, ${ageSecs}s old)`, {
      providerName: provider.name,
    });
    return null;
  }

  logDebug(`${provider.name}: probing...`, {
    providerName: provider.name,
    hasCustomProbe: !!provider.probe,
  });
  const available = provider.probe
    ? await provider.probe(provider, apiKey)
    : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);

  saveProbeResult(provider.name, !!available);
  if (!available) {
    logDebug(`${provider.name}: unavailable ❌`, {
      providerName: provider.name,
    });
    return null;
  }

  logInfo(`${provider.name}: available ✅`, {
    providerName: provider.name,
    model: provider.model,
    tier: provider.tier,
  });
  clearProviderFailure(provider.name);
  recordProviderSelection(provider.name);
  return toSelectedProvider(provider, apiKey);
}
