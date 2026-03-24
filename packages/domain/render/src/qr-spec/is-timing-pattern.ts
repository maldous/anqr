export function isTimingPattern(row: number, col: number, moduleCount: number): boolean {
  if (row === 6 && col >= 8 && col < moduleCount - 8) return true;
  if (col === 6 && row >= 8 && row < moduleCount - 8) return true;
  return false;
}
