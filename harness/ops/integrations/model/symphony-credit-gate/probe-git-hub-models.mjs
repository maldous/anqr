import { catalogModelLookup } from './catalog-model-lookup.mjs';
import { probeWithTimeout } from './probe-with-timeout.mjs';

export async function probeGitHubModels(apiKey, model) {
  const res = await probeWithTimeout('https://models.github.ai/catalog/models', {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${apiKey}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });
  if (!res || !res.ok) return false;
  const text = await res.text();
  return catalogModelLookup(text, { model, name: 'github-models' }).available;
}
