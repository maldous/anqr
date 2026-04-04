// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:196

import { classifyChunk } from "./classify-chunk.mjs";
import { lineNumberForOffset } from "./line-number-for-offset.mjs";
import { makeChunkId } from "./make-chunk-id.mjs";
import { trimSegmentBounds } from "./trim-segment-bounds.mjs";

export function makeChunkFromOffsets(
  text,
  lineStarts,
  filePath,
  ext,
  startOffset,
  endOffset,
  explicitType = null,
) {
  const { start, end } = trimSegmentBounds(text, startOffset, endOffset);
  if (end <= start) return null;

  const content = text.slice(start, end);
  if (!content.trim()) return null;

  const startLine = lineNumberForOffset(lineStarts, start);
  const endLine = lineNumberForOffset(lineStarts, Math.max(start, end - 1));
  const type = explicitType || classifyChunk(content, ext);

  return {
    id: makeChunkId(filePath, startLine, endLine, type, content),
    filePath,
    content,
    startLine,
    endLine,
    type,
  };
}
