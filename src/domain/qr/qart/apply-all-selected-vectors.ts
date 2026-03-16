import type { EliminationResult, BlockSelectionResult } from "./elimination.types";
import { applySelectedVectorsToBlock } from "./apply-selected-vectors-to-block";

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
  blockDataCounts: number[],
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
      dataCount,
    );
  }
}
