import type { BitPixelMapping } from './bit-mapping';
import type { RSBasisVector } from './rs-basis';
import { BITSET_WORD_SHIFT } from './bitset-word-shift';
import { BITSET_WORD_SIZE } from './bitset-word-size';
import { BITSET_WORD_MASK } from './bitset-word-mask';
import { attachNonZeroBytes } from './attach-non-zero-bytes';
import { buildBlockAffectionMatrix } from './build-block-affection-matrix';
import { findRowWithBitSet } from './find-row-with-bit-set';
import { eliminatePixelFromOtherRows } from './eliminate-pixel-from-other-rows';
import type { BlockEliminationResult } from './elimination.types';

/**
 * Perform Gauss-Jordan elimination for a SINGLE RS block
 * This assigns each basis vector to control one specific pixel
 *
 * @param blockIndex The RS block index
 * @param vectors Basis vectors for this block only
 * @param blockMappings Bit-to-pixel mappings for this block
 * @param moduleCount Module count
 * @param maskPattern Mask pattern
 * @param pixelOrder Pixels sorted by importance (most important first)
 * @returns Block elimination result
 */
export function eliminateBlock(
  blockIndex: number,
  vectors: RSBasisVector[],
  blockMappings: BitPixelMapping[],
  moduleCount: number,
  maskPattern: number,
  pixelOrder: number[]
): BlockEliminationResult {
  const numVectors = vectors.length;
  const totalPixels = moduleCount * moduleCount;
  const bitsetWordCount = (totalPixels + BITSET_WORD_SIZE - 1) >>> BITSET_WORD_SHIFT;

  if (numVectors === 0) {
    return {
      blockIndex,
      vectors: [],
      pixelToVectorIndex: new Map(),
      controllablePixels: 0,
      controlledPixels: [],
    };
  }

  // Build the affection matrix for this block only
  const matrix = buildBlockAffectionMatrix(vectors, blockMappings, moduleCount, maskPattern);

  // Clone vectors for modification
  const resultVectors = vectors.map((v) => ({
    ...v,
    blockBits: new Uint8Array(v.blockBits),
    affectedPixels: [...v.affectedPixels],
  }));

  // Track which pixel each row pivots on (-1 if no pivot yet)
  const rowPivot: number[] = Array.from({ length: numVectors }, () => -1);
  // Track which row controls each pixel (-1 if none)
  const pixelToRow: number[] = Array.from({ length: totalPixels }, () => -1);

  let pivotRow = 0;

  // Process pixels in importance order
  for (const pixelIdx of pixelOrder) {
    if (pivotRow >= numVectors) break;
    const wordIndex = pixelIdx >>> BITSET_WORD_SHIFT;
    const bitIndex = pixelIdx & BITSET_WORD_MASK;

    // Find a row that has this pixel set and isn't already pivoted
    const foundRow = findRowWithBitSet(matrix, pivotRow, numVectors, wordIndex, bitIndex);

    if (foundRow === -1) continue; // No row in this block affects this pixel

    // Swap found row with current pivot row
    if (foundRow !== pivotRow) {
      [matrix[pivotRow], matrix[foundRow]] = [matrix[foundRow], matrix[pivotRow]];
      [resultVectors[pivotRow], resultVectors[foundRow]] = [
        resultVectors[foundRow],
        resultVectors[pivotRow],
      ];
    }

    eliminatePixelFromOtherRows(
      matrix,
      resultVectors,
      pivotRow,
      numVectors,
      wordIndex,
      bitIndex,
      bitsetWordCount
    );

    // Mark this row as pivoting on this pixel
    rowPivot[pivotRow] = pixelIdx;
    pixelToRow[pixelIdx] = pivotRow;
    resultVectors[pivotRow].pivotPixel = pixelIdx;

    pivotRow++;
  }

  // Build result for this block
  const pixelToVectorIndex = new Map<number, number>();
  const controlledPixels: number[] = [];

  for (let r = 0; r < numVectors; r++) {
    if (rowPivot[r] !== -1) {
      pixelToVectorIndex.set(rowPivot[r], r);
      controlledPixels.push(rowPivot[r]);
    }
  }

  attachNonZeroBytes(resultVectors);

  return {
    blockIndex,
    vectors: resultVectors,
    pixelToVectorIndex,
    controllablePixels: controlledPixels.length,
    controlledPixels,
  };
}
