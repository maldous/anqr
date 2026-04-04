// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:156

import { MIRROR_PREFERENCES } from "./mirror-preferences.mjs";

export function shouldSkipMirroredPath(relPath, trackedSet) {
  for (const { from, to } of MIRROR_PREFERENCES) {
    if (!relPath.startsWith(from)) continue;
    const mirrored = `${to}${relPath.slice(from.length)}`;
    if (trackedSet.has(mirrored)) return true;
  }
  return false;
}
