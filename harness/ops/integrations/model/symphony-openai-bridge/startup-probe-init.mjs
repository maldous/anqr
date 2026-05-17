// Extracted from runtime.mjs: provider probe initialization (cache, exploration, continuous).

import { execSync } from "node:child_process";
import { getConfiguredProviders } from "../symphony-credit-gate.mjs";
import { updateMemory } from "../../../lib/update-memory.mjs";
import { loadProbeCache } from "./load-probe-cache.mjs";
import { saveProbeCache } from "./save-probe-cache.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { BRIDGE_PROVIDER_BLOCKLIST_REASONS } from "./bridge-provider-blocklist-reasons.mjs";
import { refreshProviderStatus } from "./refresh-provider-status.mjs";
import { runContinuousProviderProbe } from "./run-continuous-provider-probe.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { PROBE_CYCLE_INTERVAL_MS } from "./probe-cycle-interval-ms.mjs";
import { parseWorktreeNumber } from "./parse-worktree-number.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export function initializeProbes() {
  const wtNum = parseWorktreeNumber(process.env.ANQR_WORKTREE_ID);

  // Check for shared probe cache from other executors FIRST before doing expensive startup probe
  const cachedProbe = loadProbeCache();
  if (cachedProbe) {
    providerStatusCache.configured = cachedProbe.configured;
    providerStatusCache.probeResults = cachedProbe.probeResults;
    providerStatusCache.lastProbeAt = cachedProbe.lastProbeAt;
    const age = Math.round((Date.now() - new Date(cachedProbe.lastProbeAt).getTime()) / 1000);
    logInfo(
      `📊 Loaded shared probe cache (${age}s old): ${providerStatusCache.probeResults.filter((r) => r.available).length}/${providerStatusCache.configured.length} providers available`,
    );
  } else {
    // No cache - synchronously populate configured providers (no network calls)
    const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
    providerStatusCache.configured = getConfiguredProviders({ excludeNames });
    logInfo(
      `Configured providers (${providerStatusCache.configured.length}): ${providerStatusCache.configured.map((p) => p.name).join(", ")}`,
    );
  }
  if (BRIDGE_PROVIDER_BLOCKLIST.size > 0) {
    logInfo(`⛔ Blocked providers (${BRIDGE_PROVIDER_BLOCKLIST.size}):`);
    for (const name of BRIDGE_PROVIDER_BLOCKLIST) {
      const reason = BRIDGE_PROVIDER_BLOCKLIST_REASONS[name] || "blocklisted";
      logInfo(`  ⛔ ${name}: ${reason}`);
    }
  }

  // Startup exploration: run 1 complete probe cycle (reachability → tool probe)
  // This builds initial ranking before accepting any requests
  // Background probe will continue to refine rankings over time
  // OPTIMIZATION: Skip if shared cache from another executor is fresh
  (async () => {
    try {
      // If cache is fresh (< 5min), skip startup probe entirely
      if (cachedProbe) {
        const age = Math.round((Date.now() - new Date(cachedProbe.lastProbeAt).getTime()) / 1000);
        logInfo(`========================================`);
        logInfo(`Startup probe SKIPPED - using shared cache`);
        logInfo(`========================================`);
        logInfo(
          `Cache age: ${age}s (${providerStatusCache.probeResults.filter((r) => r.available).length}/${providerStatusCache.configured.length} available)`,
        );
        logInfo(`Cached by executor that probed at: ${cachedProbe.lastProbeAt}`);
        logInfo(`========================================`);
        logInfo(`Ready to accept requests (using cached probe)`);
        logInfo(`========================================`);
        return;
      }

      // Stagger startup probe by worktree number to prevent thundering herd
      // wt1=0s, wt2=3s, wt3=6s, ... wt8=21s — gives wt1 time to populate shared cache
      const staggerMs = (wtNum - 1) * 3_000;
      if (staggerMs > 0) {
        logInfo(`🔒 Startup stagger: waiting ${staggerMs / 1000}s (worktree ${wtNum})...`);
        await new Promise((resolve) => setTimeout(resolve, staggerMs));
        // Re-check cache after stagger — another executor may have probed while we waited
        const freshCache = loadProbeCache();
        if (freshCache) {
          providerStatusCache.configured = freshCache.configured;
          providerStatusCache.probeResults = freshCache.probeResults;
          providerStatusCache.lastProbeAt = freshCache.lastProbeAt;
          const age = Math.round((Date.now() - new Date(freshCache.lastProbeAt).getTime()) / 1000);
          logInfo(`========================================`);
          logInfo(`Startup probe SKIPPED - cache appeared during stagger`);
          logInfo(`========================================`);
          logInfo(
            `Cache age: ${age}s (${providerStatusCache.probeResults.filter((r) => r.available).length}/${providerStatusCache.configured.length} available)`,
          );
          logInfo(`========================================`);
          logInfo(`Ready to accept requests (using cached probe)`);
          logInfo(`========================================`);
          return;
        }
      }

      logInfo(`🔍 Starting startup exploration (1 cycle)...`);

      for (let cycle = 1; cycle <= 1; cycle++) {
        logInfo(`========================================`);
        logInfo(`🔍 Startup Probe Cycle ${cycle}/1`);
        logInfo(`========================================`);

        // Phase 1: Reachability probe (knock out unreachable providers)
        await refreshProviderStatus({
          respectHealthState: false,
          recordHealthFailures: false,
        });
        const available = providerStatusCache.probeResults.filter((r) => r.available);
        const total = providerStatusCache.configured.length;
        logInfo(`✅ Reachability: ${available.length}/${total} providers available`);

        // Brief summary of reachability results
        for (const p of providerStatusCache.probeResults.filter((r) => r.status !== "excluded")) {
          const icon = p.available ? "✅" : "❌";
          logInfo(`  ${icon} ${p.name}: ${p.status}`);
        }

        // Phase 2: Tool probe (on remaining providers)
        // probeAllToolCapability() already called by refreshProviderStatus()
        const toolCapable = toolCapableProviders.size;
        const toolExcluded = nonToolCapableProviders.size;
        const unclassified = available
          .map((r) => r.name)
          .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n));

        logInfo(
          `🔧 Tool probe: ${toolCapable} capable | ${toolExcluded} excluded | ${unclassified.length} unclassified`,
        );

        // No delay needed - single cycle only
      }

      // Final summary after all 3 cycles
      const available = providerStatusCache.probeResults.filter((r) => r.available);
      const total = providerStatusCache.configured.length;
      logInfo(`========================================`);
      logInfo(`Startup exploration complete (1 cycle)`);
      logInfo(`========================================`);
      logInfo(`Final status: ${available.length}/${total} providers available`);

      for (const p of providerStatusCache.probeResults.filter((r) => r.status !== "excluded")) {
        const icon = p.available ? "✅" : "❌";
        const dur = p.durationMs > 0 ? ` (${p.durationMs}ms)` : "";
        logInfo(`  ${icon} ${p.name}: ${p.status}${dur}`);
      }

      if (nonToolCapableProviders.size > 0) {
        logInfo(
          `🚫 Non-tool-capable (excluded from selection): ${[...nonToolCapableProviders].join(", ")}`,
        );
      }

      const unclassified = available
        .map((r) => r.name)
        .filter((n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n));
      if (unclassified.length > 0) {
        logInfo(
          `❓ Unclassified (${unclassified.length}, left in pool): ${unclassified.join(", ")}`,
        );
      }

      logInfo(
        `✅ Tool-capable: ${toolCapableProviders.size} | 🚫 Excluded: ${nonToolCapableProviders.size} | ❓ Unclassified: ${unclassified.length} | ⛔ Blocked: ${BRIDGE_PROVIDER_BLOCKLIST.size}`,
      );
      logInfo(`========================================`);
      logInfo(`Ready to accept requests`);
      logInfo(`========================================`);

      // Save final probe results to shared cache for other executors.
      // Guard: only save if a probe actually ran (lastProbeAt is set).
      // When refreshProviderStatus() couldn't acquire the lock it returns
      // without probing, leaving lastProbeAt === null.  Saving that would
      // poison the shared cache with 0/N results and block other executors.
      if (providerStatusCache.lastProbeAt) {
        saveProbeCache({
          configured: providerStatusCache.configured,
          probeResults: providerStatusCache.probeResults,
          lastProbeAt: providerStatusCache.lastProbeAt,
          probing: false,
        });
      } else {
        logWarn(
          `⚠️ Startup probe did not complete (lock contention) — skipping cache save to avoid poisoning shared state`,
        );
      }

      // SKIP: Don't send Discord notifications during startup probe
      // Sending probe results to Discord creates bridge requests that trigger more probes
      // causing a feedback loop that leads to OOM
      // Provider rankings are logged server-side in the summary above
      logInfo(`📊 Startup probe complete - rankings logged server-side (not sent to Discord)`);

      // Update MEMORY.md with successful startup
      try {
        const commitHash = execSync("git rev-parse --short HEAD", {
          encoding: "utf-8",
          cwd: process.cwd(),
        }).trim();
        await updateMemory(
          `Symphony Bridge restarted successfully (PID ${process.pid}, commit ${commitHash}, ${available.length}/${total} providers available, Discord monitoring ${process.env.DISCORD_BOT_TOKEN ? "active" : "disabled"})`,
        );
      } catch (err) {
        logWarn(`⚠️ Failed to update MEMORY.md: ${err.message}`);
      }
    } catch (err) {
      logError(`Startup probe failed: ${err.message}`);
      logInfo(`========================================`);
      logInfo(`Ready to accept requests (probe incomplete)`);
      logInfo(`========================================`);
    }
  })();

  // Continuous background probe — runs in parallel, updates status continuously
  // Trigger probe cycle after each completion or every 30 minutes
  const scheduleContinuousProbe = (delayMs = PROBE_CYCLE_INTERVAL_MS) => {
    setTimeout(() => {
      runContinuousProviderProbe()
        .catch((err) => {
          logError(`Continuous probe failed: ${err.message}`);
        })
        .finally(() => {
          // Schedule next probe cycle (full 30min interval)
          scheduleContinuousProbe();
        });
    }, delayMs);
  };

  // Stagger continuous probe by worktree number to prevent thundering herd
  // With cache: use full 30min interval (no rush). Without cache: stagger by worktree.
  const probeStartDelay = cachedProbe ? PROBE_CYCLE_INTERVAL_MS : wtNum * 5_000;
  scheduleContinuousProbe(probeStartDelay);
}
