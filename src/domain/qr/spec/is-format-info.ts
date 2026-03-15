/**
 * Check if position is in format information area
 * Format info is around finder patterns
 */
export function isFormatInfo(row: number, col: number, moduleCount: number): boolean {
  // Format information modules (15 bits, duplicated).
  // Important: exclude timing modules at (8,6) and (6,8).
  // Top-left group (around top-left finder)
  // - row 8, col 0..5 and 7..8
  // - col 8, row 0..5 and 7..8
  if (row === 8) {
    if (col <= 5) return true;
    if (col === 7 || col === 8) return true;
    // Top-right group
    if (col >= moduleCount - 8) return true;
  }
  if (col === 8) {
    if (row <= 5) return true;
    if (row === 7 || row === 8) return true;
    // Bottom-left group
    if (row >= moduleCount - 7) return true;
  }
  return false;
}
