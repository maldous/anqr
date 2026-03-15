import { getBitsPerGroup } from './get-bits-per-group';
import { getNumericBitsCount } from './get-numeric-bits-count';
import { getNumericGroupMax } from './get-numeric-group-max';

export function computeNumericGroupSafeBits(
  suffixLength: number,
  numericDataStart: number,
  buffer: { getAt: (index: number) => boolean }
): boolean[] {
  const numericDataBits = getNumericBitsCount(suffixLength);
  const safeBits: boolean[] = new Array(numericDataBits).fill(false);

  let bitCursor = numericDataStart;
  let remaining = suffixLength;
  let localIndex = 0;

  while (remaining > 0) {
    const groupDigits = Math.min(3, remaining);
    const bitsPerGroup = getBitsPerGroup(groupDigits);

    let value = 0;
    for (let j = 0; j < bitsPerGroup; j++) {
      value = (value << 1) | (buffer.getAt(bitCursor + j) ? 1 : 0);
    }

    const maxVal = getNumericGroupMax(bitsPerGroup);
    for (let j = 0; j < bitsPerGroup; j++) {
      const mask = 1 << (bitsPerGroup - 1 - j);
      const flipped = value ^ mask;
      if (flipped <= maxVal) {
        safeBits[localIndex + j] = true;
      }
    }

    bitCursor += bitsPerGroup;
    localIndex += bitsPerGroup;
    remaining -= groupDigits;
  }

  return safeBits;
}
