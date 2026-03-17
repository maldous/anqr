import type { RSBasisVector } from "./rs-basis";

export function applyVectorBitsToFlipParity(
  vector: RSBasisVector,
  bitToPixelTable: Int32Array,
  flipParity: Uint8Array,
  maxPixelCount: number,
): void {
  for (let byteIdx = 0; byteIdx < vector.blockBits.length; byteIdx++) {
    let remainingBits = vector.blockBits[byteIdx];
    if (remainingBits === 0) continue;

    const byteBase = byteIdx * 8;
    while (remainingBits !== 0) {
      const bitIdx = 31 - Math.clz32(remainingBits);
      remainingBits &= remainingBits - 1;

      const bitKey = byteBase + bitIdx;
      if (bitKey >= bitToPixelTable.length) continue;
      const pixelIdx = bitToPixelTable[bitKey];
      if (pixelIdx >= 0 && pixelIdx < maxPixelCount) {
        flipParity[pixelIdx] ^= 1;
      }
    }
  }
}
