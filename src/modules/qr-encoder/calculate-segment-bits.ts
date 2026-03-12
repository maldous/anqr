import type { DataSegment } from './encoder-api.types';
import { calculateModeDataBits } from './calculate-mode-data-bits';

/**
 * Calculate the approximate bit length for segments at a given version
 * Used for capacity checking
 */
export function calculateSegmentBits(segments: DataSegment[], version: number): number {
  let bits = 0;
  const lengthBitsTable = {
    numeric: version < 10 ? 10 : version < 27 ? 12 : 14,
    alphanumeric: version < 10 ? 9 : version < 27 ? 11 : 13,
    byte: version < 10 ? 8 : 16,
    kanji: version < 10 ? 8 : version < 27 ? 10 : 12,
  };

  for (const seg of segments) {
    bits += 4;
    bits += lengthBitsTable[seg.mode];
    bits += calculateModeDataBits(seg.mode, seg.data.length);
  }

  return bits;
}
