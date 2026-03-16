import { getAlignmentPatternCenters } from "../../../modules/qr-spec";

/**
 * Helper: Get alignment pattern positions for a given moduleCount
 * Uses getAlignmentPatternCenters from qr-encoder
 */

/**
 * Get alignment positions as {row, col} objects for a given module count
 * Wrapper that uses qr-spec's getAlignmentPositions internally
 */
export function getAlignmentPositionsFromModuleCount(
  moduleCount: number,
): Array<{ row: number; col: number }> {
  const version = Math.round((moduleCount - 17) / 4);
  return getAlignmentPatternCenters(version, moduleCount);
}
