/**
 * Convert (row, col) to linear pixel index
 */
export function pixelToIndex(row: number, col: number, moduleCount: number): number {
  return row * moduleCount + col;
}
