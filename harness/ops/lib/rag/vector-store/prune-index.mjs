import { indexCache, setIndexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";
import { markDirty } from "./mark-dirty.mjs";
import { metaCache, setMetaCache } from "./meta-cache.mjs";
import { saveIndex } from "./save-index.mjs";
import { toResolvedPath } from "./to-resolved-path.mjs";

export async function pruneIndex(eligibleFilePaths) {
  await loadIndex();

  const eligibleResolved = new Set(
    Array.from(eligibleFilePaths || []).map((filePath) => toResolvedPath(filePath)),
  );
  const previousEntryCount = (indexCache || []).length;
  const previousMetaCount = (metaCache || new Map()).size;

  setIndexCache(
    (indexCache || []).filter((entry) => eligibleResolved.has(toResolvedPath(entry.filePath))),
  );
  setMetaCache(
    new Map(
      Array.from(metaCache || new Map()).filter(([filePath]) =>
        eligibleResolved.has(toResolvedPath(filePath)),
      ),
    ),
  );

  const prunedEntries = previousEntryCount - indexCache.length;
  const prunedMeta = previousMetaCount - metaCache.size;

  if (prunedEntries > 0 || prunedMeta > 0) {
    markDirty();
    await saveIndex();
  }

  return { prunedEntries, prunedMeta };
}
