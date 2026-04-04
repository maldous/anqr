// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:117

import { hashString } from "./hash-string.mjs";
import { normalizePathFragment } from "./normalize-path-fragment.mjs";

export function makeChunkId(filePath, startLine, endLine, type, content) {
  const seed = `${filePath}:${startLine}:${endLine}:${type}:${content.length}`;
  return `${normalizePathFragment(filePath)}__${startLine}_${endLine}__${hashString(seed)}`;
}
