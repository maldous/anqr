/**
 * Check if position is on a timing pattern
 * Timing patterns are at row 6 and column 6
 */
export function isTimingPattern(row: number, col: number, moduleCount: number): boolean {
  // Horizontal timing (row 6, between finders)
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  // Vertical timing (col 6, between finders)
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}
