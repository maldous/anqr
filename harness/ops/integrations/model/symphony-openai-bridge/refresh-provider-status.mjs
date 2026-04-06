import { getConfiguredProviders, probeAllProviders } from "../symphony-credit-gate.mjs";
import { reloadProvidersFromCatalogCache } from "../symphony-credit-gate/providers.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { loadProbeCache } from "./load-probe-cache.mjs";
import { probeAllToolCapability } from "./probe-all-tool-capability.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { refreshLiveProviderCatalogs } from "./refresh-live-provider-catalogs.mjs";
import { saveProbeCache } from "./save-probe-cache.mjs";
import { logDebug, logInfo, logError } from "./logger.mjs";

export async function refreshProviderStatus(options = {}) {
  const { respectHealthState = true, recordHealthFailures = true, force = false } = options;
  // When force=true (manual refresh), bypass BOTH cache AND health state
  // so all providers get a true re-probe regardless of cooling_down status
  const effectiveRespectHealth = force ? false : respectHealthState;

  // Skip cache check if force=true (manual refresh requested)
  let cached = null;
  if (!force) {
    cached = loadProbeCache();
  }
  if (cached) {
    providerStatusCache.configured = cached.configured;
    providerStatusCache.probeResults = cached.probeResults;
    providerStatusCache.lastProbeAt = cached.lastProbeAt;
    logInfo(
      `📊 Using shared probe cache from ${cached.lastProbeAt} (${providerStatusCache.probeResults.filter((r) => r.available).length}/${providerStatusCache.configured.length} available)`,
    );
    return false;
  }

  if (providerStatusCache.probing) return false;
  providerStatusCache.probing = true;

  try {
    try {
      await refreshLiveProviderCatalogs();
      reloadProvidersFromCatalogCache();
    } catch (catalogErr) {
      logInfo(`Provider catalog refresh skipped: ${catalogErr.message}`);
    }

    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    if (force) {
      logInfo(
        `🔄 Force probe: bypassing health state for all ${providerStatusCache.configured.length} providers`,
      );
    }
    providerStatusCache.probeResults = await probeAllProviders({
      excludeNames,
      respectHealthState: effectiveRespectHealth,
      recordHealthFailures,
    });
    providerStatusCache.lastProbeAt = new Date().toISOString();

    const available = providerStatusCache.probeResults.filter((r) => r.available).length;
    const total = providerStatusCache.configured.length;
    logDebug(`🔄 Provider status refreshed: ${available}/${total} available`);

    // Save to shared cache for other executors
    saveProbeCache({
      configured: providerStatusCache.configured,
      probeResults: providerStatusCache.probeResults,
      lastProbeAt: providerStatusCache.lastProbeAt,
      probing: false,
    });

    // Phase 2: probe tool-calling capability for all available providers
    await probeAllToolCapability({ respectHealthState: effectiveRespectHealth });
  } catch (err) {
    logError(`Provider probe error: ${err.message}`);
  } finally {
    providerStatusCache.probing = false;
  }
}
