import { DEFAULT_OPTIONS } from "./default-options.mjs";
import { findPreferredBreak } from "./find-preferred-break.mjs";
import { logError } from "./logger.mjs";

export function splitRangeBySize(text, startOffset, endOffset, maxChunkSize, overlap) {
  const safeMax = Math.max(200, Number(maxChunkSize) || DEFAULT_OPTIONS.maxChunkSize);
  const safeOverlap = Math.max(0, Math.min(Number(overlap) || 0, Math.floor(safeMax * 0.4)));
  const ranges = [];
  let start = startOffset;
  let iterations = 0;
  const hardLimit = Math.ceil((endOffset - startOffset) / Math.max(1, safeMax - safeOverlap)) + 16;

  while (start < endOffset) {
    iterations += 1;
    if (iterations > hardLimit) {
      logError(`splitRangeBySize exceeded safety ceiling for range ${startOffset}-${endOffset}`);
      break;
    }

    const candidateEnd = Math.min(start + safeMax, endOffset);
    const end = findPreferredBreak(text, start, candidateEnd, endOffset);
    ranges.push({ startOffset: start, endOffset: Math.max(start + 1, end) });

    if (end >= endOffset) break;

    const nextStart = Math.max(start + 1, end - safeOverlap);
    start = nextStart;
  }

  return ranges;
}
