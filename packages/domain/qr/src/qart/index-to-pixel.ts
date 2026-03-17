/**
 * Convert linear pixel index to (row, col)
 */
export function indexToPixel(index: number, moduleCount: number): { row: number; col: number } {
  return {
    row: Math.floor(index / moduleCount),
    col: index % moduleCount,
  };
}
