import { fetchProviderCatalogJson } from "./fetch-provider-catalog-json.mjs";
import { normalizeGenericProviderCatalog } from "./normalize-generic-provider-catalog.mjs";
import { normalizeOpenrouterCatalog } from "./normalize-openrouter-catalog.mjs";
import { saveProviderCatalogCache } from "./save-provider-catalog-cache.mjs";

function buildDefinitions() {
  return [
    {
      cacheKey: "openrouter",
      url: "https://openrouter.ai/api/v1/models",
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_TOKEN}` },
      normalize: normalizeOpenrouterCatalog,
    },
    {
      cacheKey: "groq",
      url: "https://api.groq.com/openai/v1/models",
      headers: { Authorization: `Bearer ${process.env.GROQ_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "mistral",
      url: "https://api.mistral.ai/v1/models",
      headers: { Authorization: `Bearer ${process.env.MISTRAL_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "sambanova",
      url: "https://api.sambanova.ai/v1/models",
      headers: { Authorization: `Bearer ${process.env.SAMBANOVA_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "cerebras",
      url: "https://api.cerebras.ai/v1/models",
      headers: { Authorization: `Bearer ${process.env.CEREBRAS_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "github-models",
      url: "https://models.github.ai/catalog/models",
      headers: { Authorization: `Bearer ${process.env.GITHUB_MODELS_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "huggingface",
      url: "https://router.huggingface.co/v1/models",
      headers: { Authorization: `Bearer ${process.env.HUGGING_TOKEN}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "fireworks",
      url: "https://api.fireworks.ai/inference/v1/models",
      headers: { Authorization: `Bearer ${process.env.FIREWORKS_KEY}` },
      normalize: normalizeGenericProviderCatalog,
    },
    {
      cacheKey: "together",
      url: "https://api.together.xyz/v1/models",
      headers: { Authorization: `Bearer ${process.env.TOGETHER_KEY}` },
      normalize: normalizeGenericProviderCatalog,
    },
  ].filter((definition) => Object.values(definition.headers).every(Boolean));
}

export async function refreshLiveProviderCatalogs() {
  const cache = { updatedAt: new Date().toISOString() };
  for (const definition of buildDefinitions()) {
    try {
      const payload = await fetchProviderCatalogJson(definition);
      const models = definition.normalize(payload);
      cache[definition.cacheKey] = { models, count: models.length };
    } catch {}
  }
  await saveProviderCatalogCache(cache);
  return cache;
}
