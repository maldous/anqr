import { readGenericProviderToolSupport } from "./read-generic-provider-tool-support.mjs";

function resolveRows(payload) {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.models)) return payload.models;
  return Array.isArray(payload) ? payload : [];
}

function resolveSupportedParams(entry) {
  if (Array.isArray(entry?.supported_parameters)) return entry.supported_parameters;
  if (Array.isArray(entry?.supportedParameters)) return entry.supportedParameters;
  return [];
}

export function normalizeGenericProviderCatalog(payload) {
  const rows = resolveRows(payload);
  return rows
    .map((entry) => {
      const toolSupport = readGenericProviderToolSupport(entry);
      return {
        model: entry?.id || entry?.name || entry?.model || null,
        contextLength:
          Number(entry?.context_length || entry?.contextWindow || entry?.max_input_tokens || 0) ||
          null,
        supportedParameters: resolveSupportedParams(entry),
        toolSupport: toolSupport.status,
        toolSupportReason: toolSupport.reason,
        raw: entry,
      };
    })
    .filter((entry) => entry.model);
}
