import { extname } from "node:path";

import { MD_HEADING_PATTERN } from "./md-heading-pattern.mjs";
import { buildLineStarts } from "./build-line-starts.mjs";
import { lineIndexToOffset } from "./line-index-to-offset.mjs";
import { pushSegmentedRange } from "./push-segmented-range.mjs";

export function chunkMarkdown(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lines = text.split("\n");
  const lineStarts = buildLineStarts(text);
  const boundaries = [0];

  for (let i = 1; i < lines.length; i++) {
    if (MD_HEADING_PATTERN.test(lines[i])) {
      boundaries.push(i);
    }
  }

  const chunks = [];
  for (let i = 0; i < boundaries.length; i++) {
    const startOffset = lineIndexToOffset(lineStarts, boundaries[i], text.length);
    const endOffset = lineIndexToOffset(lineStarts, boundaries[i + 1] ?? lines.length, text.length);
    pushSegmentedRange(chunks, text, lineStarts, filePath, ext, {
      startOffset,
      endOffset,
      maxChunkSize: options.maxChunkSize,
      overlap: options.overlap,
      type: "section",
    });
  }

  return chunks;
}
