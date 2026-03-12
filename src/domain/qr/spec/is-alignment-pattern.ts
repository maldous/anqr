import { getAlignmentPatternCenters } from './get-alignment-pattern-centers';

/**
 * Check if position is within an alignment pattern
 * Alignment patterns are 5x5 centered at specific positions
 */
export function isAlignmentPattern(
  row: number,
  col: number,
  moduleCount: number,
  version: number
): boolean {
  if (version < 2) return false;

  const centers = getAlignmentPatternCenters(version, moduleCount);

  for (const center of centers) {
    if (Math.abs(row - center.row) <= 2 && Math.abs(col - center.col) <= 2) {
      return true;
    }
  }

  return false;
}
