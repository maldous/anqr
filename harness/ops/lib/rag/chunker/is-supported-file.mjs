// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:530

import { extname } from "node:path";

export function isSupportedFile(filePath, extensions) {
  return extensions.includes(extname(filePath).toLowerCase());
}
