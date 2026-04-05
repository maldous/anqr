import { buildProviderRegistry } from "./build-provider-registry.mjs";

export function reloadProvidersFromCatalogCache(providers) {
  providers.splice(0, providers.length, ...buildProviderRegistry());
  return providers;
}
