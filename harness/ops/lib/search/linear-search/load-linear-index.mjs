// Generated from ../../../../scripts/ops/lib/search/linear-search.mjs:81

import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";

import { LINEAR_INDEX_FILE } from "./linear-index-file.mjs";
import { buildSearchEntry } from "./build-search-entry.mjs";
import { linearIndexCache, setLinearIndexCache } from "./linear-index-cache.mjs";
import { logInfo, logWarn, logError } from "./logger.mjs";

export async function loadLinearIndex() {
  if (!existsSync(LINEAR_INDEX_FILE)) {
    logWarn(`Linear index not found at ${LINEAR_INDEX_FILE}`);
    return [];
  }

  try {
    const stat = statSync(LINEAR_INDEX_FILE);
    if (linearIndexCache && linearIndexCache.mtimeMs === stat.mtimeMs) {
      return linearIndexCache.entries;
    }

    const raw = await readFile(LINEAR_INDEX_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed.map(buildSearchEntry) : [];
    setLinearIndexCache({ entries, mtimeMs: stat.mtimeMs });
    logInfo(`Loaded Linear index: ${entries.length} entries`);
    return entries;
  } catch (err) {
    logError(`Failed to load Linear index: ${err?.message || err}`);
    return [];
  }
}
