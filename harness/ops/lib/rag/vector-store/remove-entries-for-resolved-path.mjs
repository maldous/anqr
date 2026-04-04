import { indexCache, setIndexCache } from "./index-cache.mjs";
import { markDirty } from "./mark-dirty.mjs";
import { toResolvedPath } from "./to-resolved-path.mjs";

export function removeEntriesForResolvedPath(resolvedPath) {
  const before = (indexCache || []).length;
  setIndexCache(
    (indexCache || []).filter((entry) => toResolvedPath(entry.filePath) !== resolvedPath),
  );
  if (indexCache.length !== before) {
    markDirty();
  }
}
