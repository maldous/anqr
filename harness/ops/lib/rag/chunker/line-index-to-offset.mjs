// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:353

export function lineIndexToOffset(lineStarts, lineIndex, textLength) {
  if (lineIndex <= 0) return 0;
  if (lineIndex >= lineStarts.length) return textLength;
  return lineStarts[lineIndex];
}
