// Generated from ../../../../scripts/ops/lib/rag/build-index.mjs:141

import { sep } from "node:path";

export function normalizePath(filePath) {
  return String(filePath).split(sep).join("/");
}
