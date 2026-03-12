import { isFinderPattern } from './is-finder-pattern';
/**
 * Check whether the 5×5 region around (row, col) overlaps any finder pattern.
 */
function alignmentOverlapsFinderRegion(row: number, col: number, moduleCount: number): boolean {
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

export function isQuietZoneSeparator(row: number, col: number, moduleCount: number): boolean {
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}

export { alignmentOverlapsFinderRegion };
