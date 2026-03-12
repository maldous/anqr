import type {
  BlockEliminationResult,
  BlockSelectionResult,
  EliminationResult,
} from './elimination';
import type { FlattenedSelection } from './scan-fallback.types';

/**
 * Flatten block selections into an ordered list sorted by pixel importance.
 * This allows us to progressively apply the most important vectors first.
 *
 * @param blockSelections Per-block selection results
 * @param eliminationResult Full elimination result with vectors
 * @param importance 2D importance array from target image
 * @param moduleCount QR module count
 * @returns Flattened selections sorted by importance (highest first)
 */
export function flattenAndOrderSelections(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number
): FlattenedSelection[] {
  const flattened: FlattenedSelection[] = [];
  const blockResultMap = new Map<number, BlockEliminationResult>();
  for (const br of eliminationResult.blockResults) {
    blockResultMap.set(br.blockIndex, br);
  }

  for (const selection of blockSelections) {
    const { blockIndex, selectedVectorIndices } = selection;

    const blockResult = blockResultMap.get(blockIndex);
    if (!blockResult) continue;

    for (const vectorIndex of selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIndex];
      if (!vector || vector.pivotPixel < 0) continue;

      // Get importance of the pivot pixel this vector controls
      const row = Math.floor(vector.pivotPixel / moduleCount);
      const col = vector.pivotPixel % moduleCount;
      const pixelImportance = importance[row]?.[col] ?? 0;

      flattened.push({
        blockIndex,
        vectorIndex,
        importance: pixelImportance,
        vector,
      });
    }
  }

  // Sort by importance (highest first) - we want to keep the most important pixels
  flattened.sort((a, b) => b.importance - a.importance);

  return flattened;
}
