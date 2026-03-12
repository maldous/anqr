export function isSeparatorModule(row: number, col: number, moduleCount: number): boolean {
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}
