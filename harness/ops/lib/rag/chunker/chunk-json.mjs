import { extname } from "node:path";

import { buildLineStarts } from "./build-line-starts.mjs";
import { findJsonTopLevelKeyRanges } from "./find-json-top-level-key-ranges.mjs";
import { lineIndexToOffset } from "./line-index-to-offset.mjs";
import { makeChunkFromOffsets } from "./make-chunk-from-offsets.mjs";
import { pushSegmentedRange } from "./push-segmented-range.mjs";

export function chunkJson(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lineStarts = buildLineStarts(text);

  if (text.length <= options.maxChunkSize) {
    const chunk = makeChunkFromOffsets(text, lineStarts, filePath, ext, 0, text.length, "block");
    return chunk ? [chunk] : [];
  }

  const keyRanges = findJsonTopLevelKeyRanges(text);
  if (keyRanges) {
    const chunks = [];
    for (let i = 0; i < keyRanges.keyLineIndices.length; i++) {
      const startOffset = lineIndexToOffset(lineStarts, keyRanges.keyLineIndices[i], text.length);
      const endOffset = lineIndexToOffset(
        lineStarts,
        keyRanges.keyLineIndices[i + 1] ?? keyRanges.lines.length,
        text.length,
      );
      pushSegmentedRange(
        chunks,
        text,
        lineStarts,
        filePath,
        ext,
        startOffset,
        endOffset,
        options.maxChunkSize,
        options.overlap,
        "block",
      );
    }
    if (chunks.length > 0) return chunks;
  }

  const fallbackChunks = [];
  pushSegmentedRange(
    fallbackChunks,
    text,
    lineStarts,
    filePath,
    ext,
    0,
    text.length,
    options.maxChunkSize,
    options.overlap,
    "block",
  );
  return fallbackChunks;
}
