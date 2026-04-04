// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:102

export function normalizePathFragment(filePath) {
  return String(filePath)
    .replaceAll(/[^a-zA-Z0-9._/-]/g, "_")
    .slice(-120);
}
