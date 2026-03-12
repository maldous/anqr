import type { BitPixelMapping } from './bit-mapping';
import type { RSBasisVector } from './rs-basis';
import { BITSET_WORD_SHIFT } from './bitset-word-shift';
import { BITSET_WORD_SIZE } from './bitset-word-size';
import { BITSET_WORD_MASK } from './bitset-word-mask';

/**
 * Build a pixel affection matrix from basis vectors for a SINGLE RS block
 * matrix[vectorIdx][pixelIdx] = true if that vector affects that pixel
 *
 * @param vectors Basis vectors (all from the same RS block)
 * @param blockMappings Bit-to-pixel mappings for this block
 * @param moduleCount Module count
 * @param maskPattern Mask pattern
 * @returns Boolean matrix
 */
export function buildBlockAffectionMatrix(
  vectors: RSBasisVector[],
  blockMappings: BitPixelMapping[],
  moduleCount: number,
  _maskPattern: number
): Uint32Array[] {
  const totalPixels = moduleCount * moduleCount;
  const bitsetWordCount = (totalPixels + BITSET_WORD_SIZE - 1) >>> BITSET_WORD_SHIFT;
  const matrix: Uint32Array[] = [];

  const mappingCount = blockMappings.length;
  const byteIndices = new Uint16Array(mappingCount);
  const bitMasks = new Uint8Array(mappingCount);
  const pixelIndices = new Uint32Array(mappingCount);

  for (let i = 0; i < mappingCount; i++) {
    const mapping = blockMappings[i];
    byteIndices[i] = mapping.posInBlock;
    bitMasks[i] = 1 << mapping.bitInByte;
    pixelIndices[i] = mapping.pixelIndex;
  }

  for (const vector of vectors) {
    const row = new Uint32Array(bitsetWordCount);

    // For this vector, find which pixels it affects
    // The vector's blockBits array contains (dataBytes + eccBytes)
    for (let i = 0; i < mappingCount; i++) {
      const byteIndex = byteIndices[i];
      if (byteIndex >= vector.blockBits.length) continue;
      if ((vector.blockBits[byteIndex] & bitMasks[i]) === 0) continue;
      const pixelIndex = pixelIndices[i];
      row[pixelIndex >>> BITSET_WORD_SHIFT] |= 1 << (pixelIndex & BITSET_WORD_MASK);
    }

    matrix.push(row);
  }

  return matrix;
}
