import type { FlattenedSelection } from "./scan-fallback";
import { accumulateSparseVectorMasks } from "./accumulate-sparse-vector-masks";
import { accumulateDenseVectorMasks } from "./accumulate-dense-vector-masks";
import type { NumericSelectionMask } from "./numeric-selection-mask";

export function computeEntryGroupMasks(
  entry: FlattenedSelection,
  blockDataCounts: number[],
  blockStartBytes: number[],
  numericStartByte: number,
  numericEndByte: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array,
): NumericSelectionMask {
  const vector = entry.vector;
  const dataCount = blockDataCounts[entry.blockIndex] ?? 0;
  const blockStart = blockStartBytes[entry.blockIndex] ?? 0;

  const nzIdx = vector.nonZeroByteIndices;
  const nzVals = vector.nonZeroByteValues;
  const touchedCount =
    nzIdx && nzVals
      ? accumulateSparseVectorMasks(
          nzIdx,
          nzVals,
          dataCount,
          blockStart,
          numericStartByte,
          numericEndByte,
          numericDataStart,
          numericDataBits,
          groupIndexForBit,
          bitMaskForBit,
          groupMasks,
          touched,
        )
      : accumulateDenseVectorMasks(
          vector.blockBits,
          dataCount,
          blockStart,
          numericDataStart,
          numericDataBits,
          groupIndexForBit,
          bitMaskForBit,
          groupMasks,
          touched,
        );

  if (touchedCount === 0) {
    return { entry, groups: new Int32Array(0), masks: new Int32Array(0) };
  }
  const groups = new Int32Array(touchedCount);
  const masks = new Int32Array(touchedCount);
  for (let i = 0; i < touchedCount; i++) {
    const g = touched[i];
    groups[i] = g;
    masks[i] = groupMasks[g];
    groupMasks[g] = 0;
  }
  return { entry, groups, masks };
}
