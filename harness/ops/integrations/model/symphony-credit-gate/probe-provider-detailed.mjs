import { LOCAL_PROBE_TIMEOUT_MS } from './local-probe-timeout-ms.mjs';
import { PROBE_TIMEOUT_MS } from './probe-timeout-ms.mjs';
import { probeCodebuffDetailed } from './probe-codebuff-detailed.mjs';
import { probeCodexDetailed } from './probe-codex-detailed.mjs';
import { probeGeminiDetailed } from './probe-gemini-detailed.mjs';
import { probeGitHubModelsDetailed } from './probe-github-models-detailed.mjs';
import { probeHttpModelListDetailed } from './probe-http-model-list-detailed.mjs';
import { probeOllamaDetailed } from './probe-ollama-detailed.mjs';
import { providerProbeBaseResult } from './provider-probe-base-result.mjs';
import { providerProbeBridgeRoute } from './provider-probe-bridge-route.mjs';
import { providerProbeDirectStatus } from './provider-probe-direct-status.mjs';
import { providerProbeStage } from './provider-probe-stage.mjs';
import { resolveProviderApiKey } from './resolve-provider-api-key.mjs';

export async function probeProviderDetailed(provider, options = {}) {
  const apiKey = await resolveProviderApiKey(provider);
  const baseResult = providerProbeBaseResult(provider, apiKey);
  const progress = options.progress || null;
  if (provider.envVar && !apiKey) {
    const result = {
      ...baseResult,
      available: false,
      status: 'auth_missing',
      reason: `${provider.envVar} is not set`,
      durationMs: 0,
      message: `${provider.envVar} is not set`,
      stages: [providerProbeStage('env_missing', { envVar: provider.envVar })],
    };
    return { ...result, bridgeRoute: providerProbeBridgeRoute(result), ...providerProbeDirectStatus(result) };
  }
  let details;
  if (provider.name === 'codex' || provider.driver === 'codex-sdk') {
    details = await probeCodexDetailed(provider, apiKey);
  } else if (provider.name === 'codebuff' || provider.driver === 'codebuff-sdk') {
    details = await probeCodebuffDetailed(provider, { progress });
  } else if (provider.name === 'gemini' || provider.name === 'gemini-lite') {
    details = await probeGeminiDetailed(provider, apiKey);
  } else if (provider.name === 'github-models') {
    details = await probeGitHubModelsDetailed(provider, apiKey);
  } else if (provider.baseUrl?.includes('localhost') || provider.baseUrl?.includes('127.0.0.1')) {
    details = await probeOllamaDetailed(provider);
  } else {
    details = await probeHttpModelListDetailed(provider, apiKey, {
      timeoutMs: provider.baseUrl?.includes('openrouter') ? PROBE_TIMEOUT_MS * 2 : (provider.baseUrl?.includes('/api/tags') ? LOCAL_PROBE_TIMEOUT_MS : PROBE_TIMEOUT_MS),
    });
  }
  const result = { ...baseResult, ...details };
  return { ...result, bridgeRoute: providerProbeBridgeRoute(result), ...providerProbeDirectStatus(result) };
}
