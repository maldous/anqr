import { getProviderDefinitions, getRankedProviders } from "../symphony-credit-gate.mjs";
import { shouldRetryProvider } from "../symphony-provider-health.mjs";

import { BRIDGE_PROVIDER_BLOCKLIST } from "./bridge-provider-blocklist.mjs";
import { GATEWAY_BATCH_DELAY_MS } from "./gateway-batch-delay-ms.mjs";
import { GATEWAY_BATCH_SIZE } from "./gateway-batch-size.mjs";
import { TOOL_PROBE_RETRY_DELAY_MS } from "./tool-probe-retry-delay-ms.mjs";
import { KNOWN_TOOL_CAPABLE } from "./known-tool-capable.mjs";
import { getProviderGateway } from "./get-provider-gateway.mjs";
import { nonToolCapableProviders } from "./non-tool-capable-providers.mjs";
import { probeGatewayBatched } from "./probe-gateway-batched.mjs";
import { shuffleArray } from "../symphony-credit-gate/shuffle-array.mjs";
import { probeToolCapabilityForProvider } from "./probe-tool-capability-for-provider.mjs";
import { providerStatusCache } from "./provider-status-cache.mjs";
import { providerToolSupportHint } from "./provider-tool-support-hint.mjs";
import { toolCapableProviders } from "./tool-capable-providers.mjs";
import {
  toolProbeRetryScheduled,
  setToolProbeRetryScheduled,
} from "./tool-probe-retry-scheduled.mjs";
import { logDebug, logError } from "./logger.mjs";

const TOOL_PROBE_MAX_UNKNOWN_PROVIDERS_PER_CYCLE = 12;
const TOOL_PROBE_MAX_PER_PROVIDER_FAMILY = 2;

export async function probeAllToolCapability(options = {}) {
  function rankIndexByName() {
    const ranked = getRankedProviders({ includeAvailable: true });
    return new Map(ranked.map((entry, index) => [entry.name, index]));
  }

  function sortDefinitionsByRank(definitions) {
    const rankedIndex = rankIndexByName();
    return [...definitions].sort(
      (a, b) =>
        (rankedIndex.get(a.name) ?? Number.MAX_SAFE_INTEGER) -
          (rankedIndex.get(b.name) ?? Number.MAX_SAFE_INTEGER) || a.name.localeCompare(b.name),
    );
  }

  function providerFamilyKey(providerDef) {
    return providerDef.baseProviderName || providerDef.name;
  }

  function preclassifyProvider(providerDef) {
    const name = providerDef.name;
    const supportHint = providerToolSupportHint(providerDef);

    if (providerDef.tier === "local-safety-net") {
      toolCapableProviders.add(name);
      return true;
    }
    if (providerDef.requiresSdk || providerDef.driver === "codex-sdk") {
      toolCapableProviders.add(name);
      return true;
    }
    if (KNOWN_TOOL_CAPABLE.has(name)) {
      toolCapableProviders.add(name);
      return true;
    }
    if (supportHint.status === "supported") {
      toolCapableProviders.add(name);
      return true;
    }
    if (supportHint.status === "unsupported") {
      nonToolCapableProviders.add(name);
      return true;
    }
    return false;
  }

  const { respectHealthState = true, scheduleRetry = false } = options;
  const available = (providerStatusCache.probeResults || [])
    .filter((result) => result.available)
    .map((result) => result.name);
  const availableSet = new Set(available);

  const excludeNames = [...BRIDGE_PROVIDER_BLOCKLIST];
  const allDefs = sortDefinitionsByRank(getProviderDefinitions({ excludeNames }));
  const eligibleDefs = allDefs.filter(
    (provider) =>
      availableSet.has(provider.name) &&
      (!respectHealthState || shouldRetryProvider(provider.name)),
  );

  if (eligibleDefs.length === 0) {
    logDebug(`🔧 Tool probe: no available providers to classify`);
    return;
  }

  const toProbe = [];
  const familyCounts = new Map();
  for (const providerDef of eligibleDefs) {
    if (
      toolCapableProviders.has(providerDef.name) ||
      nonToolCapableProviders.has(providerDef.name)
    ) {
      continue;
    }
    if (preclassifyProvider(providerDef)) continue;

    const familyKey = providerFamilyKey(providerDef);
    const seenInFamily = familyCounts.get(familyKey) || 0;
    if (seenInFamily >= TOOL_PROBE_MAX_PER_PROVIDER_FAMILY) {
      continue;
    }
    familyCounts.set(familyKey, seenInFamily + 1);
    toProbe.push(providerDef);
  }

  if (toProbe.length === 0) {
    logDebug(
      `🔧 Tool capability probe: classification already complete (${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded)`,
    );
    return;
  }

  const limitedProbeList = toProbe.slice(0, TOOL_PROBE_MAX_UNKNOWN_PROVIDERS_PER_CYCLE);
  const deferredCount = Math.max(toProbe.length - limitedProbeList.length, 0);
  const gateways = new Map();
  for (const provider of limitedProbeList) {
    const gateway = getProviderGateway(provider.name);
    if (!gateways.has(gateway)) gateways.set(gateway, []);
    gateways.get(gateway).push(provider);
  }

  const gatewayNames = [...gateways.entries()].map(
    ([gateway, providers]) => `${gateway}(${providers.length})`,
  );
  logDebug(
    `🔧 Tool capability probe: ${limitedProbeList.length}/${toProbe.length} unknown providers across ${gateways.size} gateways: ${gatewayNames.join(", ")}`,
  );

  const gatewayPromises = [];
  for (const [gateway, providers] of gateways) {
    if (providers.length <= GATEWAY_BATCH_SIZE) {
      gatewayPromises.push(
        Promise.allSettled(
          shuffleArray(providers).map((provider) => probeToolCapabilityForProvider(provider)),
        ).then((settled) =>
          settled.filter((result) => result.status === "fulfilled").map((result) => result.value),
        ),
      );
    } else {
      gatewayPromises.push(
        probeGatewayBatched(gateway, providers, GATEWAY_BATCH_SIZE, GATEWAY_BATCH_DELAY_MS),
      );
    }
  }

  const gatewayResults = await Promise.allSettled(gatewayPromises);
  const results = [];
  for (const result of gatewayResults) {
    if (result.status === "fulfilled" && Array.isArray(result.value)) {
      results.push(...result.value);
    }
  }

  for (const result of results) {
    let icon = "❓";
    if (toolCapableProviders.has(result.name)) icon = "✅";
    else if (nonToolCapableProviders.has(result.name)) icon = "🚫";
    logDebug(`  ${icon} ${result.name}: ${result.status}`);
  }

  logDebug(
    `🔧 Tool probe complete: ${toolCapableProviders.size} capable, ${nonToolCapableProviders.size} excluded, ${deferredCount} deferred`,
  );

  const stillUnclassified = eligibleDefs
    .filter(
      (provider) =>
        !toolCapableProviders.has(provider.name) && !nonToolCapableProviders.has(provider.name),
    )
    .map((provider) => provider.name);

  if (scheduleRetry && stillUnclassified.length > 0 && !toolProbeRetryScheduled) {
    setToolProbeRetryScheduled(true);
    const names = stillUnclassified.slice(0, TOOL_PROBE_MAX_UNKNOWN_PROVIDERS_PER_CYCLE);
    logDebug(
      `🔧 Scheduling tool probe retry in ${TOOL_PROBE_RETRY_DELAY_MS / 1000}s for ${names.length} still-unclassified providers`,
    );
    setTimeout(async () => {
      try {
        setToolProbeRetryScheduled(false);
        await probeAllToolCapability({ respectHealthState });
      } catch (err) {
        logError(`Tool probe retry failed: ${err.message}`);
      }
    }, TOOL_PROBE_RETRY_DELAY_MS);
  }
}
