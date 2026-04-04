// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:362

import { saveIndex } from "./save-index.mjs";

export async function flushIndex() {
  await saveIndex();
}
