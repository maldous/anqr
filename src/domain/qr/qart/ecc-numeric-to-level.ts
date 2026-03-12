import type { ECCLevel } from './bit-mapping';

/**
 * Map ECC numeric value (from format info) to ECCLevel character
 * Format info encoding: L=1, M=0, Q=3, H=2
 *
 * Exported for use in validation functions.
 */
export function eccNumericToLevel(eccNumeric: number): ECCLevel {
  switch (eccNumeric) {
    case 0:
      return 'M';
    case 1:
      return 'L';
    case 2:
      return 'H';
    case 3:
      return 'Q';
    default:
      return 'M';
  }
}
