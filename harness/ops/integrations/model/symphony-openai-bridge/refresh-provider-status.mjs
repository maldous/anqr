import {
  getConfiguredProviders,
  probeAllProviders,
  enrichProviderContextSizes,
} from "../symphony-credit-gate.mjs";
import { reloadProvidersFromCatalogCache } from "../symphony-credit-gate/providers.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { loadProbeCache } from "./load-probe-cache.mjs";
import { probeAllToolCapability } from "./probe-all-tool-capability.mjs";
import { applyCacheToStatus } from "./apply-cache-to-status.mjs";
import { releaseProbeLock } from "./release-probe-lock.mjs";
import { tryAcquireProbeLock } from "./try-acquire-probe-lock.mjs";
import { waitForProbeCache } from "./wait-for-probe-cache.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { refreshLiveProviderCatalogs } from "./refresh-live-provider-catalogs.mjs";
import { saveProbeCache } from "./save-probe-cache.mjs";
import { logDebug, logInfo, logError } from "./logger.mjs";

export async function refreshProviderStatus(options = {}) {
  const { respectHealthState = true, recordHealthFailures = true, force = false } = options;
  const effectiveRespectHealth = force ? false : respectHealthState;

  // Fast path: use shared cache if fresh
  if (!force) {
    const cached = loadProbeCache();
    if (cached) {
      applyCacheToStatus(cached);
      logInfo(
        `📊 Using shared probe cache from ${cached.lastProbeAt} (${cached.probeResults.filter((r) => r.available).length}/${cached.configured.length} available)`,
      );
      return false;
    }
  }

  // In-memory guard: prevent same-process re-entrant probing
  if (providerStatusCache.probing) return false;

  // Cross-process lock: prevent multiple executors probing simultaneously
  let lockAcquired = tryAcquireProbeLock();
  if (!lockAcquired) {
    logInfo(`🔒 Another executor is probing — waiting for shared cache...`);
    const waitedCache = await waitForProbeCache(loadProbeCache);
    if (waitedCache) {
      applyCacheToStatus(waitedCache);
      logInfo(
        `🔒 Got probe results from another executor (${waitedCache.probeResults.filter((r) => r.available).length}/${waitedCache.configured.length} available)`,
      );
      return false;
    }
    // Wait timed out — try once more (stale lock gets cleaned by tryAcquire)
    lockAcquired = tryAcquireProbeLock();
    if (!lockAcquired) {
      logInfo(`🔒 Cannot acquire probe lock — skipping probe`);
      return false;
    }
  }

  providerStatusCache.probing = true;
  try {
    // Double-check: re-check cache after acquiring lock
    // (another executor may have saved results while we waited for the lock)
    if (!force) {
      const freshCache = loadProbeCache();
      if (freshCache) {
        applyCacheToStatus(freshCache);
        logInfo(
          `📊 Cache appeared after lock acquired (${freshCache.probeResults.filter((r) => r.available).length}/${freshCache.configured.length} available)`,
        );
        return false;
      }
    }

    try {
      await refreshLiveProviderCatalogs();
      reloadProvidersFromCatalogCache();
    } catch (catalogErr) {
      logInfo(`Provider catalog refresh skipped: ${catalogErr.message}`);
    }

    // Enrich context-length data from catalog cache + known static sizes
    try {
      await enrichProviderContextSizes();
    } catch (ctxErr) {
      logInfo(`Context-size enrichment skipped: ${ctxErr.message}`);
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
    if (lockAcquired) releaseProbeLock();
  }
}
