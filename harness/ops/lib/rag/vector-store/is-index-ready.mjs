import { existsSync, statSync } from "node:fs";

import { INDEX_FILE } from "./index-file.mjs";
import { indexCache } from "./index-cache.mjs";
import { indexLoaded } from "./index-loaded.mjs";

export function isIndexReady() {
  if (indexLoaded) {
    return (indexCache || []).length > 0;
  }

  try {
    if (!existsSync(INDEX_FILE)) return false;
    return statSync(INDEX_FILE).size > 2;
  } catch {
    return false;
  }
}
