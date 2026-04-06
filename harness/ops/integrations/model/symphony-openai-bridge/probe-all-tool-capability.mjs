import { getProviderDefinitions } from "../symphony-credit-gate.mjs";
import { shouldRetryProvider } from "../symphony-provider-health.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { GATEWAY_BATCH_DELAY_MS } from "./gateway-batch-delay-ms.mjs";
import { GATEWAY_BATCH_SIZE } from "./gateway-batch-size.mjs";
import { TOOL_PROBE_RETRY_DELAY_MS } from "./tool-probe-retry-delay-ms.mjs";
import { getProviderGateway } from "./get-provider-gateway.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeGatewayBatched } from "./probe-gateway-batched.mjs";
import { shuffleArray } from "../symphony-credit-gate/shuffle-array.mjs";
import { probeToolCapabilityForProvider } from "./probe-tool-capability-for-provider.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import {
  toolProbeRetryScheduled,
  setToolProbeRetryScheduled,
} from "./tool-probe-retry-scheduled.mjs";
import { logDebug, logError } from "./logger.mjs";

export async function probeAllToolCapability(options = {}) {
  const { respectHealthState = true } = options;
  const available = (providerStatusCache.probeResults || [])
    .filter((r) => r.available)
    .map((r) => r.name);
  const availableSet = new Set(available);

  // Use full provider definitions (with envVar, baseUrl, loadToken) for probing
  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  const allDefs = getProviderDefinitions({ excludeNames });

  // CHANGED: Always probe ALL available providers to collect fresh metrics,
  // even if they're already classified. This ensures we get comprehensive
  // metrics from every provider after startup while still allowing fast startup
  // via cached classification for provider selection.
  const toProbe = shuffleArray(
    allDefs.filter(
      (p) => availableSet.has(p.name) && (!respectHealthState || shouldRetryProvider(p.name)),
    ),
  );

  if (toProbe.length === 0) {
    logDebug(`🔧 Tool probe: no available providers to probe`);
    return;
  }

  // Group by API gateway to avoid rate-limit storms (e.g., 27 OpenRouter models share one key)
  const gateways = new Map();
  for (const p of toProbe) {
    const gw = getProviderGateway(p.name);
    if (!gateways.has(gw)) gateways.set(gw, []);
    gateways.get(gw).push(p);
  }

  const gatewayNames = [...gateways.entries()].map(([gw, ps]) => `${gw}(${ps.length})`);
  logDebug(
    `🔧 Tool capability probe: ${toProbe.length} providers across ${gateways.size} gateways: ${gatewayNames.join(", ")}`,
  );

  // Probe gateways in parallel; batch sequentially within large gateways
  const gatewayPromises = [];
  for (const [gw, providers] of gateways) {
    if (providers.length <= GATEWAY_BATCH_SIZE) {
      gatewayPromises.push(
        Promise.allSettled(
          shuffleArray(providers).map((p) => probeToolCapabilityForProvider(p)),
        ).then((settled) => settled.filter((r) => r.status === "fulfilled").map((r) => r.value)),
      );
    } else {
      gatewayPromises.push(
        probeGatewayBatched(gw, providers, GATEWAY_BATCH_SIZE, GATEWAY_BATCH_DELAY_MS),
      );
    }
  }

  const gatewayResults = await Promise.allSettled(gatewayPromises);
  const results = [];
  for (const gr of gatewayResults) {
    if (gr.status === "fulfilled" && Array.isArray(gr.value)) {
      results.push(...gr.value);
    }
  }

  for (const r of results) {
    let icon = "❓";
    if (toolCapableProviders.has(r.name)) {
      icon = "✅";
    } else if (nonToolCapableProviders.has(r.name)) {
      icon = "🚫";
    }
    logDebug(`  ${icon} ${r.name}: ${r.status}`);
  }

  logDebug(
    `🔧 Tool probe complete: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded`,
  );

  // Schedule a delayed retry for unclassified providers (rate-limited, probe-error, etc.)
  if (!toolProbeRetryScheduled) {
    const stillUnclassified = allDefs.filter(
      (p) =>
        availableSet.has(p.name) &&
        !toolCapableProviders.has(p.name) &&
        !nonToolCapableProviders.has(p.name),
    );
    if (stillUnclassified.length > 0) {
      setToolProbeRetryScheduled(true);
      const names = stillUnclassified.map((p) => p.name);
      logDebug(
        `🔧 Scheduling tool probe retry in ${TOOL_PROBE_RETRY_DELAY_MS / 1000}s for ${names.length} unclassified: ${names.join(", ")}`,
      );
      setTimeout(async () => {
        try {
          logDebug(`🔧 Retry tool probe for ${names.length} unclassified providers...`);
          await probeAllToolCapability({ respectHealthState });
          const remaining = names.filter(
            (n) => !toolCapableProviders.has(n) && !nonToolCapableProviders.has(n),
          );
          if (remaining.length > 0) {
            logDebug(`🔧 Still unclassified after retry: ${remaining.join(", ")}`);
          }
        } catch (err) {
          logError(`Tool probe retry failed: ${err.message}`);
        }
      }, TOOL_PROBE_RETRY_DELAY_MS);
    }
  }
}
