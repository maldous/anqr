import { buildDynamicCatalogProviders } from "./build-dynamic-catalog-providers.mjs";
import { buildOpenrouterProvidersFromCatalog } from "../symphony-openai-bridge/build-openrouter-providers-from-catalog.mjs";
import { buildStaticProviders } from "./build-static-providers.mjs";

export function buildProviderRegistry() {
  const staticProviders = buildStaticProviders();
  const dynamicCatalogProviders = buildDynamicCatalogProviders(staticProviders);
  const openrouterProviders = buildOpenrouterProvidersFromCatalog();
  if (openrouterProviders.length === 0) {
    staticProviders.push({
      name: "openrouter-free",
      model: "openrouter/free",
      baseUrl: "https://openrouter.ai/api/v1",
      envVar: "OPENROUTER_TOKEN",
      dynamic: false,
    });
  }
  return [...staticProviders, ...dynamicCatalogProviders, ...openrouterProviders];
}
