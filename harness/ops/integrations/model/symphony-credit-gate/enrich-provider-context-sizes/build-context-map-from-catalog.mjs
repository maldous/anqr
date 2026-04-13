export function buildContextMapFromCatalog(cache, catalogKey) {
  const rows = Array.isArray(cache?.[catalogKey]?.models) ? cache[catalogKey].models : [];
  const map = {};
  for (const row of rows) {
    const model = (row.model || row.id || "").toLowerCase();
    if (!model) continue;
    const ctx = Number(row.contextLength || 0);
    if (ctx > 0) map[model] = ctx;
  }
  return map;
}
