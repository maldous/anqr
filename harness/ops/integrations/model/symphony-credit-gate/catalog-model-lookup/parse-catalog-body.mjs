import { parseJsonCatalog } from "./parse-json-catalog.mjs";

export function parseCatalogBody(text) {
  try {
    return parseJsonCatalog(JSON.parse(text));
  } catch {
    return {
      format: "text",
      tokens: new Set(
        String(text || "")
          .toLowerCase()
          .split(/[^a-z0-9._:/-]+/i)
          .filter(Boolean),
      ),
    };
  }
}
