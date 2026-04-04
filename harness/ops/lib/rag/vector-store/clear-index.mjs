// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:524

import { indexCache, setIndexCache } from "./index-cache.mjs";
import { loadIndex } from "./load-index.mjs";
import { markDirty } from "./mark-dirty.mjs";
import { metaCache, setMetaCache } from "./meta-cache.mjs";
import { saveIndex } from "./save-index.mjs";
import { logInfo } from "./logger.mjs";

export async function clearIndex() {
  await loadIndex();

  setIndexCache([]);
  setMetaCache(new Map());
  markDirty();
  await saveIndex();
  logInfo("Index cleared");
}
