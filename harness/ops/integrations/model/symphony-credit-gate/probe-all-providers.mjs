import { PROVIDERS } from "./providers.mjs";
import { shuffleProviderProbeOrder } from "./shuffle-provider-probe-order.mjs";
import { logDebug, logWarn } from "./logger.mjs";
import { probeSingleProvider } from "./probe-all-providers/probe-single-provider.mjs";

const PROVIDER_PROBE_BATCH_SIZE = 8;

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
          : {
              name: "unknown",
              model: "unknown",
              status: "error",
              available: false,
              durationMs: 0,
            },
      );
    }
  }

  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((result) => result.available);
  const unavailable = probeResults.filter(
    (result) => !result.available && result.status !== "excluded",
  );
  logDebug(
    `Probed ${probeResults.length} providers in ${elapsed}ms (batch size ${PROVIDER_PROBE_BATCH_SIZE})`,
  );
  logDebug(
    `  ✅ Available (${available.length}): ${available.map((result) => result.name).join(", ")}`,
  );
  if (unavailable.length > 0) {
    const unavailableLabels = unavailable.map((result) => `${result.name}(${result.status})`).join(", ");
    logWarn(
      `  ❌ Unavailable (${unavailable.length}): ${unavailableLabels}`,
    );
  }
  return probeResults;
}
