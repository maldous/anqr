/**
 * Parse subpixelGridSize string to get scale factor
 * '2x2' -> 2, '3x3' -> 3, '4x4' -> 4
 */
export function parseGridSize(gridSize: string | undefined): number {
  if (!gridSize) return 3; // default
  const match = /^(\d+)x\d+$/.exec(gridSize);
  if (match) {
    return Number.parseInt(match[1], 10);
  }
  return 3; // default fallback
}
