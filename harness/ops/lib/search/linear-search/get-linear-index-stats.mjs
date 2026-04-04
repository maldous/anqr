import { existsSync, statSync } from "node:fs";

import { LINEAR_INDEX_FILE } from "./linear-index-file.mjs";
import { linearIndexCache } from "./linear-index-cache.mjs";

export function getLinearIndexStats() {
  if (!existsSync(LINEAR_INDEX_FILE)) {
    return { ready: false, entries: 0 };
  }

  try {
    const stat = statSync(LINEAR_INDEX_FILE);
    return {
      ready: true,
      entries: linearIndexCache?.entries?.length || null,
      builtAt: new Date(stat.mtimeMs).toISOString(),
      path: LINEAR_INDEX_FILE,
    };
  } catch (err) {
    return { ready: false, error: err?.message || String(err) };
  }
}
