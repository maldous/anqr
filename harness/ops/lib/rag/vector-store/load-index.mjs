// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:146

import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { INDEX_DIR } from "./index-dir.mjs";
import { INDEX_FILE } from "./index-file.mjs";
import { MANIFEST_FILE } from "./manifest-file.mjs";
import { META_FILE } from "./meta-file.mjs";
import { indexCache, setIndexCache } from "./index-cache.mjs";
import { setIndexDirty } from "./index-dirty.mjs";
import { indexLoaded, setIndexLoaded } from "./index-loaded.mjs";
import { isValidEntry } from "./is-valid-entry.mjs";
import { metaCache, setMetaCache } from "./meta-cache.mjs";
import { sanitizeMetaRecord } from "./sanitize-meta-record.mjs";
import { toResolvedPath } from "./to-resolved-path.mjs";
import { logDebug, logInfo, logWarn } from "./logger.mjs";

export async function loadIndex() {
  if (indexLoaded) return;

  // Try loading sharded format first
  try {
    const manifestRaw = await readFile(MANIFEST_FILE, "utf-8");
    const manifest = JSON.parse(manifestRaw);

    if (manifest.version === 2 && Array.isArray(manifest.shards)) {
      setIndexCache([]);
      for (const shard of manifest.shards) {
        const shardPath = join(INDEX_DIR, shard.filename);
        try {
          const shardRaw = await readFile(shardPath, "utf-8");
          const shardData = JSON.parse(shardRaw);
          if (Array.isArray(shardData)) {
            indexCache.push(...shardData.filter(isValidEntry));
          }
        } catch (error_) {
          logWarn(`Failed to load shard ${shard.filename}: ${error_?.message || error_}`);
        }
      }
      logInfo(
        `Loaded sharded index: ${indexCache.length} entries from ${manifest.shards.length} shards`,
      );
    } else {
      throw new Error("Invalid manifest format");
    }
  } catch (error_) {
    // Fall back to legacy single-file format
    if (error_?.code !== "ENOENT") {
      logDebug(`Manifest not found or invalid, trying legacy format: ${error_?.message || error_}`);
    }

    try {
      const raw = await readFile(INDEX_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      setIndexCache(Array.isArray(parsed) ? parsed.filter(isValidEntry) : []);
      logInfo(`Loaded legacy index: ${indexCache.length} entries`);
    } catch (err) {
      if (err?.code !== "ENOENT") {
        logWarn(`Failed to load index: ${err?.message || err}`);
      }
      setIndexCache([]);
    }
  }

  try {
    const raw = await readFile(META_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    const entries = Object.entries(parsed || {}).map(([filePath, value]) => [
      toResolvedPath(filePath),
      sanitizeMetaRecord(value),
    ]);
    setMetaCache(new Map(entries));
    logDebug(`Loaded metadata for ${metaCache.size} files`);
  } catch (err) {
    if (err?.code !== "ENOENT") {
      logWarn(`Failed to load metadata: ${err?.message || err}`);
    }
    setMetaCache(new Map());
  }

  setIndexLoaded(true);
  setIndexDirty(false);
}
