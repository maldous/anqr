import fs from "node:fs";

import { PROVIDER_CATALOG_CACHE_FILE } from "./provider-catalog-cache-file.mjs";

export function loadProviderCatalogCache() {
  try {
    return JSON.parse(fs.readFileSync(PROVIDER_CATALOG_CACHE_FILE, "utf8"));
  } catch {
    return null;
  }
}
