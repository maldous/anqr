import type { RSBasisVector } from './rs-basis';
import { applyVectorDenseXOR } from './apply-vector-dense-xor';
import { applyVectorSparseXOR } from './apply-vector-sparse-xor';

export function applySelectedVectorsToBlock(
  blockData: Uint8Array,
  blockEcc: Uint8Array,
  blockVectors: RSBasisVector[],
  selectedIndices: number[],
  dataCount: number
): void {
  for (const idx of selectedIndices) {
    const v = blockVectors[idx];
    if (v.nonZeroByteIndices && v.nonZeroByteValues) {
      applyVectorSparseXOR(
        v.nonZeroByteIndices,
        v.nonZeroByteValues,
        blockData,
        blockEcc,
        dataCount
      );
    } else {
      applyVectorDenseXOR(v.blockBits, blockData, blockEcc, dataCount);
    }
  }
}
