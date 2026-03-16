import { getNumericBitsCount } from "./get-numeric-bits-count";
import { getNumericGroupMax } from "./get-numeric-group-max";
import { getLinearBit } from "./get-linear-bit";

export function buildNumericGroupMaps(
  linearData: Uint8Array,
  numericDataStart: number,
  suffixLength: number,
): {
  groupIndexForBit: Int32Array;
  bitMaskForBit: Int32Array;
  groupMax: number[];
  baseGroupValues: number[];
} {
  const numericDataBits = getNumericBitsCount(suffixLength);
  const groupIndexForBit = new Int32Array(numericDataBits).fill(-1);
  const bitMaskForBit = new Int32Array(numericDataBits).fill(0);
  const groupMax: number[] = [];
  const baseGroupValues: number[] = [];

  let remainingDigits = suffixLength;
  let bitCursor = 0;
  let groupIndex = 0;
  while (remainingDigits > 0) {
    const groupDigits = Math.min(3, remainingDigits);
    const bitsPerGroup = groupDigits === 3 ? 10 : groupDigits === 2 ? 7 : 4;
    const maxVal = getNumericGroupMax(bitsPerGroup);

    let value = 0;
    for (let i = 0; i < bitsPerGroup; i++) {
      const bit = getLinearBit(linearData, numericDataStart + bitCursor + i);
      value = (value << 1) | bit;
      groupIndexForBit[bitCursor + i] = groupIndex;
      bitMaskForBit[bitCursor + i] = 1 << (bitsPerGroup - 1 - i);
    }

    groupMax.push(maxVal);
    baseGroupValues.push(value);

    bitCursor += bitsPerGroup;
    remainingDigits -= groupDigits;
    groupIndex++;
  }

  return { groupIndexForBit, bitMaskForBit, groupMax, baseGroupValues };
}
