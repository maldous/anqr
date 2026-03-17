import { QRMode } from "../encode/types";
import { getLengthInBits } from "../encode/utils";
import type { FlattenedSelection } from "./scan-fallback";
import { log } from "./log";
import { getNumericBitsCount } from "./get-numeric-bits-count";
import { greedyRemoveInvalidSelections } from "./greedy-remove-invalid-selections";
import { buildNumericGroupMaps } from "./build-numeric-group-maps";
import { computeEntryGroupMasks } from "./compute-entry-group-masks";
import type { NumericSelectionMask } from "./numeric-selection-mask";
import type { EncoderDerivedLayout } from "./generate.types";

export function filterSelectionsForNumericSuffix(
  flattened: FlattenedSelection[],
  blockDataArrays: Uint8Array[],
  blockDataCounts: number[],
  encoderLayout: EncoderDerivedLayout,
  version: number,
): FlattenedSelection[] {
  if (encoderLayout.suffixMode !== "numeric" || encoderLayout.suffixLength <= 0) {
    return flattened;
  }

  const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  const numericDataStart = encoderLayout.bitsAfterOriginalData + 4 + numericCharCountBits;
  const numericDataBits = getNumericBitsCount(encoderLayout.suffixLength);
  if (numericDataBits <= 0) return flattened;
  const numericStartByte = Math.floor(numericDataStart / 8);
  const numericEndByte = Math.ceil((numericDataStart + numericDataBits) / 8);

  const totalDataBytes = blockDataCounts.reduce((sum, c) => sum + c, 0);
  const linearData = new Uint8Array(totalDataBytes);
  let offset = 0;
  for (let i = 0; i < blockDataArrays.length; i++) {
    linearData.set(blockDataArrays[i], offset);
    offset += blockDataCounts[i];
  }

  const { groupIndexForBit, bitMaskForBit, groupMax, baseGroupValues } = buildNumericGroupMaps(
    linearData,
    numericDataStart,
    encoderLayout.suffixLength,
  );

  const blockStartBytes: number[] = [];
  offset = 0;
  for (const count of blockDataCounts) {
    blockStartBytes.push(offset);
    offset += count;
  }

  const groupCount = groupMax.length;
  const groupMasks = new Int32Array(groupCount);
  const touched = new Int32Array(groupCount);

  const selections: NumericSelectionMask[] = flattened.map((entry) =>
    computeEntryGroupMasks(
      entry,
      blockDataCounts,
      blockStartBytes,
      numericStartByte,
      numericEndByte,
      numericDataStart,
      numericDataBits,
      groupIndexForBit,
      bitMaskForBit,
      groupMasks,
      touched,
    ),
  );

  const currentValues = baseGroupValues.slice();
  for (const sel of selections) {
    for (let i = 0; i < sel.groups.length; i++) {
      const g = sel.groups[i];
      currentValues[g] = (currentValues[g] ?? 0) ^ sel.masks[i];
    }
  }

  const keep = greedyRemoveInvalidSelections(selections, currentValues, groupMax, groupCount);

  const accepted: FlattenedSelection[] = [];
  for (let i = 0; i < selections.length; i++) {
    if (keep[i]) accepted.push(selections[i].entry);
  }

  if (accepted.length !== flattened.length) {
    log.info("Numeric suffix repair filter applied", {
      originalSelections: flattened.length,
      acceptedSelections: accepted.length,
      removed: flattened.length - accepted.length,
    });
  }

  return accepted;
}
