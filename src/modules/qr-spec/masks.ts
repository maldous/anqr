/**
 * QR Mask Functions
 * THE canonical implementation of QR code mask patterns
 *
 * Both encoder and decoder should import from here
 */

import { QRMaskPattern } from './types';

/**
 * Get mask function for a mask pattern (0-7)
 * Per ISO/IEC 18004, the mask patterns are:
 *   0: (i + j) mod 2 == 0
 *   1: i mod 2 == 0
 *   2: j mod 3 == 0
 *   3: (i + j) mod 3 == 0
 *   4: (floor(i/2) + floor(j/3)) mod 2 == 0
 *   5: (i*j) mod 2 + (i*j) mod 3 == 0
 *   6: ((i*j) mod 2 + (i*j) mod 3) mod 2 == 0
 *   7: ((i*j) mod 3 + (i+j) mod 2) mod 2 == 0
 *
 * @param maskPattern Mask pattern number (0-7)
 * @returns Function that returns true if the module at (i, j) should be flipped
 */
export function getMaskFunction(maskPattern: number): (i: number, j: number) => boolean {
  switch (maskPattern) {
    case QRMaskPattern.PATTERN000:
    case 0:
      return (i, j) => (i + j) % 2 === 0;
    case QRMaskPattern.PATTERN001:
    case 1:
      return (i) => i % 2 === 0;
    case QRMaskPattern.PATTERN010:
    case 2:
      return (_i, j) => j % 3 === 0;
    case QRMaskPattern.PATTERN011:
    case 3:
      return (i, j) => (i + j) % 3 === 0;
    case QRMaskPattern.PATTERN100:
    case 4:
      return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case QRMaskPattern.PATTERN101:
    case 5:
      return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
    case QRMaskPattern.PATTERN110:
    case 6:
      return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case QRMaskPattern.PATTERN111:
    case 7:
      return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default:
      throw new Error(`Invalid mask pattern: ${maskPattern}`);
  }
}
