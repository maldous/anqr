import { buildProviderRegistry } from "./build-provider-registry.mjs";
import { reloadProvidersFromCatalogCache as reloadProvidersFromCatalogCacheImpl } from "./reload-providers-from-catalog-cache.mjs";

export const PROVIDERS = buildProviderRegistry();

export function reloadProvidersFromCatalogCache() {
  return reloadProvidersFromCatalogCacheImpl(PROVIDERS);
}
