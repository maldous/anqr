// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:213

import { indexDirty, setIndexDirty } from "./index-dirty.mjs";

export function markDirty() {
  setIndexDirty(true);
}
