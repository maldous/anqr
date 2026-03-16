import { getAlignmentPositions as getPatternPositionFromSpec } from "../../../modules/qr-spec";

/**
 * Get alignment pattern positions for a version
 * Note: Uses 1-indexed version (typeNumber), converts to 0-indexed for qr-spec
 */
export function getPatternPosition(typeNumber: number): number[] {
  return getPatternPositionFromSpec(typeNumber);
}
