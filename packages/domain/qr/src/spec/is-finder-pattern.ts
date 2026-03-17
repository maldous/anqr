/**
 * Check if position is within a finder pattern
 * Finder patterns are 7x7 at corners (0,0), (0, size-7), (size-7, 0)
 */
export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  // Top-left finder
  if (row < 7 && col < 7) return true;
  // Top-right finder
  if (row < 7 && col >= moduleCount - 7) return true;
  // Bottom-left finder
  if (row >= moduleCount - 7 && col < 7) return true;
  return false;
}
