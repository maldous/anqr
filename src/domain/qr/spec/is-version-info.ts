/**
 * Check if position is in version information area
 * Version info exists for version >= 7
 */
export function isVersionInfo(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  if (version < 7) return false;

  // Bottom-left of top-right finder (3x6 area)
  if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
  // Right of bottom-left finder (6x3 area)
  if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;

  return false;
}
