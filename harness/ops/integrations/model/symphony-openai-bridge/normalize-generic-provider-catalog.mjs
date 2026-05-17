import { readGenericProviderToolSupport } from "./read-generic-provider-tool-support.mjs";
import { resolveRows } from "./normalize-generic-provider-catalog/resolve-rows.mjs";
import { resolveSupportedParams } from "./normalize-generic-provider-catalog/resolve-supported-params.mjs";

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
