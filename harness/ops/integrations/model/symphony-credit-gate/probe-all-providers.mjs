import { shouldRetryProvider, recordProviderHealthFailure, recordProviderHealthSuccess } from "../symphony-provider-health.mjs";

import { PROVIDERS } from "./providers.mjs";
import { probeOpenAIModels } from "./probe-open-aimodels.mjs";
import { resolveProviderApiKey } from "./resolve-provider-api-key.mjs";
import { shuffleArray } from "./shuffle-array.mjs";
import { logDebug, logWarn } from "./logger.mjs";

function classifyProbeFailure(errorText) {
  const text = String(errorText || '').toLowerCase();
  if (/payment required|credit|quota|402/.test(text)) return 'quota_exhausted';
  if (/too many requests|rate limit|429/.test(text)) return 'rate_limited';
  if (/unauthorized|forbidden|invalid api key|401|403/.test(text)) return 'auth_invalid';
  if (/timeout|timed out|abort/.test(text)) return 'timeout';
  return 'provider_error';
}

export async function probeAllProviders(options = {}) {
  const { excludeNames = [] } = options;
  const excludeSet = new Set(excludeNames);
  const startTime = Date.now();
  const orderedProviders = shuffleArray(PROVIDERS);

  const probePromises = orderedProviders.map(async (provider) => {
    if (excludeSet.has(provider.name)) {
      return { name: provider.name, model: provider.model, status: 'excluded', available: false, durationMs: 0 };
    }

    if (!shouldRetryProvider(provider.name)) {
      return { name: provider.name, model: provider.model, status: 'cooling_down', available: false, durationMs: 0 };
    }

    const apiKey = await resolveProviderApiKey(provider);
    if (provider.envVar && !apiKey) {
      return { name: provider.name, model: provider.model, status: 'no-key', available: false, durationMs: 0 };
    }

    if (provider.requiresSdk) {
      recordProviderHealthSuccess(provider.name);
      return { name: provider.name, model: provider.model, status: 'sdk-configured', available: true, durationMs: 0 };
    }

    if (provider.driver === 'codex-sdk') {
      const hasKey = !!process.env.OPENAI_API_KEY;
      if (hasKey) recordProviderHealthSuccess(provider.name);
      return { name: provider.name, model: provider.model, status: hasKey ? 'sdk-configured' : 'no-key', available: hasKey, durationMs: 0 };
    }

    const probeStart = Date.now();
    try {
      const available = provider.probe
        ? await provider.probe(provider, apiKey)
        : await probeOpenAIModels(provider.baseUrl, provider.model, apiKey);
      if (available) recordProviderHealthSuccess(provider.name);
      else recordProviderHealthFailure(provider.name, 'provider_error');
      return { name: provider.name, model: provider.model, status: available ? 'available' : 'unavailable', available, durationMs: Date.now() - probeStart };
    } catch (error) {
      const errorType = classifyProbeFailure(error?.message || error);
      recordProviderHealthFailure(provider.name, errorType);
      return { name: provider.name, model: provider.model, status: errorType, available: false, durationMs: Date.now() - probeStart };
    }
  });

  const settled = await Promise.allSettled(probePromises);
  const probeResults = settled.map((result) => result.status === 'fulfilled'
    ? result.value
    : { name: 'unknown', model: 'unknown', status: 'error', available: false, durationMs: 0 });

  const elapsed = Date.now() - startTime;
  const available = probeResults.filter((result) => result.available);
  const unavailable = probeResults.filter((result) => !result.available && result.status !== 'excluded');
  logDebug(`Probed ${probeResults.length} providers in ${elapsed}ms`);
  logDebug(`  ✅ Available (${available.length}): ${available.map((result) => result.name).join(', ')}`);
  if (unavailable.length > 0) {
    logWarn(`  ❌ Unavailable (${unavailable.length}): ${unavailable.map((result) => `${result.name}(${result.status})`).join(', ')}`);
  }

  return probeResults;
}
