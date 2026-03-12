import { type BitPixelMapping } from './bit-mapping';
import { acquireUint8Buffer, releaseUint8Buffer } from './buffer-pool';
import type { RSBasisVector } from './rs-basis';
import type { EliminationResult, BlockEliminationResult } from './elimination.types';
import { eliminateBlock } from './eliminate-block';
import { log } from './log';
import { shrinkAvailablePixelOrder } from './shrink-available-pixel-order';

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
