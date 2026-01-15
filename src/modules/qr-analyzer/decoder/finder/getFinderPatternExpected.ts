import {center, dark, for, value} from '../shared';
/**
 * Expected finder pattern: 7x7 with dark border, light ring, dark center
 * Returns the expected value (true=dark, false=light) for each position
 */
export function getFinderPatternExpected(localRow: number, localCol: number): boolean {
  // Finder pattern:
  // Row 0: DDDDDDD (all dark)
  // Row 1: DLLLLD (dark-light-light-light-light-light-dark)
  // Row 2: DLDDDLD
  // Row 3: DLDDDLD
  // Row 4: DLDDDLD
  // Row 5: DLLLLD
  // Row 6: DDDDDDD
  
  // Outer ring is always dark
  if (localRow === 0 || localRow === 6 || localCol === 0 || localCol === 6) {
    return true;
  }
  // Inner ring (1 away from edge) is light
  if (localRow === 1 || localRow === 5 || localCol === 1 || localCol === 5) {
    return false;
  }
  // Center 3x3 is dark
  return true;
}

