import { loadProviderCatalogCache } from "./load-provider-catalog-cache.mjs";

export function getCachedOpenrouterModels() {
  const cache = loadProviderCatalogCache();
  const rows = Array.isArray(cache?.openrouter?.models) ? cache.openrouter.models : [];
  return rows;
}
