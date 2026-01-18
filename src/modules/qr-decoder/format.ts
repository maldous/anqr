/**
 * QR Format and Version Info Decoding
 * Reads format bits to get ECC level and mask pattern
 */

import type { FormatInfo, ECCLevelChar } from './types';
import { ECC_LEVEL_MAP } from './types';
import {
  getMaskFunction as getMaskFunctionFromSpec,
  getAlignmentPositions as getAlignmentPositionsFromSpec,
  isStructuralModule,
  getVersionFromModuleCount,
} from '../qr-spec';

// Shared logger
import { qrDecoderLog as log } from '../shared';

// Pre-computed valid format info patterns (15 bits after BCH encoding, XORed with mask 0x5412)
// Format: (ECC level << 3) | mask pattern, then BCH encoded, then XORed with 0x5412
const FORMAT_INFO_DECODE_TABLE: Map<number, FormatInfo> = new Map();

// Generate the decode table
function initFormatTable(): void {
  if (FORMAT_INFO_DECODE_TABLE.size > 0) return;

  // BCH(15,5) generator polynomial: x^10 + x^8 + x^5 + x^4 + x^2 + x + 1 = 0x537
  const G15 = 0x537;
  const G15_MASK = 0x5412;

  for (let eccLevel = 0; eccLevel < 4; eccLevel++) {
    for (let mask = 0; mask < 8; mask++) {
      const data = (eccLevel << 3) | mask;
      let bits = data << 10;

      // BCH division
      for (let i = 4; i >= 0; i--) {
        if (bits & (1 << (i + 10))) {
          bits ^= G15 << i;
        }
      }

      const encoded = ((data << 10) | bits) ^ G15_MASK;
      FORMAT_INFO_DECODE_TABLE.set(encoded, { eccLevel, maskPattern: mask });
    }
  }
}

/**
 * Count differing bits between two numbers
 */
function hammingDistance(a: number, b: number): number {
  let diff = a ^ b;
  let count = 0;
  while (diff) {
    count += diff & 1;
    diff >>>= 1;
  }
  return count;
}

/**
 * Read format info from the matrix
 * Format info is stored in two locations for redundancy
 */
export function readFormatInfo(matrix: boolean[][], moduleCount: number): FormatInfo | null {
  initFormatTable();

  // Read format info from around top-left finder pattern
  let bits1 = 0;
  // Bits 0-5: row 8, cols 0-5
  for (let col = 0; col <= 5; col++) {
    if (matrix[8]?.[col]) bits1 |= 1 << col;
  }
  // Bit 6: row 8, col 7
  if (matrix[8]?.[7]) bits1 |= 1 << 6;
  // Bit 7: row 8, col 8
  if (matrix[8]?.[8]) bits1 |= 1 << 7;
  // Bit 8: row 7, col 8
  if (matrix[7]?.[8]) bits1 |= 1 << 8;
  // Bits 9-14: rows 5-0, col 8
  for (let row = 5; row >= 0; row--) {
    if (matrix[row]?.[8]) bits1 |= 1 << (14 - row);
  }

  // Read format info from around top-right and bottom-left finder patterns
  let bits2 = 0;
  // Bits 0-7: row 8, columns moduleCount-8 to moduleCount-1 (left to right)
  for (let i = 0; i < 8; i++) {
    if (matrix[8]?.[moduleCount - 8 + i]) bits2 |= 1 << i;
  }
  // Bits 8-14: column 8, rows moduleCount-7 to moduleCount-1 (top to bottom)
  for (let i = 0; i < 7; i++) {
    if (matrix[moduleCount - 7 + i]?.[8]) bits2 |= 1 << (8 + i);
  }

  log('format', 'Read format bits', {
    bits1: bits1.toString(2).padStart(15, '0'),
    bits2: bits2.toString(2).padStart(15, '0')
  });

  // Try to find a match with error correction
  let bestMatch: FormatInfo | null = null;
  let bestDistance = 4; // Maximum correctable errors for BCH(15,5) is 3

  for (const [pattern, info] of FORMAT_INFO_DECODE_TABLE) {
    const d1 = hammingDistance(bits1, pattern);
    const d2 = hammingDistance(bits2, pattern);
    const minD = Math.min(d1, d2);

    if (minD < bestDistance) {
      bestDistance = minD;
      bestMatch = info;
    }
  }

  if (bestMatch) {
    const eccChar = ECC_LEVEL_MAP[bestMatch.eccLevel];
    log('format', 'Decoded format info', {
      eccLevel: bestMatch.eccLevel,
      eccChar,
      maskPattern: bestMatch.maskPattern,
      hammingDistance: bestDistance
    });
  } else {
    log('format', 'Failed to decode format info');
  }

  return bestMatch;
}

/**
 * Read version info from the matrix (for versions 7+)
 */
export function readVersionInfo(matrix: boolean[][], moduleCount: number): number | null {
  const version = (moduleCount - 17) / 4;

  // Version info only exists for version 7+
  if (version < 7) return version;

  // Read version info from bottom-left (6x3 block)
  let bits1 = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[moduleCount - 11 + j]?.[i]) {
        bits1 |= 1 << (i * 3 + j);
      }
    }
  }

  // Read version info from top-right (3x6 block)
  let bits2 = 0;
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 3; j++) {
      if (matrix[i]?.[moduleCount - 11 + j]) {
        bits2 |= 1 << (i * 3 + j);
      }
    }
  }

  // BCH(18,6) decoding with error correction
  // For simplicity, we'll check if the extracted version matches expected
  const extractedVersion1 = bits1 >> 12;
  const extractedVersion2 = bits2 >> 12;

  if (extractedVersion1 >= 7 && extractedVersion1 <= 40) {
    return extractedVersion1;
  }
  if (extractedVersion2 >= 7 && extractedVersion2 <= 40) {
    return extractedVersion2;
  }

  // Fall back to calculated version
  return version;
}

/**
 * Get ECC level character from format info
 */
export function getECCLevelChar(eccLevel: number): ECCLevelChar {
  return ECC_LEVEL_MAP[eccLevel] || 'M';
}

/**
 * Get mask function for a mask pattern
 * Re-exported from qr-spec for backward compatibility
 */
export const getMaskFunction = getMaskFunctionFromSpec;

/**
 * Unmask the data modules in the matrix
 */
export function unmaskMatrix(
  matrix: boolean[][],
  maskPattern: number,
  moduleCount: number
): boolean[][] {
  const maskFunc = getMaskFunction(maskPattern);
  const unmasked: boolean[][] = [];
  const version = getVersionFromModuleCount(moduleCount);

  for (let row = 0; row < moduleCount; row++) {
    const unmaskedRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      let value = matrix[row]?.[col] ?? false;

      // Only unmask data modules (not function patterns)
      if (!isStructuralModule(row, col, moduleCount, version)) {
        if (maskFunc(row, col)) {
          value = !value;
        }
      }

      unmaskedRow.push(value);
    }
    unmasked.push(unmaskedRow);
  }

  return unmasked;
}

// Use canonical source directly
const getAlignmentPositions = getAlignmentPositionsFromSpec;
