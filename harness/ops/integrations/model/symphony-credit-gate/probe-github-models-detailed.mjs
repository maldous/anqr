import { PROBE_TIMEOUT_MS } from './probe-timeout-ms.mjs';
import { probeHttpModelListDetailed } from './probe-http-model-list-detailed.mjs';

export async function probeGitHubModelsDetailed(provider, apiKey) {
  return probeHttpModelListDetailed(provider, apiKey, {
    url: 'https://models.github.ai/catalog/models',
    timeoutMs: PROBE_TIMEOUT_MS,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiKey}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
}
