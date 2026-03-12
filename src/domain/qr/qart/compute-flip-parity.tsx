import { applyVectorBitsToFlipParity } from './apply-vector-bits-to-flip-parity';
import type { BlockSelectionResult, BlockEliminationResult } from './elimination';

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
