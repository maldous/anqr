// Generated from ../../../../scripts/ops/integrations/model/symphony-openai-bridge.mjs:3449

import { getConfiguredProviders, probeAllProviders } from "../symphony-credit-gate.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { loadProbeCache } from "./load-probe-cache.mjs";
import { probeAllToolCapability } from "./probe-all-tool-capability.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { saveProbeCache } from "./save-probe-cache.mjs";
import { logDebug, logInfo, logError } from "./logger.mjs";

export async function refreshProviderStatus() {
  // Check if another executor is already probing (via cache file lock)
  const cached = loadProbeCache();
  if (cached && !cached.probing) {
    // Fresh cache exists - use it instead of re-probing
    providerStatusCache.configured = cached.configured;
    providerStatusCache.probeResults = cached.probeResults;
    providerStatusCache.lastProbeAt = cached.lastProbeAt;
    logInfo(
      `📊 Using shared probe cache from ${cached.lastProbeAt} (${providerStatusCache.probeResults.filter((r) => r.available).length}/${providerStatusCache.configured.length} available)`,
    );
    return false; // Indicate cache was used
  }

  if (providerStatusCache.probing) return false;
  providerStatusCache.probing = true;

  try {
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    providerStatusCache.probeResults = await probeAllProviders({ excludeNames });
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
    await probeAllToolCapability();
  } catch (err) {
    logError(`Provider probe error: ${err.message}`);
  } finally {
    providerStatusCache.probing = false;
  }
}
