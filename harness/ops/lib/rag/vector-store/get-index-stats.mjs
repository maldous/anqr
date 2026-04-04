import { stat } from "node:fs/promises";

import { INDEX_FILE } from "./index-file.mjs";
import { indexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";

export async function getIndexStats() {
  await loadIndex();

  const entries = indexCache || [];
  const files = new Set(entries.map((entry) => entry.filePath));
  const types = {};

  for (const entry of entries) {
    types[entry.type] = (types[entry.type] || 0) + 1;
  }

  let indexSizeBytes = 0;
  try {
    indexSizeBytes = (await stat(INDEX_FILE)).size;
  } catch {
    // ignore missing index file
  }

  return {
    totalEntries: entries.length,
    totalFiles: files.size,
    indexSizeBytes,
    types,
  };
}
