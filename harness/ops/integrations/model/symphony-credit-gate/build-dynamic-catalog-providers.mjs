import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";

function sanitizeModelSegment(model) {
  return String(model || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildDynamicCatalogProviders(staticProviders) {
  const cache = loadProviderCatalogCache();
  const dynamicProviders = [];
  for (const provider of staticProviders) {
    const key = provider?.catalogCacheKey;
    const rows = Array.isArray(cache?.[key]?.models) ? cache[key].models : [];
    if (!key || rows.length === 0) continue;
    for (const row of rows) {
      const model = row?.model || row?.id;
      if (!model) continue;
      dynamicProviders.push({
        ...provider,
        name: `${provider.name}-${sanitizeModelSegment(model)}`,
        model,
        dynamic: true,
      });
    }
  }
  return dynamicProviders;
}
