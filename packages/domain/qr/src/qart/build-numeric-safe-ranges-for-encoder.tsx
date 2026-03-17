import { QRMode } from "../encode/types";
import { getLengthInBits } from "../encode/utils";
import type { BitRange } from "./semantic-layout";
import { computeNumericGroupSafeBits } from "./compute-numeric-group-safe-bits";
import { collectSafeBitRanges } from "./collect-safe-bit-ranges";

export function buildNumericSafeRangesForEncoder(
  bitsAfterOriginalData: number,
  suffixLength: number,
  version: number,
  buffer: { getAt: (index: number) => boolean },
): { ranges: BitRange[]; safeBitCount: number } {
  const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  const numericDataStart = bitsAfterOriginalData + 4 + numericCharCountBits;
  const safeBits = computeNumericGroupSafeBits(suffixLength, numericDataStart, buffer);
  return collectSafeBitRanges(safeBits, numericDataStart);
}
