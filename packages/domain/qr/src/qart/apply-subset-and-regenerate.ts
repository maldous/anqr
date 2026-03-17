import type { EliminationResult } from "./elimination";
import { applySelectedVectorsToBlock } from "./elimination";
import type { RegenerateQrFn } from "./regenerate-qr-fn.types";
import type { FlattenedSelection } from "./scan-fallback.types";
import { unflattenSelections } from "./unflatten-selections";

/**
 * Apply a subset of vectors and regenerate the QR matrix.
 * Returns both the matrix and the modified block data/ECC.
 */
export function applySubsetAndRegenerate(
  flattened: FlattenedSelection[],
  count: number,
  originalBlockData: Uint8Array[],
  originalBlockEcc: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  eliminationResult: EliminationResult,
  regenerateQRFn: RegenerateQrFn,
): {
  matrix: boolean[][];
  modifiedBlockData: Uint8Array[];
  modifiedBlockEcc: Uint8Array[];
} {
  // Clone original data
  const modifiedBlockData = originalBlockData.map((arr) => new Uint8Array(arr));
  const modifiedBlockEcc = originalBlockEcc.map((arr) => new Uint8Array(arr));

  // Convert flattened subset back to block selections
  const subsetSelections = unflattenSelections(flattened, count);

  // Apply selected vectors per block
  for (const selection of subsetSelections) {
    const { blockIndex, selectedVectorIndices } = selection;
    if (selectedVectorIndices.length === 0) continue;

    const blockResult = eliminationResult.blockResults.find((br) => br.blockIndex === blockIndex);
    if (!blockResult) continue;

    applySelectedVectorsToBlock(
      modifiedBlockData[blockIndex],
      modifiedBlockEcc[blockIndex],
      blockResult.vectors,
      selectedVectorIndices,
      blockDataCounts[blockIndex],
    );
  }

  // Regenerate matrix
  const matrix = regenerateQRFn(
    modifiedBlockData,
    modifiedBlockEcc,
    blockDataCounts,
    blockEccCounts,
  );

  return { matrix, modifiedBlockData, modifiedBlockEcc };
}
