import type { NumericSelectionMask } from "./numeric-selection-mask";

export function selectionTouchesInvalidGroup(
  sel: NumericSelectionMask,
  invalid: Uint8Array,
): boolean {
  for (const group of sel.groups) {
    if (invalid[group]) return true;
  }
  return false;
}
