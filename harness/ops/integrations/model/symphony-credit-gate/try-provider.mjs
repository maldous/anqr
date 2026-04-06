import { acquireProviderLease } from "./acquire-provider-lease.mjs";
import { clearProviderFailure } from "./clear-provider-failure.mjs";
import { isProviderLeaseAllowed } from "./is-provider-lease-allowed.mjs";
import { isRecentlyFailed } from "./is-recently-failed.mjs";
import { isRecentlyProbed } from "./is-recently-probed.mjs";
import { probeProviderDetailed } from "./probe-provider-detailed.mjs";
import { recordProviderSelection } from "./record-provider-selection.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { saveProbeResult } from "./save-probe-result.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";
import { toSelectedProvider } from "./to-selected-provider.mjs";
import { logDebug, logInfo } from "./logger.mjs";

export async function tryProvider(provider) {
  logDebug(`[tryProvider] Attempting provider`, {
    providerName: provider.name,
    tier: provider.tier,
    hasEnvVar: !!provider.envVar,
    requiresSdk: !!provider.requiresSdk,
  });

  const cached = isRecentlyProbed(provider.name);
  if (cached?.permanentSkip || shouldSkipProviderFromCache(cached)) {
    logDebug(`${provider.name}: skipped (durable cache skip)`, { providerName: provider.name });
    return null;
  }

  const apiKey = await resolveProviderApiKey(provider);
  if (provider.envVar && !apiKey) {
    logDebug(`${provider.name}: skipped (no ${provider.envVar})`, { envVar: provider.envVar });
    return null;
  }

  if (!isProviderLeaseAllowed(provider, "family") && !isProviderLeaseAllowed(provider, "model")) {
    logDebug(`${provider.name}: skipped (lease contention)`, { providerName: provider.name });
    return null;
  }

  if (isRecentlyFailed(provider.name)) {
    logDebug(`${provider.name}: skipped (recently failed)`, { providerName: provider.name });
    return null;
  }

  const attachLease = () => {
    const lease = acquireProviderLease(provider);
    if (!lease && !provider.requiresSdk) return null;
    return { ...toSelectedProvider(provider, apiKey), leaseOwner: lease?.owner || null };
  };

  if (provider.requiresSdk) {
    logInfo(`${provider.name}: using SDK ✅`, {
      providerName: provider.name,
      model: provider.model,
    });
    clearProviderFailure(provider.name);
    recordProviderSelection(provider.name);
    return attachLease();
  }

  if (cached?.available) {
    const ageSecs = Math.round((Date.now() - cached.ts) / 1000);
    logDebug(`${provider.name}: available (shared cache, ${ageSecs}s old)`, {
      providerName: provider.name,
    });
    clearProviderFailure(provider.name);
    recordProviderSelection(provider.name);
    return attachLease();
  }
  if (cached && !cached.available) {
    const ageSecs = Math.round((Date.now() - cached.ts) / 1000);
    logDebug(`${provider.name}: unavailable (shared cache, ${ageSecs}s old)`, {
      providerName: provider.name,
    });
    return null;
  }

  logDebug(`${provider.name}: probing...`, { providerName: provider.name, model: provider.model });
  try {
    const probeResult = await probeProviderDetailed(provider);
    saveProbeResult(provider.name, probeResult.available, {
      status: probeResult.status,
      reason: probeResult.reason,
      message: probeResult.message,
    });
    if (!probeResult.available) {
      return null;
    }
  } catch (probeErr) {
    saveProbeResult(provider.name, false, {
      status: "probe_error",
      reason: probeErr.message,
      message: probeErr.message,
    });
    return null;
  }

  clearProviderFailure(provider.name);
  recordProviderSelection(provider.name);
  return attachLease();
}
