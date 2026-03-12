/**
 * QR-Art Gauss-Jordan Elimination
 *
 * This module implements the key algorithm that trades pixel control
 * between data bits and ECC bits. By performing row reduction on the
 * RS basis matrix, we can assign specific pixels to specific basis vectors.
 *
 * IMPORTANT: RS codes are only linear within a single block!
 * The Gauss-Jordan elimination MUST be performed per-block separately.
 *
 * The algorithm:
 * 1. Group vectors by RS block
 * 2. For each block, build a matrix where rows are basis vectors, columns are affected pixels
 * 3. Sort columns by pixel importance (from target image)
 * 4. Perform Gauss-Jordan elimination per block, assigning pivots to important pixels
 * 5. Each pivot row now controls one specific pixel
 * 6. Combine results from all blocks
 */

import { createLogger } from '../../../infra/logging/logger';
import { type BitPixelMapping, indexToPixel } from './bit-mapping';
import { acquireUint8Buffer, releaseUint8Buffer } from './buffer-pool';
import type { RSBasisVector } from './rs-basis';

export const log = createLogger('QART');
export const BITSET_WORD_SHIFT = 5;
export const BITSET_WORD_SIZE = 1 << BITSET_WORD_SHIFT;
export const BITSET_WORD_MASK = BITSET_WORD_SIZE - 1;

export function attachNonZeroBytes(vectors: RSBasisVector[]): void {
  for (const v of vectors) {
    const bits = v.blockBits;
    let nonZeroCount = 0;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] !== 0) nonZeroCount++;
    }

    if (nonZeroCount === 0) {
      v.nonZeroByteIndices = new Uint16Array(0);
      v.nonZeroByteValues = new Uint8Array(0);
      continue;
    }

    const indices = new Uint16Array(nonZeroCount);
    const values = new Uint8Array(nonZeroCount);
    let writeIndex = 0;
    for (let i = 0; i < bits.length; i++) {
      const byte = bits[i];
      if (byte === 0) continue;
      indices[writeIndex] = i;
      values[writeIndex] = byte;
      writeIndex++;
    }

    v.nonZeroByteIndices = indices;
    v.nonZeroByteValues = values;
  }
}

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

export function findRowWithBitSet(
  matrix: Uint32Array[],
  startRow: number,
  endRow: number,
  wordIndex: number,
  bitIndex: number
): number {
  for (let r = startRow; r < endRow; r++) {
    if (((matrix[r][wordIndex] >>> bitIndex) & 1) === 1) {
      return r;
    }
  }
  return -1;
}

export function eliminatePixelFromOtherRows(
  matrix: Uint32Array[],
  resultVectors: RSBasisVector[],
  pivotRow: number,
  numVectors: number,
  wordIndex: number,
  bitIndex: number,
  bitsetWordCount: number
): void {
  const pivotMatrixRow = matrix[pivotRow];
  for (let r = 0; r < numVectors; r++) {
    if (r !== pivotRow && ((matrix[r][wordIndex] >>> bitIndex) & 1) === 1) {
      const row = matrix[r];
      for (let word = 0; word < bitsetWordCount; word++) {
        row[word] ^= pivotMatrixRow[word];
      }
      for (let i = 0; i < resultVectors[r].blockBits.length; i++) {
        resultVectors[r].blockBits[i] ^= resultVectors[pivotRow].blockBits[i];
      }
    }
  }
}

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
  const rowPivot: number[] = new Array(numVectors).fill(-1);
  // Track which row controls each pixel (-1 if none)
  const pixelToRow: number[] = new Array(totalPixels).fill(-1);

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

export function shrinkAvailablePixelOrder(
  availablePixelOrder: number[],
  controlledPixels: number[],
  assignedPixelMask: Uint8Array,
  totalPixels: number
): number[] {
  for (const pixel of controlledPixels) {
    if (pixel >= 0 && pixel < totalPixels) {
      assignedPixelMask[pixel] = 1;
    }
  }

  const remainingPixels: number[] = [];
  for (const pixel of availablePixelOrder) {
    if (assignedPixelMask[pixel] === 0) remainingPixels.push(pixel);
  }

  for (const pixel of controlledPixels) {
    if (pixel >= 0 && pixel < totalPixels) {
      assignedPixelMask[pixel] = 0;
    }
  }
  return remainingPixels;
}

/**
 * Select which basis vectors to apply to achieve the target pattern
 * Returns selections per RS block (needed for proper re-encoding)
 *
 * @param eliminationResult Full elimination result
 * @param targets Target pixel values
 * @param baseMatrix Base QR matrix (from encoding the data)
 * @param moduleCount Module count
 * @returns Per-block selection results
 */

export function selectVectorsForBlock(
  blockResult: BlockEliminationResult,
  targets: boolean[][],
  baseMatrix: boolean[][],
  moduleCount: number,
  pixelDiff: Uint8Array | undefined
): number[] {
  const selectedVectorIndices: number[] = [];

  for (let vectorIndex = 0; vectorIndex < blockResult.vectors.length; vectorIndex++) {
    const pivotPixel = blockResult.vectors[vectorIndex]?.pivotPixel ?? -1;
    if (pivotPixel < 0) continue;

    if (pixelDiff) {
      if (pixelDiff[pivotPixel]) {
        selectedVectorIndices.push(vectorIndex);
      }
      continue;
    }

    const { row, col } = indexToPixel(pivotPixel, moduleCount);
    const target = targets[row]?.[col] ?? false;
    const base = baseMatrix[row]?.[col] ?? false;

    if (target !== base) {
      selectedVectorIndices.push(vectorIndex);
    }
  }

  return selectedVectorIndices;
}

/**
 * Apply selected basis vectors to modify BOTH data AND ECC bytes for a single block
 * XORs the selected vectors' complete blockBits (data + ECC) with the base codeword.
 *
 * IMPORTANT: RS codes are linear - XOR of valid codewords is valid. Since basis
 * vectors contain valid codewords (data + correct ECC), XORing preserves validity.
 * We MUST XOR both data AND ECC to maintain this property.
 *
 * @param blockData Original data bytes for this block (will be modified in place)
 * @param blockEcc Original ECC bytes for this block (will be modified in place)
 * @param blockVectors Eliminated basis vectors for this block
 * @param selectedIndices Indices of vectors within this block to apply
 * @param dataCount Number of data bytes in this block
 */
export function applyVectorSparseXOR(
  nzIdx: Uint16Array,
  nzVals: Uint8Array,
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  dataCount: number
): void {
  for (let k = 0; k < nzIdx.length; k++) {
    const byteIdx = nzIdx[k];
    const byteVal = nzVals[k];
    if (byteIdx < dataCount) {
      blockData[byteIdx] ^= byteVal;
    } else {
      const eccIdx = byteIdx - dataCount;
      if (eccIdx >= 0 && eccIdx < blockEcc.length) {
        blockEcc[eccIdx] ^= byteVal;
      }
    }
  }
}

export function applyVectorDenseXOR(
  blockBits: Uint8Array,
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  dataCount: number
): void {
  for (let i = 0; i < dataCount; i++) {
    blockData[i] ^= blockBits[i];
  }
  const eccCount = blockEcc.length;
  for (let i = 0; i < eccCount; i++) {
    blockEcc[i] ^= blockBits[dataCount + i];
  }
}

export function buildBlockBitToPixelTables(mappings: BitPixelMapping[]): Array<Int32Array | undefined> {
  const blockMaxBitKeys: number[] = [];
  for (const mapping of mappings) {
    const bitKey = mapping.posInBlock * 8 + mapping.bitInByte;
    const existing = blockMaxBitKeys[mapping.rsBlockIndex];
    if (existing === undefined || bitKey > existing) {
      blockMaxBitKeys[mapping.rsBlockIndex] = bitKey;
    }
  }

  const tables: Array<Int32Array | undefined> = new Array(blockMaxBitKeys.length);
  for (let blockIndex = 0; blockIndex < blockMaxBitKeys.length; blockIndex++) {
    const maxBitKey = blockMaxBitKeys[blockIndex];
    if (maxBitKey === undefined) continue;
    const table = new Int32Array(maxBitKey + 1);
    table.fill(-1);
    tables[blockIndex] = table;
  }
  for (const mapping of mappings) {
    const table = tables[mapping.rsBlockIndex];
    if (!table) continue;
    table[mapping.posInBlock * 8 + mapping.bitInByte] = mapping.pixelIndex;
  }

  return tables;
}

export function applyVectorBitsToFlipParity(
  vector: RSBasisVector,
  bitToPixelTable: Int32Array,
  flipParity: Uint8Array,
  maxPixelCount: number
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

export function computeFlipParity(
  blockSelections: BlockSelectionResult[],
  blockResultByIndex: Array<BlockEliminationResult | undefined>,
  blockBitToPixelTables: Array<Int32Array | undefined>,
  flipParity: Uint8Array,
  maxPixelCount: number
): void {
  for (const sel of blockSelections) {
    const { blockIndex, selectedVectorIndices } = sel;
    const blockResult = blockResultByIndex[blockIndex];
    const bitToPixelTable = blockBitToPixelTables[blockIndex];
    if (!(blockResult && bitToPixelTable)) continue;

    for (const vectorIdx of selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIdx];
      if (!vector) continue;
      applyVectorBitsToFlipParity(vector, bitToPixelTable, flipParity, maxPixelCount);
    }
  }
}
