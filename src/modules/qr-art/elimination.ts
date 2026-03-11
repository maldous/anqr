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

import { createLogger } from '../../lib/logger';
import { type BitPixelMapping, indexToPixel } from './bit-mapping';
import { acquireUint8Buffer, releaseUint8Buffer } from './buffer-pool';
import type { RSBasisVector } from './rs-basis';

const log = createLogger('QART');
const BITSET_WORD_SHIFT = 5;
const BITSET_WORD_SIZE = 1 << BITSET_WORD_SHIFT;
const BITSET_WORD_MASK = BITSET_WORD_SIZE - 1;

function attachNonZeroBytes(vectors: RSBasisVector[]): void {
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
 * Result of Gauss-Jordan elimination for a single RS block
 */
export interface BlockEliminationResult {
  /** RS block index */
  blockIndex: number;
  /** Eliminated basis vectors for this block */
  vectors: RSBasisVector[];
  /** Map from pixel index to the vector index within this block */
  pixelToVectorIndex: Map<number, number>;
  /** Number of pixels this block can control */
  controllablePixels: number;
  /** Pixels controlled by this block */
  controlledPixels: number[];
}

/**
 * Result of Gauss-Jordan elimination across all blocks
 */
export interface EliminationResult {
  /** Per-block elimination results */
  blockResults: BlockEliminationResult[];
  /** Eliminated basis vectors (all blocks combined, in original order) */
  vectors: RSBasisVector[];
  /** Map from pixel index to { blockIndex, vectorIndex } */
  pixelToVector: Map<number, { blockIndex: number; vectorIndex: number }>;
  /** Total number of pixels we can control */
  controllablePixels: number;
  /** All pixels we control */
  controlledPixels: number[];
}

/**
 * Rank pixels by their importance based on target image
 * Returns pixel indices sorted from most to least important
 *
 * @param targets Target pixel values (true = dark)
 * @param importance Importance weights (0-1)
 * @param moduleCount QR module count
 * @param dataPixels Set of pixel indices that are data (non-structural)
 * @returns Sorted pixel indices
 */
export function rankPixelsByImportance(
  _targets: boolean[][],
  importance: number[][],
  moduleCount: number,
  dataPixels: Set<number>
): number[] {
  if (dataPixels.size === 0) return [];
  const candidateCapacity = dataPixels.size;
  const candidateIndices = new Uint32Array(candidateCapacity);
  const candidateScores = new Float32Array(candidateCapacity);
  let candidateCount = 0;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const pixelIndex = row * moduleCount + col;

      // Only include data pixels
      if (!dataPixels.has(pixelIndex)) continue;

      candidateIndices[candidateCount] = pixelIndex;
      candidateScores[candidateCount] = importance[row]?.[col] ?? 0;
      candidateCount++;
    }
  }

  if (candidateCount === 0) return [];

  const rankOrder = new Array<number>(candidateCount);
  for (let i = 0; i < candidateCount; i++) {
    rankOrder[i] = i;
  }

  // Sort by importance (descending), preserving row-major tie order.
  rankOrder.sort((a, b) => candidateScores[b] - candidateScores[a]);

  const rankedPixels = new Array<number>(candidateCount);
  for (let i = 0; i < candidateCount; i++) {
    rankedPixels[i] = candidateIndices[rankOrder[i]];
  }
  return rankedPixels;
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
function buildBlockAffectionMatrix(
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

function findRowWithBitSet(
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

function eliminatePixelFromOtherRows(
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
function eliminateBlock(
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

function shrinkAvailablePixelOrder(
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
 * Perform Gauss-Jordan elimination on all RS blocks
 * Each block is processed separately to maintain RS linearity
 *
 * @param vectors All basis vectors (will be grouped by rsBlockIndex)
 * @param mappings Bit-to-pixel mappings
 * @param moduleCount Module count
 * @param maskPattern Mask pattern
 * @param pixelOrder Pixels sorted by importance (most important first)
 * @returns Combined elimination result
 */
export function gaussJordanEliminate(
  vectors: RSBasisVector[],
  mappings: BitPixelMapping[],
  moduleCount: number,
  maskPattern: number,
  pixelOrder: number[]
): EliminationResult {
  const totalPixels = moduleCount * moduleCount;

  // Group vectors by RS block
  const blockVectors = new Map<number, RSBasisVector[]>();
  for (const v of vectors) {
    const list = blockVectors.get(v.rsBlockIndex) || [];
    list.push(v);
    blockVectors.set(v.rsBlockIndex, list);
  }

  // Group mappings by RS block
  const blockMappings = new Map<number, BitPixelMapping[]>();
  for (const m of mappings) {
    const list = blockMappings.get(m.rsBlockIndex) || [];
    list.push(m);
    blockMappings.set(m.rsBlockIndex, list);
  }

  // Get all block indices, sorted
  const blockIndices = [...new Set([...blockVectors.keys(), ...blockMappings.keys()])].sort(
    (a, b) => a - b
  );

  // Track the still-available pixel order once and shrink it as blocks claim pivots.
  let availablePixelOrder = [...pixelOrder];
  const assignedPixelMask = acquireUint8Buffer(totalPixels);

  // Process each block separately
  try {
    const blockResults: BlockEliminationResult[] = [];
    const allVectors: RSBasisVector[] = [];
    const pixelToVector = new Map<number, { blockIndex: number; vectorIndex: number }>();
    const allControlledPixels: number[] = [];
    let totalControllable = 0;

    for (const blockIndex of blockIndices) {
      const bVectors = blockVectors.get(blockIndex) || [];
      const bMappings = blockMappings.get(blockIndex) || [];

      const result = eliminateBlock(
        blockIndex,
        bVectors,
        bMappings,
        moduleCount,
        maskPattern,
        availablePixelOrder
      );

      blockResults.push(result);

      if (result.controlledPixels.length > 0 && availablePixelOrder.length > 0) {
        availablePixelOrder = shrinkAvailablePixelOrder(
          availablePixelOrder,
          result.controlledPixels,
          assignedPixelMask,
          totalPixels
        );
      }

      // Add vectors to combined list
      const _vectorOffset = allVectors.length;
      allVectors.push(...result.vectors);

      // Update pixel-to-vector map
      for (const [pixel, vectorIdx] of result.pixelToVectorIndex) {
        pixelToVector.set(pixel, { blockIndex, vectorIndex: vectorIdx });
        allControlledPixels.push(pixel);
      }

      totalControllable += result.controllablePixels;
    }

    log.debug('Gauss-Jordan elimination complete (per-block)', {
      numBlocks: blockIndices.length,
      totalVectors: allVectors.length,
      controllablePixels: totalControllable,
      totalDataPixels: pixelOrder.length,
    });

    return {
      blockResults,
      vectors: allVectors,
      pixelToVector,
      controllablePixels: totalControllable,
      controlledPixels: allControlledPixels,
    };
  } finally {
    releaseUint8Buffer(assignedPixelMask);
  }
}

/**
 * Selection result for a single RS block
 */
export interface BlockSelectionResult {
  blockIndex: number;
  selectedVectorIndices: number[];
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

function selectVectorsForBlock(
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
 * Select which basis vectors to apply to achieve the target pattern
 * Returns selections per RS block (needed for proper re-encoding)
 */
export function selectBasisVectorsForTarget(
  eliminationResult: EliminationResult,
  targets: boolean[][],
  baseMatrix: boolean[][],
  moduleCount: number,
  pixelDiff?: Uint8Array
): BlockSelectionResult[] {
  const results: BlockSelectionResult[] = [];

  for (const blockResult of eliminationResult.blockResults) {
    const selectedVectorIndices = selectVectorsForBlock(
      blockResult,
      targets,
      baseMatrix,
      moduleCount,
      pixelDiff
    );
    results.push({ blockIndex: blockResult.blockIndex, selectedVectorIndices });
  }

  return results.sort((a, b) => a.blockIndex - b.blockIndex);
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
export function applySelectedVectorsToBlock(
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  blockVectors: RSBasisVector[],
  selectedIndices: number[],
  dataCount: number
): void {
  for (const idx of selectedIndices) {
    const v = blockVectors[idx];
    const nzIdx = v.nonZeroByteIndices;
    const nzVals = v.nonZeroByteValues;
    if (nzIdx && nzVals) {
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
      continue;
    }

    // XOR the data portion of this vector with the block's data
    for (let i = 0; i < dataCount; i++) {
      blockData[i] ^= v.blockBits[i];
    }
    // XOR the ECC portion of this vector with the block's ECC
    // blockBits layout: [data0, data1, ..., dataN-1, ecc0, ecc1, ..., eccM-1]
    const eccCount = blockEcc.length;
    for (let i = 0; i < eccCount; i++) {
      blockEcc[i] ^= v.blockBits[dataCount + i];
    }
  }
}

/**
 * Apply selected basis vectors to modify all block data AND ECC
 *
 * IMPORTANT: This XORs both data AND ECC to preserve RS linearity.
 * The resulting codewords remain valid RS codewords.
 *
 * @param blockDataArrays Per-block data byte arrays (modified in place)
 * @param blockEccArrays Per-block ECC byte arrays (modified in place)
 * @param eliminationResult Full elimination result
 * @param blockSelections Per-block selection results
 * @param blockDataCounts Number of data bytes per block
 */
export function applyAllSelectedVectors(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  eliminationResult: EliminationResult,
  blockSelections: BlockSelectionResult[],
  blockDataCounts: number[]
): void {
  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;
    if (selectedVectorIndices.length === 0) continue;

    // Find the block result
    const blockResult = eliminationResult.blockResults.find((br) => br.blockIndex === blockIndex);
    if (!blockResult) continue;

    const blockData = blockDataArrays[blockIndex];
    const blockEcc = blockEccArrays[blockIndex];
    const dataCount = blockDataCounts[blockIndex];

    applySelectedVectorsToBlock(
      blockData,
      blockEcc,
      blockResult.vectors,
      selectedVectorIndices,
      dataCount
    );
  }
}

function buildBlockBitToPixelTables(mappings: BitPixelMapping[]): Array<Int32Array | undefined> {
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

function applyVectorBitsToFlipParity(
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

function computeFlipParity(
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

/**
 * Count how many pixels match the target after applying selected vectors
 *
 * IMPORTANT: After Gauss-Jordan elimination, each vector's blockBits has been XORed
 * with other vectors and affects MULTIPLE pixels - not just the pivot pixel.
 * We must account for ALL pixels affected by each selected vector's blockBits.
 *
 * @param baseMatrix Base QR matrix
 * @param eliminationResult Full elimination result
 * @param blockSelections Per-block selection results
 * @param targets Target values
 * @param moduleCount Module count
 * @param dataPixels Set of data pixel indices
 * @param mappings Bit-to-pixel mappings (needed to find all affected pixels)
 * @returns Number of matching pixels
 */
export function countMatchingPixels(
  baseMatrix: boolean[][],
  eliminationResult: EliminationResult,
  blockSelections: BlockSelectionResult[],
  targets: boolean[][],
  moduleCount: number,
  dataPixels: Set<number>,
  mappings: BitPixelMapping[]
): { matching: number; total: number } {
  const maxPixelCount = moduleCount * moduleCount;
  const blockBitToPixelTables = buildBlockBitToPixelTables(mappings);

  // Track flip parity directly (odd = flipped, even = unchanged).
  const flipParity = acquireUint8Buffer(maxPixelCount);
  const dataPixelMask = acquireUint8Buffer(maxPixelCount);
  for (const pixelIdx of dataPixels) {
    if (pixelIdx >= 0 && pixelIdx < maxPixelCount) {
      dataPixelMask[pixelIdx] = 1;
    }
  }

  const blockResultByIndex: Array<BlockEliminationResult | undefined> = [];
  for (const blockResult of eliminationResult.blockResults) {
    blockResultByIndex[blockResult.blockIndex] = blockResult;
  }

  try {
    computeFlipParity(
      blockSelections,
      blockResultByIndex,
      blockBitToPixelTables,
      flipParity,
      maxPixelCount
    );

    let matching = 0;
    let total = 0;

    for (let pixelIdx = 0; pixelIdx < maxPixelCount; pixelIdx++) {
      if (dataPixelMask[pixelIdx] === 0) continue;

      total++;
      const row = Math.floor(pixelIdx / moduleCount);
      const col = pixelIdx - row * moduleCount;

      let value = baseMatrix[row]?.[col] ?? false;
      if (flipParity[pixelIdx] === 1) {
        value = !value;
      }

      const target = targets[row]?.[col] ?? false;
      if (value === target) matching++;
    }

    return { matching, total };
  } finally {
    releaseUint8Buffer(flipParity);
    releaseUint8Buffer(dataPixelMask);
  }
}
