export function isFormatInfo(row: number, col: number, moduleCount: number): boolean {
  if (row === 8) {
    if (col <= 5) return true;
    if (col === 7 || col === 8) return true;
    if (col >= moduleCount - 8) return true;
  }
  if (col === 8) {
    if (row <= 5) return true;
    if (row === 7 || row === 8) return true;
    if (row >= moduleCount - 7) return true;
  }
  return false;
}
