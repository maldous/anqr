import fs from "node:fs/promises";
import path from "node:path";

import { PROVIDER_CATALOG_CACHE_FILE } from "./provider-catalog-cache-file.mjs";

export async function saveProviderCatalogCache(cache) {
  await fs.mkdir(path.dirname(PROVIDER_CATALOG_CACHE_FILE), { recursive: true });
  await fs.writeFile(PROVIDER_CATALOG_CACHE_FILE, JSON.stringify(cache, null, 2));
}
