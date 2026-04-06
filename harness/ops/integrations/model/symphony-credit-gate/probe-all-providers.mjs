import {
  shouldRetryProvider,
  recordProviderHealthFailure,
  recordProviderHealthSuccess,
} from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { probeProviderDetailed } from "./probe-provider-detailed.mjs";
import { shuffleArray } from "./shuffle-array.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function probeAllProviders(options = {}) {
  const { excludeNames = [], respectHealthState = true, recordHealthFailures = true } = options;
  const excludeSet = new Set(excludeNames);
  const startTime = Date.now();
  const orderedProviders = shuffleArray(PROVIDERS);
  const probePromises = orderedProviders.map(async (provider) => {
    if (excludeSet.has(provider.name))
      return {
        name: provider.name,
        model: provider.model,
        status: "excluded",
        available: false,
        durationMs: 0,
      };
    if (respectHealthState && !shouldRetryProvider(provider.name))
      return {
        name: provider.name,
        model: provider.model,
        status: "cooling_down",
        available: false,
        durationMs: 0,
      };
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
  });
  const settled = await Promise.allSettled(probePromises);
  const probeResults = settled.map((result) =>
    result.status === "fulfilled"
      ? result.value
      : { name: "unknown", model: "unknown", status: "error", available: false, durationMs: 0 },
  );
  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((result) => result.available);
  const unavailable = probeResults.filter(
    (result) => !result.available && result.status !== "excluded",
  );
  logDebug(`Probed ${probeResults.length} providers in ${elapsed}ms`);
  logDebug(
    `  ✅ Available (${available.length}): ${available.map((result) => result.name).join(", ")}`,
  );
  if (unavailable.length > 0)
    logWarn(
      `  ❌ Unavailable (${unavailable.length}): ${unavailable.map((result) => `${result.name}(${result.status})`).join(", ")}`,
    );
  return probeResults;
}
