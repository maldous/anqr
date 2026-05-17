import { extname } from "node:path";

import { TEXT_CONFIG_EXTENSIONS } from "./text-config-extensions.mjs";
import { buildLineStarts } from "./build-line-starts.mjs";
import { pushSegmentedRange } from "./push-segmented-range.mjs";

export function chunkGenericText(text, filePath, options) {
  const ext = extname(filePath).toLowerCase();
  const lineStarts = buildLineStarts(text);
  const chunks = [];
  pushSegmentedRange(chunks, text, lineStarts, filePath, ext, {
    startOffset: 0,
    endOffset: text.length,
    maxChunkSize: options.maxChunkSize,
    overlap: options.overlap,
    type: TEXT_CONFIG_EXTENSIONS.has(ext) ? "block" : null,
  });
  return chunks;
}
