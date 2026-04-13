import { writeFileSync } from "node:fs";
import { loadProviderCatalogCache } from "../../symphony-openai-bridge/load-provider-catalog-cache.mjs";
import { PROVIDER_CATALOG_CACHE_FILE } from "../../symphony-openai-bridge/provider-catalog-cache-file.mjs";
import { saveStats } from "../save-stats.mjs";
import { loadStats } from "../load-stats.mjs";
import { PROVIDERS } from "../providers.mjs";
import { resolveProviderApiKey } from "../resolve-provider-api-key.mjs";
import { logInfo, logWarn } from "../logger.mjs";
import { CONTEXT_REFRESH_INTERVAL_MS, KNOWN_CONTEXT_SIZES } from "./constants.mjs";
import { fetchModelsFromApi } from "./fetch-models-from-api.mjs";
import { parseModelsFromApiResponse } from "./parse-models-from-api-response.mjs";
import { buildContextMapFromApi } from "./build-context-map-from-api.mjs";
import { buildContextMapFromCatalog } from "./build-context-map-from-catalog.mjs";

export async function enrichProviderContextSizes() {
  const stats = loadStats();
  const cache = loadProviderCatalogCache();
  let enriched = 0;
  let skipped = 0;

  for (const provider of PROVIDERS) {
    const name = provider.name;
    const updatedAt = stats.contextLengthUpdatedAt?.[name] || 0;
    const ageMs = Date.now() - updatedAt;
    const needsRefresh = ageMs >= CONTEXT_REFRESH_INTERVAL_MS || !stats.contextLength?.[name];

    // 1. Check provider.contextLength (already set from dynamic catalog)
    if (provider.contextLength && !needsRefresh) {
      stats.contextLength[name] = provider.contextLength;
      if (!stats.contextLengthSource?.[name]) {
        stats.contextLengthSource[name] = "catalog";
      }
      skipped++;
      continue;
    }

    // 2. Check catalog cache for this provider
    if (provider.catalogCacheKey && cache) {
      const catMap = buildContextMapFromCatalog(cache, provider.catalogCacheKey);
      const modelKey = (provider.model || "").toLowerCase();
      if (catMap[modelKey]) {
        stats.contextLength[name] = catMap[modelKey];
        stats.contextLengthUpdatedAt[name] = Date.now();
        stats.contextLengthSource[name] = "catalog";
        enriched++;
        continue;
      }
    }

    // 3. Check known static sizes
    if (KNOWN_CONTEXT_SIZES[name] && !needsRefresh) {
      stats.contextLength[name] = KNOWN_CONTEXT_SIZES[name];
      stats.contextLengthUpdatedAt[name] = Date.now();
      stats.contextLengthSource[name] = "static";
      enriched++;
      continue;
    }

    // 4. Fetch from API (only if refresh is needed)
    if (needsRefresh && provider.modelsUrl && !provider.requiresSdk) {
      const apiKey = await resolveProviderApiKey(provider);
      if (apiKey || !provider.envVar) {
        const body = await fetchModelsFromApi(provider, apiKey);
        if (body) {
          const models = parseModelsFromApiResponse(body);
          const apiMap = buildContextMapFromApi(models);
          const modelKey = (provider.model || "").toLowerCase();
          if (apiMap[modelKey]) {
            stats.contextLength[name] = apiMap[modelKey];
            stats.contextLengthUpdatedAt[name] = Date.now();
            stats.contextLengthSource[name] = "api";
            enriched++;
            continue;
          }
          // Also enrich catalog cache entries from API data
          if (provider.catalogCacheKey && cache?.[provider.catalogCacheKey]) {
            const rows = cache[provider.catalogCacheKey].models || [];
            for (const row of rows) {
              const rowModel = (row.model || row.id || "").toLowerCase();
              if (apiMap[rowModel] && !row.contextLength) {
                row.contextLength = apiMap[rowModel];
              }
            }
          }
        }
      }
    }

    // 5. Fallback: use known static or existing value
    if (!stats.contextLength?.[name] && KNOWN_CONTEXT_SIZES[name]) {
      stats.contextLength[name] = KNOWN_CONTEXT_SIZES[name];
      stats.contextLengthUpdatedAt[name] = Date.now();
      stats.contextLengthSource[name] = "static";
      enriched++;
    }
  }

  // Also enrich dynamic providers that already have contextLength from catalog
  for (const provider of PROVIDERS) {
    if (provider.contextLength && !stats.contextLength?.[provider.name]) {
      stats.contextLength[provider.name] = provider.contextLength;
      stats.contextLengthUpdatedAt[provider.name] = Date.now();
      stats.contextLengthSource[provider.name] = "catalog";
      enriched++;
    }
  }

  // Save enriched catalog cache back to disk if we updated any rows
  if (cache) {
    try {
      writeFileSync(PROVIDER_CATALOG_CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch {
      logWarn(`[enrichContextSizes] Failed to save enriched catalog cache`);
    }
  }

  saveStats(stats);
  logInfo(`[enrichContextSizes] Enriched ${enriched} providers, skipped ${skipped} (up-to-date)`);
  return { enriched, skipped, total: PROVIDERS.length };
}
