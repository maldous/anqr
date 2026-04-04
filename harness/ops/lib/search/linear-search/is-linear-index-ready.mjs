import { existsSync } from "node:fs";

import { LINEAR_INDEX_FILE } from "./linear-index-file.mjs";
import { linearIndexCache } from "./linear-index-cache.mjs";

export function isLinearIndexReady() {
  if (linearIndexCache && linearIndexCache.entries.length > 0) {
    return true;
  }
  return existsSync(LINEAR_INDEX_FILE);
}
