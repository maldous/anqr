export function isQuietZoneSeparator(row: number, col: number, moduleCount: number): boolean {
  // Top-left separator
  if ((row === 7 && col <= 7) || (col === 7 && row <= 7)) return true;
  // Top-right separator
  if ((row === 7 && col >= moduleCount - 8) || (col === moduleCount - 8 && row <= 7)) return true;
  // Bottom-left separator
  if ((row === moduleCount - 8 && col <= 7) || (col === 7 && row >= moduleCount - 8)) return true;
  return false;
}
