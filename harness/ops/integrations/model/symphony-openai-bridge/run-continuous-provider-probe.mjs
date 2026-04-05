import {
  getProviderStats,
  getRankedProviders,
  getConfiguredProviders,
  probeAllProviders,
} from "../symphony-credit-gate.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { PROBE_COMPLETIONS_BEFORE_RANKING } from "./probe-completions-before-ranking.mjs";
import { PROBE_CYCLE_INTERVAL_MS } from "./probe-cycle-interval-ms.mjs";
import { isProbeRunning, setIsProbeRunning } from "./is-probe-running.mjs";
import { setLastProbeStartTime } from "./last-probe-start-time.mjs";
import { loadProbeCache } from "./load-probe-cache.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeAllToolCapability } from "./probe-all-tool-capability.mjs";
import { probeCompletionCount, setProbeCompletionCount } from "./probe-completion-count.mjs";
import { setProbeTurnCounter } from "./probe-turn-counter.mjs";
import { setLastProbeTimeCheck } from "./last-probe-time-check.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { saveProbeCache } from "./save-probe-cache.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { refreshLiveProviderCatalogs } from "./refresh-live-provider-catalogs.mjs";
import { reloadProvidersFromCatalogCache } from "../symphony-credit-gate/providers.mjs";
import { logDebug, logInfo, logError } from "./logger.mjs";

export async function runContinuousProviderProbe() {
  // Check shared cache first - if another executor just probed, skip
  const cached = loadProbeCache();
  if (cached) {
    const age = Date.now() - new Date(cached.lastProbeAt).getTime();
    if (age < PROBE_CYCLE_INTERVAL_MS) {
      logInfo(
        `🔍 Skipping probe - another executor probed ${Math.round(age / 1000)}s ago (using shared cache)`,
      );
      providerStatusCache.configured = cached.configured;
      providerStatusCache.probeResults = cached.probeResults;
      providerStatusCache.lastProbeAt = cached.lastProbeAt;
      return;
    }
  }

  if (isProbeRunning) {
    logDebug(`🔍 Probe already running, skipping duplicate`);
    return;
  }

  setIsProbeRunning(true);
  setLastProbeStartTime(Date.now());
  setLastProbeTimeCheck(Date.now()); // Reset time check
  setProbeTurnCounter(0); // Reset turn counter

  try {
    logInfo(`🔍 Starting continuous provider probe cycle ${probeCompletionCount + 1}...`);
    try {
      await refreshLiveProviderCatalogs();
      reloadProvidersFromCatalogCache();
    } catch (catalogError) {
      logDebug(`provider catalog refresh skipped: ${catalogError.message}`);
    }

    // Phase 1: Check reachability and API keys (parallel, all eligible providers)
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];

    logInfo(
      `🔍 ACCESSIBILITY PROBE: Checking reachability for all providers (excluding ${excludeNames.length} blocked)...`,
    );
    logInfo(`⏳ PROBE CYCLE STARTED: Beginning provider accessibility validation...`);

    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    providerStatusCache.probeResults = await probeAllProviders({ excludeNames });
    providerStatusCache.lastProbeAt = new Date().toISOString();

    // Save to shared cache immediately after probe
    saveProbeCache({
      configured: providerStatusCache.configured,
      probeResults: providerStatusCache.probeResults,
      lastProbeAt: providerStatusCache.lastProbeAt,
      probing: false,
    });

    const reachable = providerStatusCache.probeResults.filter((r) => r.available);
    const total = providerStatusCache.configured.length;
    logInfo(
      `✅ ACCESSIBILITY PROBE COMPLETE: ${reachable.length}/${total} providers reachable (API keys validated)`,
    );
    logInfo(`✅ PROBE PHASE 1 COMPLETE: Accessibility validation finished`);

    // Log detailed accessibility results
    for (const probe of providerStatusCache.probeResults) {
      if (probe.status === "excluded") continue;
      const icon = probe.available ? "✅" : "❌";
      const duration = probe.durationMs > 0 ? ` (${probe.durationMs}ms)` : "";
      logInfo(`  ${icon} ACCESSIBILITY: ${probe.name} - ${probe.status}${duration}`);
    }

    // Phase 2: Probe tool capability for reachable providers (parallel, no batching)
    logInfo(
      `🔧 TOOL CAPABILITY PROBE: Testing ${reachable.length} reachable providers (parallel, no batching)...`,
    );
    logInfo(`⏳ PROBE PHASE 2 STARTED: Beginning tool capability validation...`);
    await probeAllToolCapability();
    logInfo(
      `✅ TOOL CAPABILITY PROBE COMPLETE: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
    );
    logInfo(`✅ PROBE PHASE 2 COMPLETE: Tool capability validation finished`);

    // Increment completion counter
    setProbeCompletionCount(probeCompletionCount + 1);

    // Phase 3: After 3 completions, rank and log all providers in metrics cache
    if (probeCompletionCount >= PROBE_COMPLETIONS_BEFORE_RANKING) {
      logInfo(`🔍 Phase 3: Ranking providers after ${probeCompletionCount} probe completions...`);
      const ranked = getRankedProviders({ excludeNames: [...nonToolCapableProviders] });
      if (ranked.length > 0) {
        logInfo(`🔍 Provider Rankings (top 10):`);
        for (const { rank, name, score, tier } of ranked.slice(0, 10)) {
          const stats = getProviderStats()[name];
          const selections = stats?.selections || 0;
          const successRate = stats?.successRate || "N/A";
          logInfo(
            `  #${rank} ${name} [${tier}]: score=${score}, ${selections} sel, ${successRate} success`,
          );
        }
        logInfo(`🔍 Full ranking cached in provider stats`);

        // SKIP: Don't send Discord notifications during probe cycles
        // Sending probe results to Discord creates bridge requests that trigger more probes
        // causing a feedback loop that leads to OOM
        // Provider rankings are logged server-side via logInfo above
        logInfo(`📊 Provider rankings logged server-side (not sent to Discord)`);
      }
      // Reset counter but keep probing
      setProbeCompletionCount(0);
    }

    logInfo(
      `🔍 Probe cycle complete (${probeCompletionCount}/${PROBE_COMPLETIONS_BEFORE_RANKING} before next ranking)`,
    );
    logInfo(`✅ PROBE CYCLE COMPLETE: All phases finished successfully`);
  } catch (err) {
    logError(`🔍 Continuous probe error: ${err.message}`);
  } finally {
    setIsProbeRunning(false);
  }
}
