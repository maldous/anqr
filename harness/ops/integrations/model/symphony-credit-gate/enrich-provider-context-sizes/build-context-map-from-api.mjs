import { extractContextLength } from "./extract-context-length.mjs";

export function buildContextMapFromApi(models) {
  const map = {};
  for (const model of models) {
    const id = model.id || model.model || model.name || model.slug;
    if (!id) continue;
    const ctx = extractContextLength(model);
    if (ctx && ctx > 0) {
      map[id.toLowerCase()] = ctx;
    }
  }
  return map;
}
