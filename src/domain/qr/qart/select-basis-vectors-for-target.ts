import type { EliminationResult, BlockSelectionResult } from './elimination.types';
import { selectVectorsForBlock } from './elimination._internal';

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
