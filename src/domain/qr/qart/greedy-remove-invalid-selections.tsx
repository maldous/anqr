import { markInvalidGroups } from "./mark-invalid-groups";
import { selectionTouchesInvalidGroup } from "./selection-touches-invalid-group";
import { removeSelectionAndUpdate } from "./remove-selection-and-update";
import type { NumericSelectionMask } from "./numeric-selection-mask";

export function greedyRemoveInvalidSelections(
  selections: NumericSelectionMask[],
  currentValues: number[],
  groupMax: number[],
  groupCount: number,
): boolean[] {
  const invalid = new Uint8Array(groupCount);
  let invalidCount = markInvalidGroups(currentValues, groupMax, groupCount, invalid);
  const keep = Array.from({ length: selections.length }, () => true);

  while (invalidCount > 0) {
    let removed = false;
    for (let i = selections.length - 1; i >= 0; i--) {
      if (!keep[i]) continue;
      if (!selectionTouchesInvalidGroup(selections[i], invalid)) continue;

      keep[i] = false;
      removeSelectionAndUpdate(selections[i], currentValues);
      removed = true;
      invalidCount = markInvalidGroups(currentValues, groupMax, groupCount, invalid);
      break;
    }
    if (!removed) break;
  }

  return keep;
}
