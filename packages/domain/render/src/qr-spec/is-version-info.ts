export function isVersionInfo(
  row: number,
  col: number,
  moduleCount: number,
  version: number,
): boolean {
  if (version < 7) return false;
  if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
  if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;
  return false;
}
