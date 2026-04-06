import {
  shouldRetryProvider,
  recordProviderHealthFailure,
  recordProviderHealthSuccess,
} from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { probeProviderDetailed } from "./probe-provider-detailed.mjs";
import { shuffleProviderProbeOrder } from "./shuffle-provider-probe-order.mjs";
import { logDebug, logWarn } from "./logger.mjs";

const PROVIDER_PROBE_BATCH_SIZE = 8;

async function probeSingleProvider(provider, excludeSet, respectHealthState, recordHealthFailures) {
  if (excludeSet.has(provider.name)) {
    return {
      name: provider.name,
      model: provider.model,
      status: "excluded",
      available: false,
      durationMs: 0,
    };
  }

  if (respectHealthState && !shouldRetryProvider(provider.name)) {
    return {
      name: provider.name,
      model: provider.model,
      status: "cooling_down",
      available: false,
      durationMs: 0,
    };
  }

  try {
    const result = await probeProviderDetailed(provider);
    if (result.available) recordProviderHealthSuccess(provider.name);
    else if (recordHealthFailures) recordProviderHealthFailure(provider.name, result.status);
    return {
      name: provider.name,
      model: provider.model,
      status: result.available ? "available" : result.status,
      available: result.available,
      durationMs: result.durationMs || 0,
    };
  } catch {
    if (recordHealthFailures) recordProviderHealthFailure(provider.name, "probe_error");
    return {
      name: provider.name,
      model: provider.model,
      status: "probe_error",
      available: false,
      durationMs: 0,
    };
  }
}

export async function probeAllProviders(options = {}) {
  const { excludeNames = [], respectHealthState = true, recordHealthFailures = true } = options;
  const excludeSet = new Set(excludeNames);
  const startTime = Date.now();
  const orderedProviders = shuffleProviderProbeOrder(PROVIDERS);
  const probeResults = [];

  for (let index = 0; index < orderedProviders.length; index += PROVIDER_PROBE_BATCH_SIZE) {
    const batch = orderedProviders.slice(index, index + PROVIDER_PROBE_BATCH_SIZE);
    const settled = await Promise.allSettled(
      batch.map((provider) =>
        probeSingleProvider(provider, excludeSet, respectHealthState, recordHealthFailures),
      ),
    );
    for (const result of settled) {
      probeResults.push(
        result.status === "fulfilled"
          ? result.value
          : { name: "unknown", model: "unknown", status: "error", available: false, durationMs: 0 },
      );
    }
  }

  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((result) => result.available);
  const unavailable = probeResults.filter(
    (result) => !result.available && result.status !== "excluded",
  );
  logDebug(`Probed ${probeResults.length} providers in ${elapsed}ms (batch size ${PROVIDER_PROBE_BATCH_SIZE})`);
  logDebug(
    `  ✅ Available (${available.length}): ${available.map((result) => result.name).join(", ")}`,
  );
  if (unavailable.length > 0) {
    logWarn(
      `  ❌ Unavailable (${unavailable.length}): ${unavailable.map((result) => `${result.name}(${result.status})`).join(", ")}`,
    );
  }
  return probeResults;
}
