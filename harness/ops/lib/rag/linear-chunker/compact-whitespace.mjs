// Generated from ../../../../scripts/ops/lib/rag/linear-chunker.mjs:12

export function compactWhitespace(value) {
  return String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
