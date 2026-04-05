import { buildProviderNameFromModelId } from "./build-provider-name-from-model-id.mjs";
import { isOpenrouterTextToolModel } from "./is-openrouter-text-tool-model.mjs";

export function normalizeOpenrouterCatalog(payload) {
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  return rows.filter(isOpenrouterTextToolModel).map((entry) => ({
    providerName: buildProviderNameFromModelId(entry.id),
    model: entry.id,
    contextLength: Number(entry.context_length || entry.top_provider?.context_length || 0) || null,
    supportedParameters: Array.isArray(entry.supported_parameters)
      ? entry.supported_parameters
      : [],
    pricing: entry.pricing || null,
    topProvider: entry.top_provider || null,
    created: entry.created || null,
    name: entry.name || entry.id,
  }));
}
