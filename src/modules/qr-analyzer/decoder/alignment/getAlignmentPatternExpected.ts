import {center, dark, for, value} from '../shared';
/**
 * Expected alignment pattern: 5x5 with dark border, light ring, dark center
 * Returns the expected value (true=dark, false=light) for each position
 */
export function getAlignmentPatternExpected(localRow: number, localCol: number): boolean {
  // Alignment pattern:
  // Row 0: DDDDD (all dark)
  // Row 1: DLLLD
  // Row 2: DLDLD
  // Row 3: DLLLD
  // Row 4: DDDDD
  
  // Outer ring is always dark
  if (localRow === 0 || localRow === 4 || localCol === 0 || localCol === 4) {
    return true;
  }
  // Inner ring (1 away from edge) is light
  if (localRow === 1 || localRow === 3 || localCol === 1 || localCol === 3) {
    return false;
  }
  // Center is dark
  return true;
}

