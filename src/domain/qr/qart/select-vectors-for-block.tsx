import { indexToPixel } from './bit-mapping';
import type { BlockEliminationResult } from './elimination.types';

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
