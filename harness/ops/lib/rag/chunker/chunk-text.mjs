// Generated from ../../../../scripts/ops/lib/rag/chunker.mjs:621

import { DEFAULT_OPTIONS } from "./default-options.mjs";
import { buildLineStarts } from "./build-line-starts.mjs";
import { pushSegmentedRange } from "./push-segmented-range.mjs";

export function chunkText(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  if (!text || !text.trim()) return [];

  const lineStarts = buildLineStarts(text);
  const chunks = [];
  pushSegmentedRange(
    chunks,
    text,
    lineStarts,
    "raw-text",
    "",
    0,
    text.length,
    opts.maxChunkSize,
    opts.overlap,
    "block",
  );
  return chunks;
}
