import { isFinderPattern } from "./is-finder-pattern";

export function alignmentOverlapsFinderRegion(
  row: number,
  col: number,
  moduleCount: number,
): boolean {
  if (isFinderPattern(row, col, moduleCount)) return true;
  for (let dr = -2; dr <= 2; dr++) {
    for (let dc = -2; dc <= 2; dc++) {
      if (isFinderPattern(row + dr, col + dc, moduleCount)) {
        return true;
      }
    }
  }
  return false;
}
