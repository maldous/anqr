// Generated from ../../../../scripts/ops/lib/rag/vector-store.mjs:91

import { isAbsolute, resolve } from "node:path";

import { PROJECT_ROOT } from "./project-root.mjs";
import { normalizePathString } from "./normalize-path-string.mjs";

export function toResolvedPath(filePath) {
  const value = String(filePath || "");
  return normalizePathString(isAbsolute(value) ? resolve(value) : resolve(PROJECT_ROOT, value));
}
