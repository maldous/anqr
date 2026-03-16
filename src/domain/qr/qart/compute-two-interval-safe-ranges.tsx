import type { BitRange } from "./semantic-layout";
import { buildNumericSafeRangesForEncoder } from "./build-numeric-safe-ranges-for-encoder";

export function computeTwoIntervalSafeRanges(
  bitsAfterOriginalData: number,
  bitsAfterData: number,
  paddingStartByte: number,
  totalDataCount: number,
  suffixMode: "byte" | "numeric",
  suffixLength: number,
  version: number,
  buffer: { getAt: (index: number) => boolean },
): {
  protectedBitEnd: number;
  suffixSafeStartBit: number;
  suffixSafeEndBit: number;
  paddingSafeStartBit: number;
  paddingSafeEndBit: number;
  gapStartBit: number;
  gapEndBit: number;
  gapBitCount: number;
  suffixSafeBits: number;
  paddingSafeBits: number;
  allowedBitRanges: BitRange[];
} {
  const protectedBitEnd = Math.ceil(bitsAfterOriginalData / 8) * 8;
  const suffixSafeStartBit = protectedBitEnd;
  const suffixSafeEndBit = Math.floor(bitsAfterData / 8) * 8;
  const paddingSafeStartBit = paddingStartByte * 8;
  const paddingSafeEndBit = totalDataCount * 8;
  const gapStartBit = suffixSafeEndBit;
  const gapEndBit = paddingSafeStartBit;
  const gapBitCount = gapEndBit - gapStartBit;

  let numericSafeBitCount = 0;
  let numericSafeRanges: BitRange[] = [];
  if (suffixMode === "numeric" && suffixLength > 0) {
    const numericSafe = buildNumericSafeRangesForEncoder(
      bitsAfterOriginalData,
      suffixLength,
      version,
      buffer,
    );
    numericSafeRanges = numericSafe.ranges
      .map((range) => ({
        startBit: Math.max(range.startBit, suffixSafeStartBit),
        endBit: Math.min(range.endBit, suffixSafeEndBit),
      }))
      .filter((range) => range.endBit > range.startBit);
    numericSafeBitCount = numericSafeRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0);
  }

  const suffixSafeBits =
    suffixMode === "numeric"
      ? numericSafeBitCount
      : Math.max(0, suffixSafeEndBit - suffixSafeStartBit);
  const paddingSafeBits = Math.max(0, paddingSafeEndBit - paddingSafeStartBit);

  const allowedBitRanges: BitRange[] = [];
  if (suffixMode === "numeric") {
    allowedBitRanges.push(...numericSafeRanges);
  } else if (suffixSafeEndBit > suffixSafeStartBit) {
    allowedBitRanges.push({ startBit: suffixSafeStartBit, endBit: suffixSafeEndBit });
  }
  if (paddingSafeEndBit > paddingSafeStartBit) {
    allowedBitRanges.push({ startBit: paddingSafeStartBit, endBit: paddingSafeEndBit });
  }

  return {
    protectedBitEnd,
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    gapStartBit,
    gapEndBit,
    gapBitCount,
    suffixSafeBits,
    paddingSafeBits,
    allowedBitRanges,
  };
}
