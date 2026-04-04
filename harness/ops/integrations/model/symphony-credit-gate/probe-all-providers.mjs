// Generated from ../../../../scripts/ops/integrations/model/symphony-credit-gate.mjs:1282

import { PROVIDERS } from "./providers.mjs";
import { probeOpenAIModels } from "./probe-open-aimodels.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { logDebug, logWarn } from "./logger.mjs";

export async function probeAllProviders(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  const startTime = Date.now();

  const probePromises = PROVIDERS.map(async (provider) => {
    if (excludeSet.has(provider.name)) {
      return {
        name: provider.name,
        model: provider.model,
        status: "excluded",
        available: false,
        durationMs: 0,
      };
    }

    const apiKey = await resolveProviderApiKey(provider);
    if (provider.envVar && !apiKey) {
      return {
        name: provider.name,
        model: provider.model,
        status: "no-key",
        available: false,
        durationMs: 0,
      };
    }

    if (provider.requiresSdk) {
      return {
        name: provider.name,
        model: provider.model,
        status: "sdk-configured",
        available: true,
        durationMs: 0,
      };
    }

    if (provider.driver === "codex-sdk") {
      const hasKey = !!process.env.OPENAI_API_KEY;
      return {
        name: provider.name,
        model: provider.model,
        status: hasKey ? "sdk-configured" : "no-key",
        available: hasKey,
        durationMs: 0,
      };
    }

    const probeStart = Date.now();
    try {
      const available = provider.probe
        ? await provider.probe(provider, apiKey)
        : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);
      return {
        name: provider.name,
        model: provider.model,
        status: available ? "available" : "unavailable",
        available,
        durationMs: Date.now() - probeStart,
      };
    } catch {
      return {
        name: provider.name,
        model: provider.model,
        status: "probe-error",
        available: false,
        durationMs: Date.now() - probeStart,
      };
    }
  });

  const settled = await Promise.allSettled(probePromises);
  const probeResults = settled.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { name: "unknown", model: "unknown", status: "error", available: false, durationMs: 0 },
  );

  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((r) => r.available);
  const unavailable = probeResults.filter((r) => !r.available && r.status !== "excluded");
  logDebug(`Probed ${probeResults.length} providers in ${elapsed}ms`);
  logDebug(`  ✅ Available (${available.length}): ${available.map((r) => r.name).join(", ")}`);
  if (unavailable.length > 0) {
    const unavailableList = unavailable.map((r) => r.name + "(" + r.status + ")").join(", ");
    logWarn(`  ❌ Unavailable (${unavailable.length}): ${unavailableList}`);
  }

  return probeResults;
}
