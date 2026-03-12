import { ALIGNMENT_POSITIONS } from './constants';
import { alignmentOverlapsFinderRegion } from './alignment-overlaps-finder-region';

/**
 * Get alignment pattern center positions for a given version
 */
export function getAlignmentPatternCenters(
  version: number,
  moduleCount: number
): { row: number; col: number }[] {
  if (version < 2) return [];

  const positions = ALIGNMENT_POSITIONS[version - 1] || [];
  const centers: { row: number; col: number }[] = [];

  for (const row of positions) {
    for (const col of positions) {
      if (!alignmentOverlapsFinderRegion(row, col, moduleCount)) {
        centers.push({ row, col });
      }
    }
  }

  return centers;
}
