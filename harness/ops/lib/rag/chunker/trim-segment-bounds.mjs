// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:148

export function trimSegmentBounds(text, startOffset, endOffset) {
  let start = Math.max(0, startOffset);
  let end = Math.max(start, endOffset);

  while (start < end) {
    const nextNewline = text.indexOf("\n", start);
    const lineEnd = nextNewline === -1 || nextNewline >= end ? end : nextNewline + 1;
    const slice = text.slice(start, lineEnd);
    if (/^[ \t\r\n]*$/.test(slice)) {
      start = lineEnd;
      continue;
    }
    break;
  }

  while (end > start) {
    const prevNewline = text.lastIndexOf("\n", end - 1);
    const lineStart = prevNewline === -1 ? 0 : prevNewline + 1;
    const slice = text.slice(lineStart, end);
    if (/^[ \t\r\n]*$/.test(slice)) {
      end = prevNewline === -1 ? 0 : prevNewline;
      continue;
    }
    break;
  }

  return { start, end };
}
