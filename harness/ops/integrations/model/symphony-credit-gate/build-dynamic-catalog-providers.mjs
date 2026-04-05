import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { sanitizeModelSegment } from "./sanitize-model-segment.mjs";

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
        contextLength: row?.contextLength || provider.contextLength || null,
        supportedParameters: Array.isArray(row?.supportedParameters)
          ? row.supportedParameters
          : Array.isArray(provider?.supportedParameters)
            ? provider.supportedParameters
            : [],
        catalogToolSupport: row?.toolSupport || "unknown",
        catalogToolSupportReason: row?.toolSupportReason || "catalog has no explicit tool metadata",
      });
    }
  }
  return dynamicProviders;
}
