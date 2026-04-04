// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:359

import { extname } from "node:path";

import { buildLineStarts } from "./build-line-starts.mjs";
import { findCodeBoundaries } from "./find-code-boundaries.mjs";
import { lineIndexToOffset } from "./line-index-to-offset.mjs";
import { pushSegmentedRange } from "./push-segmented-range.mjs";

export function chunkCode(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lines = text.split("\n");
  const lineStarts = buildLineStarts(text);
  const boundaries = findCodeBoundaries(lines);
  const chunks = [];

  for (let i = 0; i < boundaries.length; i++) {
    const startLineIndex = boundaries[i];
    const endLineIndex = i + 1 < boundaries.length ? boundaries[i + 1] : lines.length;
    const startOffset = lineIndexToOffset(lineStarts, startLineIndex, text.length);
    const endOffset = lineIndexToOffset(lineStarts, endLineIndex, text.length);
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
    );
  }

  return chunks;
}
