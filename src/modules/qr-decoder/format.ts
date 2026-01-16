/**
 * QR Format and Version Info Decoding
 * Reads format bits to get ECC level and mask pattern
 */

import type { FormatInfo, ECCLevelChar } from './types';
import { ECC_LEVEL_MAP } from './types';

// Logging helper
function log(category: string, message: string, data?: Record<string, unknown>): void {
  const prefix = `[QR-Decoder:${category}]`;
  if (data) {
    console.log(prefix, message, data);
  } else {
    console.log(prefix, message);
  }
}

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
  // Bits 0-7: col moduleCount-1 to moduleCount-8, row 8
  for (let i = 0; i < 8; i++) {
    if (matrix[8]?.[moduleCount - 1 - i]) bits2 |= 1 << i;
  }
  // Bits 8-14: row moduleCount-7 to moduleCount-1, col 8
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
 */
export function getMaskFunction(maskPattern: number): (row: number, col: number) => boolean {
  switch (maskPattern) {
    case 0: return (i, j) => (i + j) % 2 === 0;
    case 1: return (i) => i % 2 === 0;
    case 2: return (_, j) => j % 3 === 0;
    case 3: return (i, j) => (i + j) % 3 === 0;
    case 4: return (i, j) => (Math.floor(i / 2) + Math.floor(j / 3)) % 2 === 0;
    case 5: return (i, j) => ((i * j) % 2) + ((i * j) % 3) === 0;
    case 6: return (i, j) => (((i * j) % 2) + ((i * j) % 3)) % 2 === 0;
    case 7: return (i, j) => (((i * j) % 3) + ((i + j) % 2)) % 2 === 0;
    default: return () => false;
  }
}

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

  for (let row = 0; row < moduleCount; row++) {
    const unmaskedRow: boolean[] = [];
    for (let col = 0; col < moduleCount; col++) {
      let value = matrix[row]?.[col] ?? false;

      // Only unmask data modules (not function patterns)
      if (!isFunctionModule(row, col, moduleCount)) {
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

/**
 * Check if a module is a function pattern (finder, timing, alignment, format, version)
 */
function isFunctionModule(row: number, col: number, moduleCount: number): boolean {
  const version = (moduleCount - 17) / 4;

  // Finder patterns + separators
  if (row < 9 && col < 9) return true;
  if (row < 9 && col >= moduleCount - 8) return true;
  if (row >= moduleCount - 8 && col < 9) return true;

  // Timing patterns
  if (row === 6 || col === 6) return true;

  // Dark module
  if (row === moduleCount - 8 && col === 8) return true;

  // Version info (version 7+)
  if (version >= 7) {
    if (row < 6 && col >= moduleCount - 11 && col < moduleCount - 8) return true;
    if (col < 6 && row >= moduleCount - 11 && row < moduleCount - 8) return true;
  }

  // Alignment patterns (version 2+)
  if (version >= 2) {
    const positions = getAlignmentPositions(version);
    for (const py of positions) {
      for (const px of positions) {
        // Skip positions that overlap with finder patterns
        if (py < 9 && px < 9) continue;
        if (py < 9 && px >= moduleCount - 9) continue;
        if (py >= moduleCount - 9 && px < 9) continue;

        if (Math.abs(row - py) <= 2 && Math.abs(col - px) <= 2) {
          return true;
        }
      }
    }
  }

  return false;
}

// Alignment pattern positions per version
const ALIGNMENT_POSITIONS: number[][] = [
  [], // Version 1 has no alignment patterns
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

function getAlignmentPositions(version: number): number[] {
  if (version < 2 || version > 40) return [];
  return ALIGNMENT_POSITIONS[version - 1] || [];
}
