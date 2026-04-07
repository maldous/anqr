import { PROVIDERS } from "../symphony-credit-gate/providers.mjs";
import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { toInputBudget } from "./to-input-budget.mjs";

// Derived from the canonical PROVIDERS list — providers with a catalogCacheKey
// have their /v1/models response cached on startup by refreshLiveProviderCatalogs.
const CATALOG_PROVIDERS = PROVIDERS.filter((p) => p.catalogCacheKey && p.model).map((p) => ({
  name: p.name,
  cacheKey: p.catalogCacheKey,
  model: p.model,
}));

export function buildDynamicCatalogLimits() {
  const cache = loadProviderCatalogCache();
  if (!cache) return {};

  /** @type {Record<string, number>} */
  const limits = {};

  // Discover context windows from each provider's cached /v1/models response
  for (const { name, cacheKey, model } of CATALOG_PROVIDERS) {
    const catalog = cache[cacheKey];
    if (!Array.isArray(catalog?.models)) continue;

    const entry = catalog.models.find((m) => m.model === model);
    if (!entry?.contextLength) continue;

    const budget = toInputBudget(entry.contextLength);
    if (budget) limits[name] = budget;
  }

  // OpenRouter providers — keyed by providerName (built during catalog normalization)
  if (Array.isArray(cache?.openrouter?.models)) {
    for (const entry of cache.openrouter.models) {
      if (entry.providerName && entry.contextLength) {
        const budget = toInputBudget(entry.contextLength);
        if (budget) limits[entry.providerName] = budget;
      }
    }
  }

  return limits;
}
