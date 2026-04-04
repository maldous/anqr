import { join } from "node:path";

import { INDEX_DIR } from "./index-dir.mjs";
import { INDEX_FILE } from "./index-file.mjs";
import { MANIFEST_FILE } from "./manifest-file.mjs";
import { MAX_SHARD_SIZE_BYTES } from "./max-shard-size-bytes.mjs";
import { META_FILE } from "./meta-file.mjs";
import { atomicWriteJSON } from "./atomic-write-json.mjs";
import { cleanupStaleIndexFiles } from "./cleanup-stale-index-files.mjs";
import { ensureIndexDir } from "./ensure-index-dir.mjs";
import { indexCache } from "./index-cache.mjs";
import { indexDirty, setIndexDirty } from "./index-dirty.mjs";
import { loadIndex } from "./load-index.mjs";
import { metaCache } from "./meta-cache.mjs";
import { sanitizeMetaRecord } from "./sanitize-meta-record.mjs";
import { logInfo } from "./logger.mjs";

function sortEntries(entries) {
  return [...(entries || [])].sort((a, b) => {
    return (
      String(a.filePath || "").localeCompare(String(b.filePath || "")) ||
      Number(a.startLine || 0) - Number(b.startLine || 0) ||
      Number(a.endLine || 0) - Number(b.endLine || 0) ||
      String(a.type || "").localeCompare(String(b.type || "")) ||
      String(a.id || "").localeCompare(String(b.id || ""))
    );
  });
}

export async function saveIndex() {
  await ensureIndexDir();
  await loadIndex();

  if (!indexDirty) {
    return;
  }

  const indexToWrite = sortEntries(indexCache || []);
  const metaToWrite = Object.fromEntries(
    Array.from(metaCache || new Map())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([filePath, value]) => [filePath, sanitizeMetaRecord(value)]),
  );

  const sampleSize = Math.min(10, indexToWrite.length);
  const sampleJson = sampleSize > 0 ? JSON.stringify(indexToWrite.slice(0, sampleSize)) : "[]";
  const avgBytesPerEntry = sampleSize > 0 ? Math.max(1, sampleJson.length / sampleSize) : 1000;
  const estimatedTotalSize = avgBytesPerEntry * indexToWrite.length;

  if (estimatedTotalSize > MAX_SHARD_SIZE_BYTES && indexToWrite.length > 1) {
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
    await cleanupStaleIndexFiles(shards.map((shard) => shard.filename), {
      keepManifest: true,
      keepLegacyIndex: false,
    });
    logInfo(`Index saved (sharded): ${indexToWrite.length} entries across ${shards.length} shards`);
  } else {
    await atomicWriteJSON(INDEX_FILE, indexToWrite);
    await cleanupStaleIndexFiles([], {
      keepLegacyIndex: true,
      keepManifest: false,
    });
    logInfo(`Index saved: ${indexToWrite.length} entries`);
  }

  await atomicWriteJSON(META_FILE, metaToWrite);
  setIndexDirty(false);
}
