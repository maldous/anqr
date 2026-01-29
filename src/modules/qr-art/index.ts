/**
 * QArt Module - Artistic QR Code Generation
 *
 * Based on the QArt algorithm by Russ Cox (https://research.swtch.com/qart)
 * Repository: https://github.com/rsc/qr/tree/master/qart
 *
 * The QArt technique creates QR codes with embedded images by exploiting
 * Reed-Solomon error correction properties:
 *
 * 1. Reed-Solomon codes are systematic and linear over a finite field
 * 2. Valid RS blocks are closed under XOR: b1 ⊕ b2 is valid if both b1, b2 are valid
 * 3. By constructing a basis of RS blocks, we can control individual pixels
 * 4. Gauss-Jordan elimination trades control between data and ECC pixels
 *
 * This module provides:
 * - Types for QArt configuration
 * - Pixel mapping between QR modules and image pixels
 * - Reed-Solomon basis block generation (future)
 * - Linear algebra utilities for pixel control (future)
 */

import type { ECCLevel } from '../qr-encoder';

// ============================================
// TYPES
// ============================================

/**
 * Configuration for QArt generation
 */
export interface QArtConfig {
  /** The URL or text to encode (typically a URL with numeric fragment) */
  data: string;
  /** Target QR version (1-40) */
  version: number;
  /** Error correction level (L recommended for max visual control) */
  ecc: ECCLevel;
  /** Mask pattern (0-7), chosen to optimize visual appearance */
  maskPattern: number;
  /** Target image to embed */
  image: ImageData;
  /** Rotation of QR code (0, 90, 180, 270 degrees) */
  rotation?: 0 | 90 | 180 | 270;
  /** Whether to dither the image */
  dither?: boolean;
  /** Contrast threshold for pixel importance */
  contrastThreshold?: number;
}

/**
 * A pixel in the QR code with its controllability status
 */
export interface QArtPixel {
  /** Row position (0-indexed) */
  row: number;
  /** Column position (0-indexed) */
  col: number;
  /** Whether this pixel is part of structural patterns (finder, timing, etc.) */
  isStructural: boolean;
  /** Whether this pixel is data (vs error correction) */
  isData: boolean;
  /** Bit index in the data stream (-1 if structural) */
  bitIndex: number;
  /** Whether we can control this pixel (after Gauss-Jordan elimination) */
  controllable: boolean;
  /** Target value from the image (true = dark, false = light) */
  targetValue: boolean;
  /** Importance weight based on image contrast */
  importance: number;
}

/**
 * A Reed-Solomon basis block
 * Each basis block controls one bit and its corresponding ECC bits
 */
export interface RSBasisBlock {
  /** Index of the data bit this block controls */
  dataBitIndex: number;
  /** The complete block data (data + ECC bytes) */
  blockData: Uint8Array;
  /** Bit positions in the QR code that this block affects */
  affectedPixels: number[];
}

/**
 * Result of QArt generation
 */
export interface QArtResult {
  /** Whether generation was successful */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The generated QR code matrix */
  matrix?: boolean[][];
  /** Number of pixels that match the target image */
  matchingPixels: number;
  /** Total controllable pixels */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
  /** The modified data string (with optimized numeric fragment) */
  modifiedData?: string;
  /** Segments used for encoding */
  segments?: Array<{ data: string; mode: string }>;
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Galois Field GF(2^8) with primitive polynomial x^8 + x^4 + x^3 + x^2 + 1 (0x11D)
 * Used for Reed-Solomon encoding
 */
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

// Initialize Galois field tables
(function initGF() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_EXP[i + 255] = x;
    GF_LOG[x] = i;
    x = x << 1;
    if (x & 0x100) {
      x ^= 0x11d;
    }
  }
  GF_LOG[0] = 255; // undefined, but set to max for safety
})();

// ============================================
// GALOIS FIELD ARITHMETIC
// ============================================

/**
 * Multiply two numbers in GF(2^8)
 */
export function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

/**
 * Add two numbers in GF(2^8) (same as XOR)
 */
export function gfAdd(a: number, b: number): number {
  return a ^ b;
}

/**
 * Compute the inverse of a number in GF(2^8)
 */
export function gfInv(a: number): number {
  if (a === 0) throw new Error('Cannot invert 0 in GF');
  return GF_EXP[255 - GF_LOG[a]];
}

// ============================================
// PIXEL MAPPING UTILITIES
// ============================================

/**
 * Get the module count for a QR version
 */
export function getModuleCount(version: number): number {
  return version * 4 + 17;
}

/**
 * Check if a position is part of a finder pattern
 */
export function isFinderPattern(row: number, col: number, moduleCount: number): boolean {
  // Top-left finder
  if (row < 9 && col < 9) return true;
  // Top-right finder
  if (row < 9 && col >= moduleCount - 8) return true;
  // Bottom-left finder
  if (row >= moduleCount - 8 && col < 9) return true;
  return false;
}

/**
 * Check if a position is part of timing patterns
 */
export function isTimingPattern(row: number, col: number): boolean {
  return row === 6 || col === 6;
}

/**
 * Check if a position is part of an alignment pattern
 */
export function isAlignmentPattern(
  row: number,
  col: number,
  alignmentPositions: number[]
): boolean {
  for (const r of alignmentPositions) {
    for (const c of alignmentPositions) {
      // Skip if overlaps with finder patterns
      if (
        (r < 9 && c < 9) ||
        (r < 9 && c > alignmentPositions[alignmentPositions.length - 1] - 9)
      ) {
        continue;
      }
      if (row >= r - 2 && row <= r + 2 && col >= c - 2 && col <= c + 2) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Map an image to target pixel values for QArt generation
 */
export function mapImageToTargets(
  image: ImageData,
  moduleCount: number,
  threshold: number = 128
): { targets: boolean[][]; importance: number[][] } {
  const targets: boolean[][] = [];
  const importance: number[][] = [];

  const scaleX = image.width / moduleCount;
  const scaleY = image.height / moduleCount;

  for (let row = 0; row < moduleCount; row++) {
    targets[row] = [];
    importance[row] = [];

    for (let col = 0; col < moduleCount; col++) {
      // Sample the center of each module
      const imgX = Math.floor((col + 0.5) * scaleX);
      const imgY = Math.floor((row + 0.5) * scaleY);
      const idx = (imgY * image.width + imgX) * 4;

      // Convert to grayscale
      const gray = (image.data[idx] + image.data[idx + 1] + image.data[idx + 2]) / 3;

      // Target is dark if gray is below threshold
      targets[row][col] = gray < threshold;

      // Importance based on how far from threshold (higher contrast = more important)
      importance[row][col] = Math.abs(gray - threshold) / 128;
    }
  }

  return { targets, importance };
}

// ============================================
// QART URL GENERATION
// ============================================

/**
 * Generate a QArt-compatible URL with numeric fragment
 * The numeric fragment can be manipulated to control pixel patterns
 *
 * @param baseUrl The base URL (e.g., "http://example.com/page")
 * @param numericLength Length of the numeric fragment to generate
 * @param seed Optional seed for deterministic generation
 */
export function generateQArtUrl(
  baseUrl: string,
  numericLength: number = 200,
  seed?: number
): string {
  // Simple pseudo-random number generator with seed
  let rng = seed ?? Date.now();
  const random = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  // Generate random numeric string
  let numeric = '';
  for (let i = 0; i < numericLength; i++) {
    numeric += Math.floor(random() * 10).toString();
  }

  return `${baseUrl}#${numeric}`;
}

/**
 * Calculate the bit efficiency of using a numeric fragment
 * vs byte mode for the entire URL
 *
 * @param url The URL to analyze
 */
export function analyzeUrlEfficiency(url: string): {
  byteModeBits: number;
  mixedModeBits: number;
  savings: number;
  savingsPercent: number;
} {
  // Find the numeric fragment
  const hashIndex = url.indexOf('#');
  const numericFragment = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const isAllNumeric = /^\d+$/.test(numericFragment);

  // Byte mode: 8 bits per character
  const byteModeBits = url.length * 8 + 4 + 16; // +4 mode, +16 length (v10+)

  // Mixed mode
  let mixedModeBits = 0;
  if (hashIndex >= 0 && isAllNumeric && numericFragment.length >= 4) {
    // Byte segment for URL prefix
    const prefixLen = hashIndex + 1; // Include the #
    mixedModeBits += 4 + 16 + prefixLen * 8; // mode + length + data

    // Numeric segment for fragment
    const numLen = numericFragment.length;
    const numBits = Math.floor(numLen / 3) * 10 + (numLen % 3 === 2 ? 7 : numLen % 3 === 1 ? 4 : 0);
    mixedModeBits += 4 + 14 + numBits; // mode + length + data
  } else {
    mixedModeBits = byteModeBits;
  }

  const savings = byteModeBits - mixedModeBits;
  const savingsPercent = (savings / byteModeBits) * 100;

  return { byteModeBits, mixedModeBits, savings, savingsPercent };
}

// ============================================
// FUTURE: FULL QART ALGORITHM
// ============================================

/**
 * Build Reed-Solomon basis blocks for a given version and ECC level
 *
 * TODO: Implement full RS basis generation
 * - For each data bit position, create a block with that bit set to 1
 * - Compute the corresponding ECC bytes
 * - Store the complete block for later XOR operations
 */
export function buildRSBasis(_version: number, _ecc: ECCLevel): RSBasisBlock[] {
  // Placeholder - full implementation requires:
  // 1. Get RS block structure for version/ECC
  // 2. For each data bit, create basis block
  // 3. Compute ECC using polynomial division
  console.warn('[QArt] buildRSBasis not yet implemented');
  return [];
}

/**
 * Apply Gauss-Jordan elimination to trade pixel control
 *
 * TODO: Implement Gauss-Jordan elimination
 * - Build matrix where rows are basis blocks, columns are pixels
 * - Prioritize pixels by importance (from image)
 * - Eliminate to isolate control over important pixels
 */
export function gaussJordanEliminate(
  _basis: RSBasisBlock[],
  _pixelImportance: number[]
): RSBasisBlock[] {
  // Placeholder - full implementation requires:
  // 1. Convert basis blocks to binary matrix
  // 2. Sort columns by pixel importance
  // 3. Perform row reduction
  // 4. Return modified basis
  console.warn('[QArt] gaussJordanEliminate not yet implemented');
  return [];
}

/**
 * Generate a QArt code from configuration
 *
 * TODO: Implement full QArt generation
 */
export function generateQArt(_config: QArtConfig): QArtResult {
  console.warn('[QArt] Full QArt generation not yet implemented');
  return {
    success: false,
    error:
      'QArt generation not yet implemented. Use mixed mode encoding for basic QArt URL support.',
    matchingPixels: 0,
    totalControllable: 0,
    matchPercentage: 0,
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  // Types are exported above

  // Galois field operations
  gfMul,
  gfAdd,
  gfInv,

  // Pixel mapping
  getModuleCount,
  isFinderPattern,
  isTimingPattern,
  isAlignmentPattern,
  mapImageToTargets,

  // URL utilities
  generateQArtUrl,
  analyzeUrlEfficiency,

  // Future full implementation
  buildRSBasis,
  gaussJordanEliminate,
  generateQArt,
};
