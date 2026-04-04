import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

import { INDEX_DIR } from "./index-dir.mjs";
import { INDEX_FILE } from "./index-file.mjs";
import { MANIFEST_FILE } from "./manifest-file.mjs";
import { META_FILE } from "./meta-file.mjs";
import { indexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";

async function getFileSize(path) {
  try {
    return (await stat(path)).size;
  } catch {
    return 0;
  }
}

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
    const manifestRaw = await readFile(MANIFEST_FILE, "utf-8");
    const manifest = JSON.parse(manifestRaw);
    if (manifest?.version === 2 && Array.isArray(manifest.shards)) {
      indexSizeBytes += await getFileSize(MANIFEST_FILE);
      for (const shard of manifest.shards) {
        if (shard?.filename) {
          indexSizeBytes += await getFileSize(join(INDEX_DIR, shard.filename));
        }
      }
    } else {
      indexSizeBytes += await getFileSize(INDEX_FILE);
    }
  } catch {
    indexSizeBytes += await getFileSize(INDEX_FILE);
  }

  indexSizeBytes += await getFileSize(META_FILE);

  return {
    totalEntries: entries.length,
    totalFiles: files.size,
    indexSizeBytes,
    types,
  };
}
