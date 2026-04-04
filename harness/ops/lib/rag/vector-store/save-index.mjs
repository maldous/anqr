// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:217

import { join } from "node:path";

import { INDEX_DIR } from "./index-dir.mjs";
import { INDEX_FILE } from "./index-file.mjs";
import { MANIFEST_FILE } from "./manifest-file.mjs";
import { MAX_SHARD_SIZE_BYTES } from "./max-shard-size-bytes.mjs";
import { META_FILE } from "./meta-file.mjs";
import { atomicWriteJSON } from "./atomic-write-json.mjs";
import { ensureIndexDir } from "./ensure-index-dir.mjs";
import { indexCache } from "./index-cache.mjs";
import { indexDirty, setIndexDirty } from "./index-dirty.mjs";
import { loadIndex } from "./load-index.mjs";
import { metaCache } from "./meta-cache.mjs";
import { sanitizeMetaRecord } from "./sanitize-meta-record.mjs";
import { logInfo } from "./logger.mjs";

export async function saveIndex() {
  await ensureIndexDir();
  await loadIndex();

  if (!indexDirty) {
    return;
  }

  const indexToWrite = indexCache || [];
  const metaToWrite = Object.fromEntries(
    Array.from(metaCache || new Map())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([filePath, value]) => [filePath, sanitizeMetaRecord(value)]),
  );

  // Calculate estimated JSON size for the full index
  const sampleSize = Math.min(10, indexToWrite.length);
  const sampleJson = sampleSize > 0 ? JSON.stringify(indexToWrite.slice(0, sampleSize)) : "[]";
  const avgBytesPerEntry = sampleSize > 0 ? sampleJson.length / sampleSize : 1000;
  const estimatedTotalSize = avgBytesPerEntry * indexToWrite.length;

  if (estimatedTotalSize > MAX_SHARD_SIZE_BYTES && indexToWrite.length > 1) {
    // Use sharded storage
    const entriesPerShard = Math.max(1, Math.floor(MAX_SHARD_SIZE_BYTES / avgBytesPerEntry));
    const shards = [];

    for (let i = 0; i < indexToWrite.length; i += entriesPerShard) {
      const shardIndex = Math.floor(i / entriesPerShard);
      const shardFilename = `index-${shardIndex}.json`;
      const shardData = indexToWrite.slice(i, i + entriesPerShard);
      const shardPath = join(INDEX_DIR, shardFilename);

      await atomicWriteJSON(shardPath, shardData);

      shards.push({
        filename: shardFilename,
        entries: shardData.length,
        startIndex: i,
        endIndex: Math.min(i + entriesPerShard, indexToWrite.length),
      });
    }

    const manifest = {
      version: 2,
      totalEntries: indexToWrite.length,
      shardCount: shards.length,
      shards,
      createdAt: new Date().toISOString(),
    };

    await atomicWriteJSON(MANIFEST_FILE, manifest);
    logInfo(`Index saved (sharded): ${indexToWrite.length} entries across ${shards.length} shards`);
  } else {
    // Use legacy single-file storage for smaller indexes
    await atomicWriteJSON(INDEX_FILE, indexToWrite);
    logInfo(`Index saved: ${indexToWrite.length} entries`);
  }

  await atomicWriteJSON(META_FILE, metaToWrite);
  setIndexDirty(false);
}
