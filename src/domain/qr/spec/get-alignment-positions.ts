import { ALIGNMENT_POSITIONS } from './alignment-positions';

/**
 * Get alignment pattern positions for a version
 * @param version QR version (1-40)
 * @returns Array of alignment pattern center coordinates
 */
export function getAlignmentPositions(version: number): number[] {
  if (version < 1 || version > 40) return [];
  return ALIGNMENT_POSITIONS[version - 1] || [];
}
