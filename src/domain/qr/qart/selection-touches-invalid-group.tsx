import type { NumericSelectionMask } from './numeric-selection-mask';

export function selectionTouchesInvalidGroup(
  sel: NumericSelectionMask,
  invalid: Uint8Array
): boolean {
  for (let j = 0; j < sel.groups.length; j++) {
    if (invalid[sel.groups[j]]) return true;
  }
  return false;
}
