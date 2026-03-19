export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= moduleCount - 8) return true;
  if (row >= moduleCount - 8 && col < 9) return true;
  return false;
}
