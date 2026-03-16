import type {
  BlockEliminationResult,
  BlockSelectionResult,
  EliminationResult,
} from "./elimination";
import type { FlattenedSelection } from "./scan-fallback.types";

export function forEachFlattenedSelection(
  blockSelections: BlockSelectionResult[],
  eliminationResult: EliminationResult,
  importance: number[][],
  moduleCount: number,
  visit: (entry: FlattenedSelection) => void,
): void {
  const blockResultMap = new Map<number, BlockEliminationResult>();
  for (const blockResult of eliminationResult.blockResults) {
    blockResultMap.set(blockResult.blockIndex, blockResult);
  }

  for (const selection of blockSelections) {
    const blockResult = blockResultMap.get(selection.blockIndex);
    if (!blockResult) continue;

    for (const vectorIndex of selection.selectedVectorIndices) {
      const vector = blockResult.vectors[vectorIndex];
      if (!vector || vector.pivotPixel < 0) continue;

      const row = Math.floor(vector.pivotPixel / moduleCount);
      const col = vector.pivotPixel % moduleCount;
      visit({
        blockIndex: selection.blockIndex,
        vectorIndex,
        importance: importance[row]?.[col] ?? 0,
        vector,
      });
    }
  }
}
