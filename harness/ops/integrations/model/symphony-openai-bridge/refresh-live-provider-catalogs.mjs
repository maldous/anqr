import { fetchProviderCatalogJson } from "./fetch-provider-catalog-json.mjs";
import { buildCatalogDefinitions } from "./build-catalog-definitions.mjs";
import { saveProviderCatalogCache } from "./save-provider-catalog-cache.mjs";

export async function refreshLiveProviderCatalogs() {
  const cache = { updatedAt: new Date().toISOString() };
  for (const definition of buildCatalogDefinitions()) {
    try {
      const payload = await fetchProviderCatalogJson(definition);
      const models = definition.normalize(payload);
      cache[definition.cacheKey] = { models, count: models.length };
    } catch {}
  }
  await saveProviderCatalogCache(cache);
  return cache;
}
