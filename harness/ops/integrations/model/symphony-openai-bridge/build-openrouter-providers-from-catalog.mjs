import { getCachedOpenrouterModels } from "./get-cached-openrouter-models.mjs";

export function buildOpenrouterProvidersFromCatalog() {
  return getCachedOpenrouterModels().map((entry) => ({
    name: entry.providerName,
    model: entry.model,
    baseUrl: "https://openrouter.ai/api/v1",
    envVar: "OPENROUTER_TOKEN",
    dynamic: true,
    contextLength: entry.contextLength,
    supportedParameters: entry.supportedParameters,
  }));
}
