// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:96

import { DEFAULT_OPTIONS } from "./default-options.mjs";

export function normalizeExtensions(extensions) {
  return Array.isArray(extensions)
    ? extensions.map((ext) => String(ext || "").toLowerCase())
    : DEFAULT_OPTIONS.extensions;
}
