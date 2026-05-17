import { loadProviderCatalogCache } from "../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { sanitizeModelSegment } from "./sanitize-model-segment.mjs";
import { shouldSkipProviderFromCache } from "./should-skip-provider-from-cache.mjs";
import { getCachedProbeEntry } from "./get-cached-probe-entry.mjs";
import { hasConfiguredCredentials } from "./build-dynamic-catalog-providers/has-configured-credentials.mjs";
import { pickFirstArray } from "./build-dynamic-catalog-providers/pick-first-array.mjs";
import { isEligibleCatalogRow } from "./build-dynamic-catalog-providers/is-eligible-catalog-row.mjs";
import { sortCatalogRows } from "./build-dynamic-catalog-providers/sort-catalog-rows.mjs";

export function buildDynamicCatalogProviders(staticProviders) {
  const cache = loadProviderCatalogCache();
  const dynamicProviders = [];
  for (const provider of staticProviders) {
    const key = provider?.catalogCacheKey;
    const rows = Array.isArray(cache?.[key]?.models) ? cache[key].models : [];
    if (!key || rows.length === 0) continue;
    if (!hasConfiguredCredentials(provider)) continue;

    const baseProbeEntry = getCachedProbeEntry(provider.name);
    if (shouldSkipProviderFromCache(baseProbeEntry, provider.name)) continue;

    const eligibleRows = rows.filter(isEligibleCatalogRow).sort(sortCatalogRows);

    for (const row of eligibleRows) {
      const model = row?.model || row?.id;
      if (!model) continue;
      dynamicProviders.push({
        ...provider,
        name: `${provider.name}-${sanitizeModelSegment(model)}`,
        baseProviderName: provider.name,
        model,
        dynamic: true,
        contextLength: row?.contextLength || provider.contextLength || null,
        supportedParameters: pickFirstArray(row, "supportedParameters", provider),
        catalogToolSupport: row?.toolSupport || "unknown",
        catalogToolSupportReason: row?.toolSupportReason || "catalog has no explicit tool metadata",
        capabilities: row?.raw?.capabilities || provider?.capabilities || {},
      });
    }
  }
  return dynamicProviders;
}
