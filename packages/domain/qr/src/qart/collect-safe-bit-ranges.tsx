import type { BitRange } from "./semantic-layout";

export function collectSafeBitRanges(
  safeBits: boolean[],
  numericDataStart: number,
): { ranges: BitRange[]; safeBitCount: number } {
  const ranges: BitRange[] = [];
  let safeBitCount = 0;
  let inRange = false;
  let start = 0;

  for (let i = 0; i < safeBits.length; i++) {
    if (safeBits[i]) {
      safeBitCount++;
      if (!inRange) {
        inRange = true;
        start = i;
      }
    } else if (inRange) {
      ranges.push({ startBit: numericDataStart + start, endBit: numericDataStart + i });
      inRange = false;
    }
  }

  if (inRange) {
    ranges.push({
      startBit: numericDataStart + start,
      endBit: numericDataStart + safeBits.length,
    });
  }

  return { ranges, safeBitCount };
}
