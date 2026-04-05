import { readGenericProviderToolSupport } from "./read-generic-provider-tool-support.mjs";

export function normalizeGenericProviderCatalog(payload) {
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.models)
      ? payload.models
      : Array.isArray(payload)
        ? payload
        : [];
  return rows
    .map((entry) => {
      const toolSupport = readGenericProviderToolSupport(entry);
      return {
        model: entry?.id || entry?.name || entry?.model || null,
        contextLength:
          Number(entry?.context_length || entry?.contextWindow || entry?.max_input_tokens || 0) ||
          null,
        supportedParameters: Array.isArray(entry?.supported_parameters)
          ? entry.supported_parameters
          : Array.isArray(entry?.supportedParameters)
            ? entry.supportedParameters
            : [],
        toolSupport: toolSupport.status,
        toolSupportReason: toolSupport.reason,
        raw: entry,
      };
    })
    .filter((entry) => entry.model);
}
