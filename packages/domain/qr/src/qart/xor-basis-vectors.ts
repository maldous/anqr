import type { RSBasisVector } from "./rs-basis.types";

/**
 * XOR two basis vectors together
 * Result is also a valid RS codeword (linearity property)
 *
 * @param a First vector
 * @param b Second vector (must be same block)
 * @returns New vector that is XOR of both
 */
export function xorBasisVectors(a: RSBasisVector, b: RSBasisVector): RSBasisVector {
  if (a.rsBlockIndex !== b.rsBlockIndex) {
    throw new Error("Cannot XOR vectors from different RS blocks");
  }

  const blockBits = new Uint8Array(a.blockBits.length);
  for (let i = 0; i < blockBits.length; i++) {
    blockBits[i] = a.blockBits[i] ^ b.blockBits[i];
  }

  return {
    dataBitIndex: -1, // Combined vector doesn't have single data bit
    rsBlockIndex: a.rsBlockIndex,
    posInBlock: -1,
    bitInByte: -1,
    blockBits,
    affectedPixels: [...new Set([...a.affectedPixels, ...b.affectedPixels])],
    pivotPixel: -1,
  };
}
