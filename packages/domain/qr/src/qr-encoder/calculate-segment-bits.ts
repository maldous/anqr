import type { DataSegment } from "./encoder-api.types";
import { calculateModeDataBits } from "./calculate-mode-data-bits";

/**
 * Calculate the approximate bit length for segments at a given version
 * Used for capacity checking
 */
export function calculateSegmentBits(segments: DataSegment[], version: number): number {
  let bits = 0;
  let vRange: number;
  if (version < 10) {
    vRange = 0;
  } else if (version < 27) {
    vRange = 1;
  } else {
    vRange = 2;
  }
  const lengthBitsTable = {
    numeric: [10, 12, 14][vRange],
    alphanumeric: [9, 11, 13][vRange],
    byte: version < 10 ? 8 : 16,
    kanji: [8, 10, 12][vRange],
  };

  for (const seg of segments) {
    bits += 4;
    bits += lengthBitsTable[seg.mode];
    bits += calculateModeDataBits(seg.mode, seg.data.length);
  }

  return bits;
}
