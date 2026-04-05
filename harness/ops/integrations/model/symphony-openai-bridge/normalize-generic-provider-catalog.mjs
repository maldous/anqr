export function normalizeGenericProviderCatalog(payload) {
  const rows = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.models)
      ? payload.models
      : Array.isArray(payload)
        ? payload
        : [];
  return rows
    .map((entry) => ({
      model: entry?.id || entry?.name || entry?.model || null,
      contextLength:
        Number(entry?.context_length || entry?.contextWindow || entry?.max_input_tokens || 0) ||
        null,
      raw: entry,
    }))
    .filter((entry) => entry.model);
}
