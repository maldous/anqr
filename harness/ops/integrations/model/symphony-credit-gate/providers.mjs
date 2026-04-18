import { buildProviderRegistry } from "./build-provider-registry.mjs";
import { reloadProvidersFromCatalogCache as reloadProvidersFromCatalogCacheImpl } from "./reload-providers-from-catalog-cache.mjs";
import { PROVIDERS as PROVIDER_HOLDER } from "./provider-registry-holder.mjs";

const registry = buildProviderRegistry();
PROVIDER_HOLDER.push(...registry);

export const PROVIDERS = PROVIDER_HOLDER;

export function reloadProvidersFromCatalogCache() {
  return reloadProvidersFromCatalogCacheImpl(PROVIDERS);
}
