import type { NumericSelectionMask } from "./numeric-selection-mask";

export function removeSelectionAndUpdate(sel: NumericSelectionMask, currentValues: number[]): void {
  for (let j = 0; j < sel.groups.length; j++) {
    const g = sel.groups[j];
    currentValues[g] = (currentValues[g] ?? 0) ^ sel.masks[j];
  }
}
