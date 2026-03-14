import { ALIGNMENT_POSITIONS } from './alignment-positions.const';

export function getAlignmentPositionsForVersion(version: number): number[] {
  if (version < 1 || version > 40) {
    return [];
  }

  return ALIGNMENT_POSITIONS[version] || [];
}
