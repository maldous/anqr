// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:273

import { makeChunkFromOffsets } from "./make-chunk-from-offsets.mjs";
import { splitRangeBySize } from "./split-range-by-size.mjs";

export function pushSegmentedRange(
  chunks,
  text,
  lineStarts,
  filePath,
  ext,
  startOffset,
  endOffset,
  maxChunkSize,
  overlap,
  type = null,
) {
  const length = endOffset - startOffset;
  if (length <= 0) return;

  if (length <= maxChunkSize) {
    const chunk = makeChunkFromOffsets(
      text,
      lineStarts,
      filePath,
      ext,
      startOffset,
      endOffset,
      type,
    );
    if (chunk) chunks.push(chunk);
    return;
  }

  for (const range of splitRangeBySize(text, startOffset, endOffset, maxChunkSize, overlap)) {
    const chunk = makeChunkFromOffsets(
      text,
      lineStarts,
      filePath,
      ext,
      range.startOffset,
      range.endOffset,
      type,
    );
    if (chunk) chunks.push(chunk);
  }
}
