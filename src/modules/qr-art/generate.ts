/**
 * QR-Art Full Generation
 *
 * This module ties together all the components to generate QR codes
 * with embedded artwork using the full RS basis manipulation algorithm.
 *
 * The process:
 * 1. Encode the base URL/data to get initial QR matrix
 * 2. Build RS basis for the version/ECC combination
 * 3. Map bits to pixels using the zigzag traversal
 * 4. Perform Gauss-Jordan elimination prioritizing important pixels
 * 5. Select which basis vectors to apply to match target image
 * 6. Generate final QR code with modified data
 */

import { createLogger } from '../../lib/logger';
import { decodeQR } from '../qr-decoder';
import { qrcode } from '../qr-encoder';
import { qrBitBuffer } from '../qr-encoder/bit-buffer';
import { qr8BitByte } from '../qr-encoder/data-modes';
import { getRSBlocks } from '../qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel } from '../qr-encoder/types';
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getLengthInBits,
  getPatternPosition,
} from '../qr-encoder/utils';
import { getMaskFunction } from '../qr-spec/masks';
import {
  buildBitPixelMap,
  type ECCLevel,
  getDataPixelIndices,
  getRSBlockInfo,
} from './bit-mapping';
import {
  applyAllSelectedVectors,
  countMatchingPixels,
  gaussJordanEliminate,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
} from './elimination';
import { mapImageToTargetsSupersampled } from './image-utils';
import {
  binarySearchMaxVectors,
  flattenAndOrderSelections,
} from './scan-fallback';
import {
  buildFullBasis,
  calculateOptimalVersionAndSuffix,
  clearBasisCache,
  computeECC,
  generateDeterministicSuffix,
  hashStringToSeed,
  MAX_SUFFIX_LENGTH,
} from './rs-basis';
import {
  type BitRange,
  calculateVersionForSlack,
  mapAllowedRangesToBlocks,
} from './semantic-layout';

/**
 * Helper to compare two Uint8Arrays
 */
function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Convert a string to a Uint8Array of its bytes
 */
function stringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

/**
 * Convert bytes to hex string for debugging
 */
function toHex(bytes: Uint8Array, maxBytes: number = 32): string {
  const slice = bytes.slice(0, maxBytes);
  const hex = Array.from(slice).map(b => b.toString(16).padStart(2, '0')).join(' ');
  return bytes.length > maxBytes ? hex + '...' : hex;
}

/**
 * Find the first byte index where two strings differ (in the protected region)
 */
function findFirstMismatch(
  expected: string,
  actual: string,
  protectedLength: number
): { index: number; expected: number; actual: number } | null {
  const len = Math.min(protectedLength, expected.length, actual.length);
  for (let i = 0; i < len; i++) {
    if (expected.charCodeAt(i) !== actual.charCodeAt(i)) {
      return {
        index: i,
        expected: expected.charCodeAt(i),
        actual: actual.charCodeAt(i),
      };
    }
  }
  // Check if lengths differ in protected region
  if (actual.length < protectedLength) {
    return {
      index: actual.length,
      expected: expected.charCodeAt(actual.length) || 0,
      actual: -1, // Missing byte
    };
  }
  return null;
}

/**
 * Validate that decoded data preserves the original data exactly (byte-level comparison).
 * This is the STRICT acceptance criteria for HYBRID QR-Art.
 * 
 * Requirements:
 * 1. Decoded data must exist
 * 2. Decoded data length >= original data length
 * 3. First N bytes must match exactly (N = original data length)
 * 
 * @param decoded The decoded string from scanning
 * @param originalData The original data that must be preserved
 * @returns Validation result with details
 */
function validateOriginalDataPreserved(
  decoded: string | undefined,
  originalData: string
): {
  valid: boolean;
  reason?: string;
  mismatch?: {
    index: number;
    expectedByte: number;
    actualByte: number;
    expectedChar: string;
    actualChar: string;
  };
} {
  if (decoded === undefined || decoded === null) {
    return { valid: false, reason: 'decoded data is null/undefined' };
  }
  
  if (decoded.length < originalData.length) {
    return { 
      valid: false, 
      reason: `decoded length (${decoded.length}) < original length (${originalData.length})` 
    };
  }
  
  // Byte-exact comparison for the protected prefix
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.charCodeAt(i);
    const actualByte = decoded.charCodeAt(i);
    
    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: `byte mismatch at index ${i}`,
        mismatch: {
          index: i,
          expectedByte,
          actualByte,
          expectedChar: String.fromCharCode(expectedByte),
          actualChar: String.fromCharCode(actualByte),
        },
      };
    }
  }
  
  return { valid: true };
}

/**
 * Calculate ECC damage estimate for a block.
 * Returns the number of data codewords changed and safe limit.
 */
function calculateECCDamage(
  originalData: Uint8Array,
  modifiedData: Uint8Array,
  eccCount: number
): { changedCodewords: number; safeLimit: number; isOverBudget: boolean } {
  let changedCodewords = 0;
  for (let i = 0; i < originalData.length; i++) {
    if (originalData[i] !== modifiedData[i]) {
      changedCodewords++;
    }
  }
  // RS can correct up to floor(eccCount/2) errors
  // We use eccCount/2 - 2 as safe limit for margin
  const safeLimit = Math.floor(eccCount / 2) - 2;
  return {
    changedCodewords,
    safeLimit: Math.max(0, safeLimit),
    isOverBudget: changedCodewords > safeLimit,
  };
}

const log = createLogger('QART');

/**
 * Encoder-derived semantic layout - these are the ACTUAL bit positions
 * from the encoder's bit buffer, NOT calculated from data.length.
 * 
 * This is critical because the actual encoder may:
 * - Use different segment modes
 * - Place terminators differently
 * - Have different interleaving patterns
 * 
 * We MUST derive protection boundaries from what the encoder actually did.
 * 
 * HYBRID STRATEGY: We track BOTH original data and suffix separately:
 * - Original data (URL) is PROTECTED - cannot be modified
 * - Suffix (after #) is CONTROLLABLE - can be freely modified
 * - Padding codewords are also CONTROLLABLE
 */
export interface EncoderDerivedLayout {
  /** Bits after writing mode indicator (should be 4) */
  bitsAfterMode: number;
  /** Bits after writing character count */
  bitsAfterCharCount: number;
  /** Bits after writing ORIGINAL data only (before suffix) - THIS IS THE PROTECTION BOUNDARY */
  bitsAfterOriginalData: number;
  /** Bits after writing all segment data including suffix (before terminator) */
  bitsAfterData: number;
  /** Bits after adding terminator (0-4 bits) */
  bitsAfterTerminator: number;
  /** Bits after padding to byte boundary */
  bitsAfterPadToByte: number;
  /** Byte index where padding codewords (0xEC 0x11) start */
  paddingStartByte: number;
  /** Total data bytes capacity */
  totalDataBytes: number;
  /** Number of padding codeword bytes */
  paddingByteCount: number;
  /** Length of original data (without suffix) */
  originalDataLength: number;
  /** Length of suffix (0 if no suffix) */
  suffixLength: number;
  /** Protected bit range (mode + charCount + original data bytes only) */
  protectedBitEnd: number;
  /** Allowed/controllable bit range start (suffix bytes + padding codewords) */
  allowedBitStart: number;
  /** Allowed/controllable bit range end */
  allowedBitEnd: number;
  /** Number of controllable suffix bits (8 * suffixLength) */
  suffixBits: number;
  /** Number of controllable padding bits */
  paddingBits: number;
}

/**
 * Extract format info bits from a QR matrix
 * Format info is stored in two places for redundancy
 */
function extractFormatInfo(matrix: boolean[][]): {
  vertical: number;
  horizontal: number;
  match: boolean;
} {
  const moduleCount = matrix.length;
  let vertical = 0;
  let horizontal = 0;

  // Extract vertical format info (left side of top-left finder)
  for (let i = 0; i < 15; i++) {
    let row: number;
    if (i < 6) {
      row = i;
    } else if (i < 8) {
      row = i + 1;
    } else {
      row = moduleCount - 15 + i;
    }
    if (matrix[row]?.[8]) {
      vertical |= 1 << i;
    }
  }

  // Extract horizontal format info (top of top-left finder)
  for (let i = 0; i < 15; i++) {
    let col: number;
    if (i < 8) {
      col = moduleCount - i - 1;
    } else if (i < 9) {
      col = 15 - i - 1 + 1;
    } else {
      col = 15 - i - 1;
    }
    if (matrix[8]?.[col]) {
      horizontal |= 1 << i;
    }
  }

  return {
    vertical,
    horizontal,
    match: vertical === horizontal,
  };
}

/**
 * Extract the actual mask pattern from a QR matrix by reading the format info bits.
 * 
 * This is CRITICAL for auto-mask mode: when maskPattern=-1, the encoder's
 * getBestMaskPattern() chooses the optimal mask internally, but doesn't expose
 * which mask it chose. We must extract it from the generated matrix's format info.
 * 
 * Format info structure (15 bits total):
 * - Bits 0-2: Mask pattern (0-7)
 * - Bits 3-4: ECC level (L=1, M=0, Q=3, H=2)
 * - Bits 5-14: BCH error correction
 * 
 * The format info is XORed with 0x5412 before placement to ensure
 * the pattern is never all-zeros (which would be hard to detect).
 * 
 * @param matrix The QR matrix to extract mask from
 * @returns Object with extracted mask, ECC, and validation info
 */
function extractMaskFromMatrix(matrix: boolean[][]): {
  mask: number;
  eccLevel: number;
  isValid: boolean;
  formatInfoMatch: boolean;
  rawVertical: number;
  rawHorizontal: number;
} {
  // The format info XOR mask (10101000010010 in binary)
  const FORMAT_INFO_MASK = 0x5412;
  
  // Extract both copies of format info
  const formatInfo = extractFormatInfo(matrix);
  
  // XOR with mask to get actual data
  const verticalData = formatInfo.vertical ^ FORMAT_INFO_MASK;
  const horizontalData = formatInfo.horizontal ^ FORMAT_INFO_MASK;
  
  // Extract mask pattern (bits 0-2) and ECC level (bits 3-4)
  const verticalMask = verticalData & 0x07;  // Lower 3 bits
  const verticalEcc = (verticalData >> 3) & 0x03;  // Next 2 bits
  
  const horizontalMask = horizontalData & 0x07;
  const horizontalEcc = (horizontalData >> 3) & 0x03;
  
  // Prefer vertical, but validate against horizontal
  const mask = verticalMask;
  const eccLevel = verticalEcc;
  
  // Check if both copies agree (they should in a valid QR)
  const isValid = verticalMask === horizontalMask && verticalEcc === horizontalEcc;
  
  if (!isValid) {
    log.warn('Format info copies disagree!', {
      verticalMask,
      horizontalMask,
      verticalEcc,
      horizontalEcc,
      rawVertical: formatInfo.vertical.toString(2).padStart(15, '0'),
      rawHorizontal: formatInfo.horizontal.toString(2).padStart(15, '0'),
    });
  }
  
  return {
    mask,
    eccLevel,
    isValid,
    formatInfoMatch: formatInfo.match,
    rawVertical: formatInfo.vertical,
    rawHorizontal: formatInfo.horizontal,
  };
}

/**
 * Validate timing patterns are intact (alternating modules on row 6 and col 6)
 */
function validateTimingPatterns(matrix: boolean[][]): {
  horizontal: boolean;
  vertical: boolean;
  allValid: boolean;
  errors: string[];
} {
  const moduleCount = matrix.length;
  const errors: string[] = [];
  let horizontalOk = true;
  let verticalOk = true;

  // Check horizontal timing (row 6, columns 8 to moduleCount-9)
  for (let col = 8; col < moduleCount - 8; col++) {
    const expected = col % 2 === 0; // Even columns are dark
    const actual = matrix[6]?.[col] ?? false;
    if (actual !== expected) {
      horizontalOk = false;
      errors.push(`Horizontal timing at col ${col}: expected ${expected}, got ${actual}`);
    }
  }

  // Check vertical timing (col 6, rows 8 to moduleCount-9)
  for (let row = 8; row < moduleCount - 8; row++) {
    const expected = row % 2 === 0; // Even rows are dark
    const actual = matrix[row]?.[6] ?? false;
    if (actual !== expected) {
      verticalOk = false;
      errors.push(`Vertical timing at row ${row}: expected ${expected}, got ${actual}`);
    }
  }

  return {
    horizontal: horizontalOk,
    vertical: verticalOk,
    allValid: horizontalOk && verticalOk,
    errors: errors.slice(0, 10),
  };
}

/**
 * Validate finder patterns are intact
 */
function validateFinderPatterns(matrix: boolean[][]): {
  topLeft: boolean;
  topRight: boolean;
  bottomLeft: boolean;
  allValid: boolean;
  errors: string[];
} {
  const moduleCount = matrix.length;
  const errors: string[] = [];

  // Expected finder pattern (7x7)
  const expected = [
    [true, true, true, true, true, true, true],
    [true, false, false, false, false, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, true, true, true, false, true],
    [true, false, false, false, false, false, true],
    [true, true, true, true, true, true, true],
  ];

  const checkFinder = (startRow: number, startCol: number, name: string): boolean => {
    let valid = true;
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const actual = matrix[startRow + r]?.[startCol + c] ?? false;
        if (actual !== expected[r][c]) {
          valid = false;
          errors.push(`${name} mismatch at (${r},${c}): expected ${expected[r][c]}, got ${actual}`);
        }
      }
    }
    return valid;
  };

  const topLeft = checkFinder(0, 0, 'TopLeft');
  const topRight = checkFinder(0, moduleCount - 7, 'TopRight');
  const bottomLeft = checkFinder(moduleCount - 7, 0, 'BottomLeft');

  return {
    topLeft,
    topRight,
    bottomLeft,
    allValid: topLeft && topRight && bottomLeft,
    errors: errors.slice(0, 10), // Limit to first 10 errors
  };
}

/**
 * Result of scanning a QR matrix
 */
interface ScanResult {
  /** Whether the scan succeeded and produced valid data */
  success: boolean;
  /** The decoded data (if successful) */
  data?: string;
  /** Error message (if failed) */
  error?: string;
  /** Number of scan attempts made */
  attempts?: number;
  /** Whether the decoder reported fully valid structure (no truncated segments) */
  structurallyValid?: boolean;
}

/**
 * Scan a boolean matrix using jsQR to verify it's a valid, scannable QR code.
 * Returns the decoded data if successful, or an error message if not.
 * Tries multiple scale factors and decoder settings for robustness.
 * 
 * IMPORTANT: A successful scan means:
 * - The decoder found and decoded the QR code
 * - The data was extracted
 * 
 * This does NOT guarantee the data is correct - caller must verify content!
 */
function scanMatrixWithJsQR(matrix: boolean[][]): ScanResult {
  const moduleCount = matrix.length;
  if (moduleCount === 0) {
    return { success: false, error: 'Empty matrix' };
  }

  // Try multiple configurations for robustness
  const configs = [
    { scale: 4, quietZone: 4, invert: false },
    { scale: 8, quietZone: 8, invert: false },
    { scale: 2, quietZone: 4, invert: false },
    { scale: 4, quietZone: 4, invert: true },
  ];

  let lastError = '';
  let attempts = 0;

  for (const config of configs) {
    attempts++;
    const { scale, quietZone, invert } = config;
    const size = (moduleCount + quietZone * 2) * scale;

    // Create ImageData manually (white background)
    const data = new Uint8ClampedArray(size * size * 4);

    // Fill with white (or black if inverted)
    const bgColor = invert ? 0 : 255;
    const fgColor = invert ? 255 : 0;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = bgColor;
      data[i + 1] = bgColor;
      data[i + 2] = bgColor;
      data[i + 3] = 255;
    }

    // Draw the QR modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const isDark = matrix[row]?.[col] ?? false;
        if (isDark) {
          const startX = (col + quietZone) * scale;
          const startY = (row + quietZone) * scale;

          for (let py = 0; py < scale; py++) {
            for (let px = 0; px < scale; px++) {
              const idx = ((startY + py) * size + (startX + px)) * 4;
              data[idx] = fgColor;
              data[idx + 1] = fgColor;
              data[idx + 2] = fgColor;
            }
          }
        }
      }
    }

    try {
      const imageData = new ImageData(data, size, size);
      const result = decodeQR(imageData, {
        inversionAttempts: 'attemptBoth',
      });

      if (result) {
        return { success: true, data: result.data, attempts };
      }
      lastError = `Config ${attempts}: Decoder returned null`;
    } catch (err) {
      lastError = `Config ${attempts}: ${err instanceof Error ? err.message : String(err)}`;
    }
  }

  return {
    success: false,
    error: `All ${attempts} scan attempts failed. Last: ${lastError}`,
    attempts,
  };
}

// EncoderDerivedLayout is already exported via its interface declaration above

/**
 * Configuration for full QR-Art generation
 * 
 * HYBRID STRATEGY: Original data is protected, suffix + padding are controllable.
 * 
 * The algorithm adds a URL fragment suffix (#xxxxxx...) that:
 * - Does NOT affect the URL destination (fragments are client-side only)
 * - Provides many more controllable bits for better image quality
 * - Can be freely modified without corrupting the message
 * 
 * Protection boundaries:
 * - PROTECTED: mode indicator + character count + original data bytes
 * - CONTROLLABLE: suffix bytes + padding codewords
 * 
 * This ensures the BASE URL is always preserved, while maximizing QR-Art control.
 */
export interface FullQArtConfig {
  /** The data to encode (URL or text) - the original content that will be protected */
  data: string;
  /** Target image as ImageData, HTMLCanvasElement, or OffscreenCanvas */
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  /** QR version (1-40), 0 for auto with slack calculation */
  version: number;
  /** Error correction level */
  ecc: ECCLevel;
  /** Mask pattern (0-7), -1 for auto */
  maskPattern: number;
  /** Progress callback */
  onProgress?: (stage: string, percent: number) => void;
  /**
   * Optional suffix to append to the data.
   * This suffix CAN be freely modified by QR-Art without affecting
   * the original content. 
   * 
   * If not provided and autoSuffix is true (default), a `#xxx...` fragment
   * identifier suffix will be auto-generated to fill QR capacity.
   * Fragment identifiers are client-side only, so URLs still work correctly.
   * 
   * The suffix bits become controllable for image embedding.
   * Longer suffixes = more controllable pixels = better image quality.
   */
  suffix?: string;
  /**
   * Whether to auto-generate a suffix when none is provided (default: true).
   * 
   * When true: Automatically adds `#xxx...` fragment suffix to fill QR capacity.
   * When false: Only padding bits are controllable (very limited).
   * 
   * The auto-generated suffix uses URL fragment identifier (`#`) which:
   * - Never gets sent to the server (client-side only)
   * - Doesn't affect URL redirects or destination
   * - Maximizes controllable bits for better image quality
   */
  autoSuffix?: boolean;
  /**
   * Minimum number of padding codewords required for QR-Art manipulation.
   * A larger version will be selected if needed to achieve this many padding bytes.
   * Default: 10 (lower than before since suffix provides most control)
   * 
   * More padding = more controllable pixels = better image quality.
   * Set to 0 to use the minimum version that fits the data.
   */
  minPadCodewords?: number;
  /**
   * Force a specific QR version regardless of data size.
   * Overrides minPadCodewords calculation.
   * Useful for consistent sizing or when you know the exact version needed.
   */
  forceVersion?: number;
  /**
   * Target control percentage for auto-suffix generation (default: 50).
   * A larger QR version may be selected to achieve this control level.
   * Higher values = more controllable pixels = better image quality.
   */
  targetControlPercent?: number;
}

/**
 * Result of full QR-Art generation
 */
export interface FullQArtResult {
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** The final QR matrix (true = dark) */
  matrix: boolean[][];
  /** Module count (size of matrix) */
  moduleCount: number;
  /** Actual version used */
  version: number;
  /** Actual mask pattern used */
  maskPattern: number;
  /** Number of pixels matching target */
  matchingPixels: number;
  /** Total controllable pixels */
  totalControllable: number;
  /** Match percentage */
  matchPercentage: number;
  /** The full data that was encoded (original + suffix) */
  encodedData: string;
  /** The original data (URL/text) that was protected */
  originalData?: string;
  /** The suffix that was added (if any) */
  suffix?: string;
}

/**
 * Convert a boolean matrix to a QR-like object with isDark method
 */
export function matrixToQRLike(matrix: boolean[][]): {
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
} {
  const moduleCount = matrix.length;
  return {
    isDark: (row: number, col: number) => {
      if (row < 0 || row >= moduleCount || col < 0 || col >= moduleCount) {
        return false;
      }
      return matrix[row]?.[col] ?? false;
    },
    getModuleCount: () => moduleCount,
  };
}

/**
 * Result of base QR generation with data extraction
 */
interface BaseQRResult {
  matrix: boolean[][];
  actualVersion: number;
  actualMask: number;
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  /** Encoder-derived semantic layout with ACTUAL bit positions */
  encoderLayout: EncoderDerivedLayout;
}

/**
 * Map ECC numeric value (from format info) to ECCLevel character
 * Format info encoding: L=1, M=0, Q=3, H=2
 */
function eccNumericToLevel(eccNumeric: number): ECCLevel {
  switch (eccNumeric) {
    case 0: return 'M';
    case 1: return 'L';
    case 2: return 'H';
    case 3: return 'Q';
    default: return 'M';
  }
}

/**
 * Generate a QR matrix from the encoder and extract per-block data
 *
 * IMPORTANT: We use regenerateQRFromModifiedData to create the base matrix
 * instead of extracting from qrcode().make(). This ensures the base matrix
 * and final matrix are generated by the SAME code path, making predictions
 * match actual results exactly.
 * 
 * CRITICAL FIX: When maskPattern=-1 (auto), we must extract the ACTUAL mask
 * that the encoder chose from the format info bits. Previously the code
 * incorrectly assumed mask 0, causing matrix mismatches.
 * 
 * HYBRID MODE: The originalDataLength parameter tells us where the original
 * data ends and the suffix begins. This is critical for protection boundaries.
 */
function generateBaseQR(
  data: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number,
  originalDataLength: number  // Length of original data (without suffix)
): BaseQRResult {
  // Log the exact data being encoded for debugging
  log.debug('generateBaseQR called', {
    dataLength: data.length,
    dataPreview: data.length > 80 ? data.slice(0, 80) + '...' : data,
    dataHash: data.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16),
    version,
    ecc,
    maskPattern,
  });

  // First, use the encoder to determine the actual version if auto-detecting
  const qr = qrcode(version, ecc);
  qr.addData(data);
  const useMask = maskPattern >= 0 ? maskPattern : undefined;
  qr.make(useMask);

  const moduleCount = qr.getModuleCount();
  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);
  
  // CRITICAL: Extract the ACTUAL mask pattern from the encoder's matrix
  // When maskPattern=-1 (auto), the encoder picks the best mask internally
  // via getBestMaskPattern(), but doesn't expose which mask it chose.
  // We MUST extract it from the format info bits to use throughout the pipeline.
  let actualMask: number;
  if (maskPattern >= 0) {
    // User specified a mask, use it directly
    actualMask = maskPattern;
  } else {
    // Auto-mask mode: extract the actual mask the encoder chose
    // Build a temporary matrix from the encoder to read format info
    const tempMatrix: boolean[][] = [];
    for (let r = 0; r < moduleCount; r++) {
      tempMatrix[r] = [];
      for (let c = 0; c < moduleCount; c++) {
        tempMatrix[r][c] = qr.isDark(r, c);
      }
    }
    
    const extracted = extractMaskFromMatrix(tempMatrix);
    actualMask = extracted.mask;
    
    // Validate the extracted ECC matches what we requested
    const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);
    if (extractedEccLevel !== ecc) {
      log.warn('Extracted ECC level mismatch!', {
        requested: ecc,
        extracted: extractedEccLevel,
        extractedNumeric: extracted.eccLevel,
      });
    }
    
    log.info('Extracted actual mask from encoder (auto-mask mode)', {
      extractedMask: actualMask,
      extractedEcc: extractedEccLevel,
      formatInfoValid: extracted.isValid,
      formatInfoMatch: extracted.formatInfoMatch,
    });
  }

  // Get the actual encoded data bytes and compute ECC using the encoder's bit buffer
  // This is critical - we need the real data bytes AND their ECC for RS linearity
  // Also captures the ACTUAL semantic bit positions from the encoder
  // HYBRID MODE: Pass originalDataLength to track protection boundaries
  const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout } = encodeDataToBytes(
    data,
    actualVersion,
    ecc,
    originalDataLength
  );

  // DEBUG: Verify that computeECC produces the same ECC as the encoder
  for (let i = 0; i < blockDataArrays.length; i++) {
    const testEcc = computeECC(blockDataArrays[i], blockEccCounts[i]);
    const encoderEcc = blockEccArrays[i];
    if (!arraysEqual(testEcc, encoderEcc)) {
      log.error('ECC MISMATCH - computeECC differs from encoder!', {
        blockIndex: i,
        dataCount: blockDataCounts[i],
        eccCount: blockEccCounts[i],
        computeEccFirst5: Array.from(testEcc.slice(0, 5)),
        encoderEccFirst5: Array.from(encoderEcc.slice(0, 5)),
      });
    } else {
      log.debug('ECC verification passed for block', { blockIndex: i });
    }
  }

  // CRITICAL: Generate the base matrix using the SAME function that generates
  // the final matrix. This ensures prediction and actual match exactly.
  // Previously we extracted from qr.isDark() which uses a different code path.
  const matrix = regenerateQRFromModifiedData(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );

  // DEBUG: Compare regenerated matrix with encoder's matrix to find discrepancies
  const debugQr = qrcode(actualVersion, ecc);
  debugQr.addData(data);
  debugQr.make(actualMask);

  let mismatchCount = 0;
  const maxMismatches = 10;
  for (let r = 0; r < moduleCount; r++) {
    for (let c = 0; c < moduleCount; c++) {
      const regenValue = matrix[r][c];
      const encoderValue = debugQr.isDark(r, c);
      if (regenValue !== encoderValue) {
        if (mismatchCount < maxMismatches) {
          log.warn('Matrix mismatch detected', {
            row: r,
            col: c,
            regenerated: regenValue,
            encoder: encoderValue,
          });
        }
        mismatchCount++;
      }
    }
  }

  if (mismatchCount > 0) {
    log.error('Total matrix mismatches', {
      mismatchCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      mismatchPercent: `${((mismatchCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    });
  } else {
    log.info('Matrix validation passed - regenerated matrix matches encoder exactly');
  }

  return {
    matrix,
    actualVersion,
    actualMask,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    encoderLayout,
  };
}

/**
 * Convert ECC level character to numeric value for encoder functions
 */
function eccToNumericForEncoder(ecc: ECCLevel): number {
  switch (ecc) {
    case 'L':
      return QRErrorCorrectionLevel.L;
    case 'M':
      return QRErrorCorrectionLevel.M;
    case 'Q':
      return QRErrorCorrectionLevel.Q;
    case 'H':
      return QRErrorCorrectionLevel.H;
    default:
      return QRErrorCorrectionLevel.M;
  }
}

/**
 * Encode a string to data bytes using the QR encoder's bit buffer
 * This gives us the actual encoded bytes that would go into the QR code
 * Also computes and returns the ECC bytes for each block (needed for RS linearity)
 * 
 * CRITICAL: Also returns the EncoderDerivedLayout which captures the ACTUAL
 * bit positions from the encoder. This is essential for HYBRID protection
 * as it tells us exactly where the original data ends and suffix begins.
 * 
 * HYBRID STRATEGY:
 * - originalDataLength: length of the original URL/text (PROTECTED)
 * - suffixLength: length of the suffix (CONTROLLABLE)
 * - The full encoded data is: originalData + suffix
 * - Protection boundary is at: mode + charCount + originalData
 * - Controllable region is: suffix + padding
 */
function encodeDataToBytes(
  fullData: string,
  version: number,
  ecc: ECCLevel,
  originalDataLength: number  // Length of original data (without suffix)
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  encoderLayout: EncoderDerivedLayout;
} {
  // Calculate suffix length
  const suffixLength = fullData.length - originalDataLength;
  const suffix = suffixLength > 0 ? fullData.slice(originalDataLength) : '';
  
  // Log the exact data being encoded for debugging
  log.debug('encodeDataToBytes called (HYBRID mode)', {
    fullDataLength: fullData.length,
    originalDataLength,
    suffixLength,
    originalDataPreview: fullData.slice(0, Math.min(60, originalDataLength)) + (originalDataLength > 60 ? '...' : ''),
    suffixPreview: suffix.slice(0, 20) + (suffix.length > 20 ? '...' : ''),
    dataHash: fullData.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0).toString(16),
    version,
    ecc,
  });

  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);

  // Create bit buffer and encode the data
  const buffer = qrBitBuffer();
  const segment = qr8BitByte(fullData);  // Full data including suffix

  // CHECKPOINT 1: After mode indicator (4 bits)
  buffer.put(segment.getMode(), 4);
  const bitsAfterMode = buffer.getLengthInBits();
  
  // CHECKPOINT 2: After character count (for FULL data including suffix)
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  const bitsAfterCharCount = buffer.getLengthInBits();
  
  // CHECKPOINT 3: Where ORIGINAL data ends (PROTECTION BOUNDARY)
  // This is calculated, not measured, because segment.write() writes all at once
  const bitsAfterOriginalData = bitsAfterCharCount + (originalDataLength * 8);
  
  // Write the actual data (includes suffix)
  segment.write(buffer);
  
  // CHECKPOINT 4: After all segment data including suffix (BEFORE terminator)
  const bitsAfterData = buffer.getLengthInBits();

  // Calculate total data capacity
  let totalDataCount = 0;
  for (const block of rsBlocks) {
    totalDataCount += block.dataCount;
  }

  // Add terminator if there's room (up to 4 bits of zeros)
  const remainingBits = totalDataCount * 8 - buffer.getLengthInBits();
  const terminatorBits = Math.min(4, remainingBits);
  if (terminatorBits > 0) {
    buffer.put(0, terminatorBits);
  }
  
  // CHECKPOINT 5: After terminator
  const bitsAfterTerminator = buffer.getLengthInBits();

  // Pad to byte boundary with zeros
  while (buffer.getLengthInBits() % 8 !== 0) {
    buffer.putBit(false);
  }
  
  // CHECKPOINT 6: After padding to byte boundary
  const bitsAfterPadToByte = buffer.getLengthInBits();
  
  // CRITICAL: This is where padding codewords start (byte index)
  const paddingStartByte = buffer.getLengthInBits() / 8;

  // Add padding bytes (0xEC 0x11 pattern)
  const PAD0 = 0xec;
  const PAD1 = 0x11;
  while (buffer.getLengthInBits() < totalDataCount * 8) {
    buffer.put(PAD0, 8);
    if (buffer.getLengthInBits() < totalDataCount * 8) {
      buffer.put(PAD1, 8);
    }
  }
  
  // Calculate padding byte count
  const paddingByteCount = totalDataCount - paddingStartByte;
  
  // HYBRID STRATEGY: Calculate controllable bits
  // - Suffix bits: starts after original data, ends at bitsAfterData
  // - Padding bits: starts at paddingStartByte * 8, ends at totalDataCount * 8
  const suffixBits = suffixLength * 8;
  const paddingBits = paddingByteCount * 8;
  const totalControllableBits = suffixBits + paddingBits;
  
  // Protection boundary: after mode + charCount + original data (rounded up to byte)
  // We protect complete bytes, so round up to next byte boundary
  const protectedBitEnd = Math.ceil(bitsAfterOriginalData / 8) * 8;
  
  // Allowed region starts where protection ends (suffix bytes start here or after)
  // Since protection is byte-aligned, allowed region also starts at byte boundary
  const allowedBitStart = protectedBitEnd;
  const allowedBitEnd = totalDataCount * 8;
  
  // Build the encoder-derived layout
  const encoderLayout: EncoderDerivedLayout = {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData,
    bitsAfterTerminator,
    bitsAfterPadToByte,
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    originalDataLength,
    suffixLength,
    // HYBRID protection: only mode + charCount + original data is protected
    protectedBitEnd,
    // Controllable: suffix bytes + padding codewords
    allowedBitStart,
    allowedBitEnd,
    suffixBits,
    paddingBits,
  };
  
  // Log the ACTUAL semantic boundaries from the encoder (HYBRID mode)
  log.info('ENCODER-DERIVED SEMANTIC BOUNDARIES (HYBRID mode)', {
    version,
    ecc,
    originalDataLength,
    suffixLength,
    fullDataLength: fullData.length,
    checkpoints: {
      bitsAfterMode: `${bitsAfterMode} bits (mode indicator)`,
      bitsAfterCharCount: `${bitsAfterCharCount} bits (+char count)`,
      bitsAfterOriginalData: `${bitsAfterOriginalData} bits (+original data) [PROTECTION BOUNDARY]`,
      bitsAfterData: `${bitsAfterData} bits (+suffix data)`,
      bitsAfterTerminator: `${bitsAfterTerminator} bits (+terminator)`,
      bitsAfterPadToByte: `${bitsAfterPadToByte} bits (+pad-to-byte)`,
    },
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    protection: {
      protectedBits: `0 - ${protectedBitEnd}`,
      protectedBytes: Math.ceil(protectedBitEnd / 8),
    },
    controllable: {
      suffixBits: `${bitsAfterOriginalData} - ${bitsAfterData} (${suffixBits} bits, ${suffixLength} chars)`,
      paddingBits: `${paddingStartByte * 8} - ${totalDataCount * 8} (${paddingBits} bits, ${paddingByteCount} bytes)`,
      totalControllableBits,
      controllablePercent: `${((totalControllableBits / (totalDataCount * 8)) * 100).toFixed(1)}%`,
    },
  });

  // Extract bytes for each block and compute ECC
  const bufferBytes = buffer.getBuffer();
  
  // Log first 32 bytes of the encoded buffer for debugging
  log.debug('ENCODE SUMMARY - first 32 bytes of buffer', {
    bufferBits: buffer.getLengthInBits(),
    bufferBytesLen: bufferBytes.length,
    first32Bytes: Array.from(bufferBytes.slice(0, 32)),
  });
  
  const blockDataArrays: Uint8Array[] = [];
  const blockEccArrays: Uint8Array[] = [];
  const blockDataCounts: number[] = [];
  const blockEccCounts: number[] = [];

  let offset = 0;
  for (const block of rsBlocks) {
    const blockData = new Uint8Array(block.dataCount);
    for (let i = 0; i < block.dataCount; i++) {
      blockData[i] = bufferBytes[offset + i] & 0xff;
    }
    blockDataArrays.push(blockData);
    blockDataCounts.push(block.dataCount);

    const eccCount = block.totalCount - block.dataCount;
    blockEccCounts.push(eccCount);

    // Compute ECC for this block's data (needed for RS linearity preservation)
    const eccBytes = computeECC(blockData, eccCount);
    blockEccArrays.push(eccBytes);

    offset += block.dataCount;
  }

  return { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout };
}

/**
 * Regenerate a QR code from modified per-block data and ECC
 * This directly constructs a valid QR matrix with all structural patterns
 * and the modified data codewords placed via zigzag traversal.
 *
 * IMPORTANT: The ECC arrays must be pre-computed to preserve RS linearity.
 * When XORing basis vectors, we XOR both data AND ECC, so the combined
 * result remains a valid RS codeword. We must NOT recompute ECC here.
 */
function regenerateQRFromModifiedData(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  version: number,
  ecc: ECCLevel,
  maskPattern: number
): boolean[][] {
  const moduleCount = version * 4 + 17;

  // Create module array initialized to null (will be filled in)
  const modules: (boolean | null)[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    modules[row] = new Array(moduleCount).fill(null);
  }

  // 1. Draw finder patterns (7x7 at three corners)
  const setupFinderPattern = (centerRow: number, centerCol: number) => {
    for (let r = -1; r <= 7; r++) {
      if (centerRow + r < 0 || centerRow + r >= moduleCount) continue;
      for (let c = -1; c <= 7; c++) {
        if (centerCol + c < 0 || centerCol + c >= moduleCount) continue;
        if (
          (0 <= r && r <= 6 && (c === 0 || c === 6)) ||
          (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
          (2 <= r && r <= 4 && 2 <= c && c <= 4)
        ) {
          modules[centerRow + r][centerCol + c] = true;
        } else {
          modules[centerRow + r][centerCol + c] = false;
        }
      }
    }
  };

  setupFinderPattern(0, 0); // Top-left
  setupFinderPattern(moduleCount - 7, 0); // Bottom-left
  setupFinderPattern(0, moduleCount - 7); // Top-right

  // 2. Draw timing patterns (alternating dark/light at row 6 and col 6)
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = dark; // Horizontal
    if (modules[i][6] === null) modules[i][6] = dark; // Vertical
  }

  // 3. Draw alignment patterns (5x5, version >= 2)
  if (version >= 2) {
    const positions = getPatternPosition(version);
    for (const row of positions) {
      for (const col of positions) {
        // Skip if overlapping with finder patterns
        if (modules[row][col] !== null) continue;

        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            if (r === -2 || r === 2 || c === -2 || c === 2 || (r === 0 && c === 0)) {
              modules[row + r][col + c] = true;
            } else {
              modules[row + r][col + c] = false;
            }
          }
        }
      }
    }
  }

  // 4. Reserve format information areas (will be filled later)
  // These are around the top-left finder and extend to other finders
  const eccLevel = eccToNumericForEncoder(ecc);
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  // Draw format info (vertical part near top-left finder)
  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1;

    // Vertical (left side)
    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[moduleCount - 15 + i][8] = mod;
    }

    // Horizontal (top side)
    if (i < 8) {
      modules[8][moduleCount - i - 1] = mod;
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod;
    } else {
      modules[8][15 - i - 1] = mod;
    }
  }

  // Fixed dark module
  modules[moduleCount - 8][8] = true;

  // 5. Draw version information (version >= 7)
  if (version >= 7) {
    const versionBits = getBCHTypeNumber(version);

    for (let i = 0; i < 18; i++) {
      const mod = ((versionBits >> i) & 1) === 1;
      // Bottom-left of top-right finder
      modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
      // Right of bottom-left finder
      modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
    }
  }

  // 6. Combine data and pre-computed ECC for each block (DO NOT recompute ECC!)
  // RS codes are linear: XOR of valid codewords is valid. Since we XORed both
  // data and ECC portions of basis vectors, the result is already valid.
  const blockCodewords: Uint8Array[] = [];
  for (let i = 0; i < blockDataArrays.length; i++) {
    const data = blockDataArrays[i];
    const eccBytes = blockEccArrays[i]; // Use pre-computed/XORed ECC

    const codeword = new Uint8Array(data.length + eccBytes.length);
    codeword.set(data, 0);
    codeword.set(eccBytes, data.length);
    blockCodewords.push(codeword);
  }

  // Interleave codewords (data first, then ECC)
  const maxDataCount = Math.max(...blockDataCounts);
  const maxEccCount = Math.max(...blockEccCounts);
  const interleaved: number[] = [];

  for (let i = 0; i < maxDataCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockDataCounts[b]) {
        interleaved.push(blockCodewords[b][i]);
      }
    }
  }

  for (let i = 0; i < maxEccCount; i++) {
    for (let b = 0; b < blockCodewords.length; b++) {
      if (i < blockEccCounts[b]) {
        interleaved.push(blockCodewords[b][blockDataCounts[b] + i]);
      }
    }
  }

  // 7. Place data using zigzag traversal with mask
  const maskFunc = getMaskFunction(maskPattern);
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  for (let col = moduleCount - 1; col > 0; col -= 2) {
    // Skip timing column
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const currentCol = col - c;

        // Only place data in empty modules
        if (modules[row][currentCol] === null) {
          let dark = false;

          if (byteIndex < interleaved.length) {
            dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
          }

          // Apply mask
          if (maskFunc(row, currentCol)) {
            dark = !dark;
          }

          modules[row][currentCol] = dark;
          bitIndex--;

          if (bitIndex === -1) {
            byteIndex++;
            bitIndex = 7;
          }
        }
      }

      row += inc;

      if (row < 0 || row >= moduleCount) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
  }

  // Convert to boolean[][] (null -> false)
  const result: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    result[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      result[r][c] = modules[r][c] === true;
    }
  }

  return result;
}

/**
 * Generate a full QR-Art code using RS basis manipulation
 *
 * STRATEGY 2 Implementation:
 * - Encode ONLY the provided data (no suffix modification)
 * - Select a version with enough padding codewords for QR-Art control
 * - Only padding codewords (after terminator+pad-to-byte) are controllable
 * - The decoded message is ALWAYS preserved exactly
 *
 * Algorithm:
 * 1. Calculate semantic bit layout to find padding codeword region
 * 2. Build RS basis vectors ONLY for padding bits (protected regions excluded)
 * 3. Map bits to pixels via zigzag traversal
 * 4. Gauss-Jordan elimination to assign pixel control
 * 5. Select vectors to flip pixels toward target
 * 6. Regenerate QR with modified data
 */
export async function generateFullQArt(config: FullQArtConfig): Promise<FullQArtResult> {
  const { 
    data, 
    targetImage, 
    version, 
    ecc, 
    maskPattern, 
    onProgress,
    suffix,
    autoSuffix = true,  // Default to auto-generating suffix for better control
    minPadCodewords = 10,  // Lower default since suffix provides most control
    forceVersion,
    targetControlPercent = 50,
  } = config;

  // Store original data length for protection boundary tracking
  const originalDataLength = data.length;

  // HYBRID STRATEGY: Add suffix for more controllable bits
  // The suffix can be modified freely while original data is protected
  let encodedData: string;
  let actualSuffix: string;
  let versionToUse: number;
  
  // First, determine the version to use (needed for suffix calculation)
  if (forceVersion && forceVersion > 0) {
    versionToUse = forceVersion;
    log.info('Using forced QR version', { forceVersion });
  } else if (version > 0) {
    versionToUse = version;
    log.info('Using specified QR version', { version });
  } else {
    // Will be calculated after suffix determination
    versionToUse = 0;
  }

  // Handle suffix generation
  if (suffix !== undefined) {
    // User provided explicit suffix
    actualSuffix = suffix;
    encodedData = data + suffix;
    log.info('Using user-provided suffix', {
      originalDataLength,
      suffixLength: suffix.length,
      suffixPreview: suffix.slice(0, 20) + (suffix.length > 20 ? '...' : ''),
    });
  } else if (autoSuffix) {
    // Auto-generate suffix to fill capacity
    // Use calculateOptimalVersionAndSuffix from rs-basis.ts
    const optimalConfig = calculateOptimalVersionAndSuffix(
      versionToUse,  // 0 for auto, or user-specified minimum
      ecc,
      originalDataLength,
      targetControlPercent
    );
    
    // Generate DETERMINISTIC suffix with # prefix (URL fragment)
    // Using deterministic suffix ensures stable baseline across runs
    // Account for the # character in the suffix length
    const suffixCharCount = Math.max(0, optimalConfig.suffixLength - 1);
    const seed = hashStringToSeed(data + optimalConfig.version.toString() + ecc);
    actualSuffix = '#' + generateDeterministicSuffix(suffixCharCount, seed);
    encodedData = data + actualSuffix;
    
    // Use the optimal version calculated
    if (versionToUse === 0) {
      versionToUse = optimalConfig.version;
    } else {
      // User specified a version, but we may need to upgrade for suffix capacity
      if (optimalConfig.version > versionToUse) {
        log.warn('Upgrading version to fit auto-generated suffix', {
          requestedVersion: versionToUse,
          upgradeToVersion: optimalConfig.version,
        });
        versionToUse = optimalConfig.version;
      }
    }
    
    log.info('Auto-generated DETERMINISTIC suffix for HYBRID QR-Art', {
      originalDataLength,
      suffixLength: actualSuffix.length,
      suffixPreview: actualSuffix.slice(0, 30) + (actualSuffix.length > 30 ? '...' : ''),
      maxSuffixLength: MAX_SUFFIX_LENGTH,
      suffixWasCapped: optimalConfig.suffixWasCapped,
      optimalVersion: optimalConfig.version,
      versionToUse,
      expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
      versionUpgraded: optimalConfig.versionUpgraded,
      paddingBytes: optimalConfig.paddingBytes,
      controllableBits: {
        suffix: optimalConfig.suffixBits,
        padding: optimalConfig.paddingBits,
        total: optimalConfig.suffixBits + optimalConfig.paddingBits,
      },
      seedUsed: seed,
    });
  } else {
    // No suffix - only padding codewords will be controllable (limited)
    actualSuffix = '';
    encodedData = data;
    
    // If version is auto, calculate with padding slack
    if (versionToUse === 0) {
      versionToUse = calculateVersionForSlack(data.length, ecc, minPadCodewords);
    }
    
    log.warn('No suffix - only padding codewords controllable (limited QR-Art control)', {
      originalDataLength,
      versionToUse,
      minPadCodewords,
      note: 'Set autoSuffix=true for better image quality',
    });
  }

  // Log the encoding target (HYBRID mode)
  log.info('QR-Art encoding target (HYBRID STRATEGY)', {
    originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
    originalDataLength,
    suffix: actualSuffix.length > 30 ? actualSuffix.slice(0, 30) + '...' : actualSuffix,
    suffixLength: actualSuffix.length,
    fullEncodedLength: encodedData.length,
    versionToUse,
    ecc,
    strategy: 'HYBRID - original data protected, suffix + padding controllable',
  });

  try {
    onProgress?.('Encoding base data', 0);

    // CRITICAL: Clear basis cache to ensure fresh calculation
    clearBasisCache();
    log.debug('Cleared basis cache for fresh calculation');

    // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
    // HYBRID MODE: Pass originalDataLength to track protection boundaries
    const baseResult = generateBaseQR(encodedData, versionToUse, ecc, maskPattern, originalDataLength);
    const {
      matrix: baseMatrix,
      actualVersion,
      actualMask,
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      encoderLayout,
    } = baseResult;
    const moduleCount = baseMatrix.length;

    log.info('Base QR generated', {
      version: actualVersion,
      moduleCount,
      maskPattern: actualMask,
      ecc,
      dataLength: data.length,
    });

    // Step 1.5: Use ENCODER-DERIVED semantic layout (not calculated from data.length!)
    // This is CRITICAL - we use the actual bit positions from the encoder, not assumptions
    onProgress?.('Analyzing semantic layout', 5);
    
    // =========================================================================
    // BOUNDARY AUDIT (SINGLE SOURCE OF TRUTH)
    // =========================================================================
    // We use ONLY encoder-derived boundaries for protection.
    // The encoderLayout tracks exactly where original data ends in the bit stream.
    // There is no "calculated" alternative - encoderLayout IS the source of truth.
    //
    // CRITICAL: Verify our math is internally consistent.
    const expectedBitsAfterOriginalData = encoderLayout.bitsAfterCharCount + (originalDataLength * 8);
    const internalConsistencyOk = encoderLayout.bitsAfterOriginalData === expectedBitsAfterOriginalData;
    
    log.info('BOUNDARY AUDIT (single source of truth: encoderLayout)', {
      version: actualVersion,
      stage: 'PRE_ELIMINATION',
      source: 'ENCODER_DERIVED_ONLY',
      modeUsedByEncoder: '8-bit byte',
      charCountBitsUsed: encoderLayout.bitsAfterCharCount - encoderLayout.bitsAfterMode,
      boundaries: {
        bitsAfterMode: encoderLayout.bitsAfterMode,
        bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
        bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
        bitsAfterFullData: encoderLayout.bitsAfterData,
        expectedBitsAfterOriginalData,
        internalConsistencyOk,
      },
      protection: {
        protectedBitEnd: encoderLayout.protectedBitEnd,
        protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
        protectedBytesCount: Math.ceil(encoderLayout.protectedBitEnd / 8),
        originalDataLength,
      },
      controllable: {
        allowedBitStart: encoderLayout.allowedBitStart,
        allowedBitEnd: encoderLayout.allowedBitEnd,
        suffixBits: encoderLayout.suffixBits,
        paddingBits: encoderLayout.paddingBits,
      },
    });
    
    if (!internalConsistencyOk) {
      log.error('INTERNAL CONSISTENCY FAILURE - encoder boundary math is wrong!', {
        bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
        expectedBitsAfterOriginalData,
        bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
        originalDataLength,
        note: 'This is a bug in encodeDataToBytes()',
      });
      // FAIL FAST - this is a fundamental bug
      return {
        success: false,
        error: 'Internal consistency failure: encoder boundary math incorrect',
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    }
    
    // Log comprehensive semantic boundary information using ENCODER-DERIVED values (HYBRID mode)
    log.info('ENCODER-DERIVED SEMANTIC LAYOUT (HYBRID STRATEGY)', {
      version: actualVersion,
      ecc,
      originalDataLength: encoderLayout.originalDataLength,
      suffixLength: encoderLayout.suffixLength,
      fullDataLength: encodedData.length,
      encoderCheckpoints: {
        bitsAfterMode: encoderLayout.bitsAfterMode,
        bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
        bitsAfterOriginalData: `${encoderLayout.bitsAfterOriginalData} [PROTECTION BOUNDARY]`,
        bitsAfterData: encoderLayout.bitsAfterData,
        bitsAfterTerminator: encoderLayout.bitsAfterTerminator,
        bitsAfterPadToByte: encoderLayout.bitsAfterPadToByte,
      },
      paddingStartByte: encoderLayout.paddingStartByte,
      totalDataBytes: encoderLayout.totalDataBytes,
      paddingByteCount: encoderLayout.paddingByteCount,
      protection: {
        protectedRegion: `bits 0 - ${encoderLayout.protectedBitEnd} (mode + charCount + original data)`,
        protectedBytes: Math.ceil(encoderLayout.protectedBitEnd / 8),
      },
      controllable: {
        suffixRegion: `bits ${encoderLayout.bitsAfterOriginalData} - ${encoderLayout.bitsAfterData} (${encoderLayout.suffixBits} bits)`,
        paddingRegion: `bits ${encoderLayout.paddingStartByte * 8} - ${encoderLayout.allowedBitEnd} (${encoderLayout.paddingBits} bits)`,
        totalControllableBits: encoderLayout.suffixBits + encoderLayout.paddingBits,
        controllablePercent: `${(((encoderLayout.suffixBits + encoderLayout.paddingBits) / (encoderLayout.totalDataBytes * 8)) * 100).toFixed(1)}%`,
      },
    });

    // =========================================================================
    // BASELINE STATS - Measure baseline before QR-Art modifications
    // =========================================================================
    // This helps diagnose why "bigger version makes art worse"
    // A random baseline will be harder to control than a deterministic one
    let baseDarkModules = 0;
    let totalModules = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        totalModules++;
        if (baseMatrix[row][col]) {
          baseDarkModules++;
        }
      }
    }
    const baseDarkPercent = (baseDarkModules / totalModules) * 100;
    
    log.info('BASELINE STATS (before QR-Art)', {
      version: actualVersion,
      moduleCount,
      totalModules,
      baseDarkModules,
      baseDarkPercent: `${baseDarkPercent.toFixed(1)}%`,
      suffixLength: actualSuffix.length,
      paddingBytes: encoderLayout.paddingByteCount,
      isDeterministicSuffix: autoSuffix && !suffix,
      note: baseDarkPercent > 60 || baseDarkPercent < 40 
        ? 'Baseline is unbalanced - QR-Art may struggle'
        : 'Baseline is balanced',
    });

    // CRITICAL VERIFICATION: Scan the base matrix to verify it encodes data correctly
    const baseVerificationScan = scanMatrixWithJsQR(baseMatrix);
    if (baseVerificationScan.success) {
      // HYBRID: Check that original data is preserved using STRICT byte-exact validation
      const baseValidation = validateOriginalDataPreserved(baseVerificationScan.data, data);
      if (baseValidation.valid) {
        log.info('BASE MATRIX VERIFICATION PASSED (byte-exact)', {
          originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
          decodedDataLength: baseVerificationScan.data?.length,
          suffixPresent: (baseVerificationScan.data?.length ?? 0) > originalDataLength,
          validationMethod: 'BYTE_EXACT_PREFIX',
        });
      } else {
        log.error('BASE MATRIX VERIFICATION FAILED - byte-exact validation failed!', {
          expectedOriginal: data,
          actualDecodedData: baseVerificationScan.data,
          validationReason: baseValidation.reason,
          mismatchDetails: baseValidation.mismatch,
        });
        // FAIL FAST - if base matrix doesn't preserve data, something is fundamentally wrong
        return {
          success: false,
          error: 'Base matrix byte-exact validation failed: ' + baseValidation.reason,
          matrix: baseMatrix,
          moduleCount,
          version: actualVersion,
          maskPattern: actualMask,
          matchingPixels: 0,
          totalControllable: 0,
          matchPercentage: 0,
          encodedData: encodedData,
          originalData: data,
          suffix: actualSuffix,
        };
      }
    } else {
      log.error('BASE MATRIX VERIFICATION FAILED - base matrix does not scan!', {
        error: baseVerificationScan.error,
      });
      // FAIL FAST - if base matrix doesn't scan, something is fundamentally wrong
      return {
        success: false,
        error: 'Base matrix does not scan: ' + baseVerificationScan.error,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    }

    onProgress?.('Building RS basis', 10);

    // Step 2: Build RS basis with ENCODER-DERIVED RANGE protection (HYBRID STRATEGY)
    // CONTROLLABLE: suffix bytes + padding codewords
    // PROTECTED: mode + charCount + original data bytes
    // CRITICAL: Use encoderLayout.allowedBitStart which accounts for ORIGINAL data protection!
    const allowedBitRanges: BitRange[] = [{
      startBit: encoderLayout.allowedBitStart,  // Starts after protected original data
      endBit: encoderLayout.allowedBitEnd,      // Ends at total data capacity
    }];
    const basis = buildFullBasis(actualVersion, ecc, allowedBitRanges);

    // =========================================================================
    // GUARD: Verify no basis vector touches protected bits
    // =========================================================================
    // This is a sanity check - if any vector's dataBitIndex is below protectedBitEnd,
    // something is wrong with our allowed range calculation.
    const protectedBitEnd = encoderLayout.protectedBitEnd;
    const vectorsInProtectedRegion: Array<{
      vectorIndex: number;
      dataBitIndex: number;
      blockIndex: number;
      localBitIndex: number;
    }> = [];
    
    for (let i = 0; i < basis.vectors.length; i++) {
      const vector = basis.vectors[i];
      // Calculate the LINEAR buffer bit index for this vector
      // First, find the linear byte offset for this block
      let linearByteOffset = 0;
      for (let b = 0; b < vector.rsBlockIndex; b++) {
        linearByteOffset += blockDataCounts[b];
      }
      const linearByte = linearByteOffset + vector.posInBlock;
      const linearBit = linearByte * 8 + (7 - vector.bitInByte);
      
      // Check if this linear bit is in the protected region
      if (linearBit < protectedBitEnd) {
        vectorsInProtectedRegion.push({
          vectorIndex: i,
          dataBitIndex: vector.dataBitIndex,
          blockIndex: vector.rsBlockIndex,
          localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
        });
      }
    }
    
    if (vectorsInProtectedRegion.length > 0) {
      log.error('CRITICAL: Basis vectors exist in PROTECTED region!', {
        protectedBitEnd,
        vectorsInProtectedRegion: vectorsInProtectedRegion.slice(0, 10),
        totalViolations: vectorsInProtectedRegion.length,
        note: 'These vectors would corrupt original data if applied!',
      });
      
      // FAIL FAST - this is a fundamental bug in allowed range calculation
      return {
        success: false,
        error: `${vectorsInProtectedRegion.length} basis vectors touch protected bits - algorithm bug`,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    }
    
    log.info('GUARD PASSED: All basis vectors are in allowed region', {
      protectedBitEnd,
      allowedBitStart: encoderLayout.allowedBitStart,
      vectorCount: basis.vectors.length,
      stage: 'POST_BASIS_BUILD',
    });

    // Calculate actual controllable bits
    const actualControllableBits = basis.vectors.length;
    const totalDataBits = encoderLayout.totalDataBytes * 8;
    const actualControlPercentage = totalDataBits > 0 ? (actualControllableBits / totalDataBits) * 100 : 0;
    const expectedControllableBits = encoderLayout.suffixBits + encoderLayout.paddingBits;
    
    log.info('QR-Art capacity analysis (HYBRID STRATEGY)', {
      totalDataBits,
      protectedBits: encoderLayout.protectedBitEnd,
      protectedContent: `mode + charCount + original data (${encoderLayout.originalDataLength} chars)`,
      controllable: {
        suffixBits: encoderLayout.suffixBits,
        paddingBits: encoderLayout.paddingBits,
        totalControllable: actualControllableBits,
        expectedControllable: expectedControllableBits,
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      },
      vectorsCreated: basis.vectors.length,
      source: 'ENCODER_DERIVED_HYBRID',
    });

    // Warn if control is very limited
    if (basis.vectors.length === 0) {
      log.warn('ZERO controllable vectors! QR-Art cannot modify any pixels.', {
        suggestion: 'Use a larger QR version or add a longer suffix.',
        suffixLength: actualSuffix.length,
        paddingBytes: encoderLayout.paddingByteCount,
        originalDataLength,
      });
      
      // Return the base matrix unchanged - it's a valid QR but without art
      return {
        success: true,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    } else if (actualControlPercentage < 20) {
      log.warn('Limited QR-Art control. Image quality may be reduced.', {
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
        controllableVectors: basis.vectors.length,
        suffixBits: encoderLayout.suffixBits,
        paddingBits: encoderLayout.paddingBits,
        suggestion: 'Use a larger QR version or enable autoSuffix for better control.',
      });
    }

    // =========================================================================
    // DETERMINISTIC HYBRID MUTATION TEST
    // =========================================================================
    // Before running the full solver, verify that applying a single controllable
    // vector actually works and doesn't corrupt the ORIGINAL DATA.
    // 
    // HYBRID MODE: The suffix CAN be modified - we only verify original data is preserved.
    // 
    // This catches issues where:
    // - Our "controllable" region includes protected original data
    // - The bit mapping doesn't match regeneration
    // - Interleaving assumptions are wrong
    //
    if (basis.vectors.length > 0) {
      log.info('Running deterministic HYBRID mutation test...');
      
      // Pick the first controllable vector
      const testVector = basis.vectors[0];
      
      // Calculate the local bit index for this vector (for debugging)
      const testLocalBitIndex = testVector.posInBlock * 8 + (7 - testVector.bitInByte);
      
      // Calculate what linear buffer byte this corresponds to
      // (sum of previous blocks' data counts + local byte position)
      let linearByteOffset = 0;
      for (let b = 0; b < testVector.rsBlockIndex; b++) {
        linearByteOffset += blockDataCounts[b];
      }
      const linearByte = linearByteOffset + testVector.posInBlock;
      const linearBit = linearByte * 8 + (7 - testVector.bitInByte);
      
      log.info('Test vector details', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        vectorPosInBlock: testVector.posInBlock,
        vectorBitInByte: testVector.bitInByte,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        paddingStartByte: encoderLayout.paddingStartByte,
        allowedBitStart: encoderLayout.allowedBitStart,
        isInAllowedRange: linearBit >= encoderLayout.allowedBitStart && linearBit < encoderLayout.allowedBitEnd,
        note: linearBit >= encoderLayout.allowedBitStart 
          ? 'Vector is in padding region (EXPECTED)' 
          : `Vector is in PROTECTED region! Expected >= ${encoderLayout.allowedBitStart}, got ${linearBit}`,
      });
      
      // Clone original data/ECC
      const testBlockData = blockDataArrays.map(arr => new Uint8Array(arr));
      const testBlockEcc = blockEccArrays.map(arr => new Uint8Array(arr));
      
      // Apply just this one vector (XOR it into the block)
      const blockIdx = testVector.rsBlockIndex;
      for (let byteIdx = 0; byteIdx < testBlockData[blockIdx].length; byteIdx++) {
        testBlockData[blockIdx][byteIdx] ^= testVector.blockBits[byteIdx];
      }
      for (let byteIdx = 0; byteIdx < testBlockEcc[blockIdx].length; byteIdx++) {
        testBlockEcc[blockIdx][byteIdx] ^= testVector.blockBits[blockDataCounts[blockIdx] + byteIdx];
      }
      
      // Regenerate matrix
      const testMatrix = regenerateQRFromModifiedData(
        testBlockData,
        testBlockEcc,
        blockDataCounts,
        blockEccCounts,
        actualVersion,
        ecc,
        actualMask
      );
      
      // Scan and verify
      const testScan = scanMatrixWithJsQR(testMatrix);
      
      if (!testScan.success) {
        log.error('HYBRID MUTATION TEST FAILED - single vector breaks scan!', {
          vectorDataBitIndex: testVector.dataBitIndex,
          vectorBlockIndex: testVector.rsBlockIndex,
          vectorPosInBlock: testVector.posInBlock,
          vectorBitInByte: testVector.bitInByte,
          localBitIndex: testLocalBitIndex,
          linearByte,
          linearBit,
          paddingStartByte: encoderLayout.paddingStartByte,
          allowedBitStart: encoderLayout.allowedBitStart,
          scanError: testScan.error,
        });
        
        // This is a critical failure - our "controllable" region is not actually safe
        return {
          success: false,
          error: 'HYBRID mutation test failed: single vector application broke QR scan',
          matrix: baseMatrix,
          moduleCount,
          version: actualVersion,
          maskPattern: actualMask,
          matchingPixels: 0,
          totalControllable: 0,
          matchPercentage: 0,
          encodedData: encodedData,
          originalData: data,
          suffix: actualSuffix,
        };
      }
      
      // HYBRID: Check that ORIGINAL DATA is preserved using STRICT byte-exact validation
      const mutationValidation = validateOriginalDataPreserved(testScan.data, data);
      
      if (!mutationValidation.valid) {
        log.error('HYBRID MUTATION TEST FAILED - byte-exact validation failed!', {
          expectedOriginal: data,
          actualData: testScan.data,
          expectedLength: originalDataLength,
          actualLength: testScan.data?.length,
          validationReason: mutationValidation.reason,
          mismatchDetails: mutationValidation.mismatch,
          vectorDataBitIndex: testVector.dataBitIndex,
          vectorBlockIndex: testVector.rsBlockIndex,
          localBitIndex: testLocalBitIndex,
          linearByte,
          linearBit,
          paddingStartByte: encoderLayout.paddingStartByte,
          allowedBitStart: encoderLayout.allowedBitStart,
          protectedBitEnd: encoderLayout.protectedBitEnd,
          note: 'This means our "controllable" bits include protected original data!',
        });
        
        return {
          success: false,
          error: 'HYBRID mutation test failed: ' + mutationValidation.reason,
          matrix: baseMatrix,
          moduleCount,
          version: actualVersion,
          maskPattern: actualMask,
          matchingPixels: 0,
          totalControllable: 0,
          matchPercentage: 0,
          encodedData: encodedData,
          originalData: data,
          suffix: actualSuffix,
        };
      }
      
      // Log whether suffix was modified (expected in HYBRID mode)
      const decodedSuffix = testScan.data?.slice(originalDataLength) || '';
      const suffixWasModified = decodedSuffix !== actualSuffix;
      
      log.info('HYBRID MUTATION TEST PASSED (byte-exact)', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        paddingStartByte: encoderLayout.paddingStartByte,
        originalDataPreserved: true,
        validationMethod: 'BYTE_EXACT_PREFIX',
        suffixWasModified,
        matrixScansCorrectly: true,
      });
    }

    onProgress?.('Mapping bits to pixels', 20);

    // Step 3: Build bit-to-pixel mapping
    const mappings = buildBitPixelMap(actualVersion, ecc, actualMask);

    log.debug('Bit-pixel mapping built', {
      totalMappings: mappings.length,
    });

    onProgress?.('Processing target image', 30);

    // Step 4: Map target image to module targets
    const { targets, importance } = mapImageToTargetsSupersampled(targetImage, moduleCount);

    // Get set of data pixels
    const dataPixelIndices = getDataPixelIndices(actualVersion);
    const dataPixels = new Set(dataPixelIndices);

    onProgress?.('Ranking pixels by importance', 40);

    // Step 5: Rank pixels by importance
    const pixelOrder = rankPixelsByImportance(targets, importance, moduleCount, dataPixels);

    log.debug('Pixels ranked', {
      totalDataPixels: pixelOrder.length,
    });

    onProgress?.('Performing Gauss-Jordan elimination', 50);

    // Step 6: Gauss-Jordan elimination
    const elimination = gaussJordanEliminate(
      basis.vectors,
      mappings,
      moduleCount,
      actualMask,
      pixelOrder
    );

    log.info('Gauss-Jordan elimination complete', {
      controllablePixels: elimination.controllablePixels,
      totalDataPixels: pixelOrder.length,
      controlPercentage: `${((elimination.controllablePixels / pixelOrder.length) * 100).toFixed(1)}%`,
    });

    onProgress?.('Selecting basis vectors', 70);

    // Step 7: Select which vectors to apply (per-block)
    const blockSelections = selectBasisVectorsForTarget(
      elimination,
      targets,
      baseMatrix,
      moduleCount
    );

    const totalSelected = blockSelections.reduce(
      (sum, s) => sum + s.selectedVectorIndices.length,
      0
    );
    log.debug('Vectors selected', {
      selectedCount: totalSelected,
      controllable: elimination.controllablePixels,
      blocksWithSelections: blockSelections.filter((s) => s.selectedVectorIndices.length > 0)
        .length,
    });

    onProgress?.('Counting predicted matches', 75);

    // Step 8: Count predicted matching pixels (before re-encoding)
    // Pass mappings so we can accurately track ALL pixels affected by selected vectors
    const { matching: predictedMatching, total } = countMatchingPixels(
      baseMatrix,
      elimination,
      blockSelections,
      targets,
      moduleCount,
      dataPixels,
      mappings
    );

    const predictedMatchPercentage = total > 0 ? (predictedMatching / total) * 100 : 0;

    log.info('Predicted QR-Art result', {
      predictedMatchingPixels: predictedMatching,
      totalControllable: total,
      predictedMatchPercentage: `${predictedMatchPercentage.toFixed(1)}%`,
    });

    onProgress?.('Modifying data bytes', 80);

    // Step 9: Clone and modify the per-block data AND ECC arrays
    // We must XOR both data and ECC to preserve RS linearity
    const modifiedBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
    const modifiedBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));
    applyAllSelectedVectors(
      modifiedBlockData,
      modifiedBlockEcc,
      elimination,
      blockSelections,
      blockDataCounts
    );

    // DEBUG: Verify RS linearity is preserved - modified data+ECC should still be valid codewords
    // If computeECC(modifiedData) !== modifiedEcc, then RS linearity is broken
    let rsLinearityOk = true;
    for (let i = 0; i < modifiedBlockData.length; i++) {
      const expectedEcc = computeECC(modifiedBlockData[i], blockEccCounts[i]);
      const actualEcc = modifiedBlockEcc[i];
      if (!arraysEqual(expectedEcc, actualEcc)) {
        rsLinearityOk = false;
        log.error('RS LINEARITY BROKEN - modified codeword is invalid!', {
          blockIndex: i,
          dataCount: blockDataCounts[i],
          eccCount: blockEccCounts[i],
          expectedEccFirst5: Array.from(expectedEcc.slice(0, 5)),
          actualEccFirst5: Array.from(actualEcc.slice(0, 5)),
          modifiedDataFirst5: Array.from(modifiedBlockData[i].slice(0, 5)),
        });
      } else {
        log.debug('RS linearity verified for modified block', { blockIndex: i });
      }
    }

    if (rsLinearityOk) {
      log.info('RS linearity preserved - all modified codewords are valid');
    } else {
      log.error('RS LINEARITY CHECK FAILED - QR code will likely not scan!');
      // FAIL FAST: RS linearity is fundamental - if broken, the QR will not decode
      return {
        success: false,
        error: 'RS linearity broken - modified codewords are invalid',
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    }
    
    // =========================================================================
    // ECC DAMAGE ESTIMATION
    // =========================================================================
    // Track how many codewords changed per block vs ECC budget
    // This helps diagnose "scans but corrupted" issues
    let anyBlockOverBudget = false;
    for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
      const eccDamage = calculateECCDamage(
        blockDataArrays[blockIdx],
        modifiedBlockData[blockIdx],
        blockEccCounts[blockIdx]
      );
      
      if (eccDamage.isOverBudget) {
        anyBlockOverBudget = true;
      }
      
      log.info('ECC DAMAGE ESTIMATE', {
        blockIndex: blockIdx,
        eccCount: blockEccCounts[blockIdx],
        changedDataCodewords: eccDamage.changedCodewords,
        changedTotalCodewords: eccDamage.changedCodewords, // Data only, ECC is XORed
        safeLimit: eccDamage.safeLimit,
        isOverBudget: eccDamage.isOverBudget,
        percentOfBudget: eccDamage.safeLimit > 0 
          ? `${((eccDamage.changedCodewords / eccDamage.safeLimit) * 100).toFixed(1)}%`
          : 'N/A',
      });
    }
    
    if (anyBlockOverBudget) {
      log.error('ECC budget exceeded in one or more blocks - falling back to binary search', {
        suggestion: 'Reduce number of vectors or use higher ECC level',
        note: 'Binary search fallback will find maximum safe vector count',
      });
      // Note: We don't fail fast here because the binary search fallback
      // will find the maximum safe number of vectors. The full solution
      // may still work if we're only slightly over budget.
    }
    
    // =========================================================================
    // BOUNDARY AUDIT - PRE_SCAN STAGE
    // =========================================================================
    // Log boundaries again before scanning to confirm they haven't changed
    log.info('BOUNDARY AUDIT (single source of truth: encoderLayout)', {
      version: actualVersion,
      stage: 'PRE_SCAN',
      source: 'ENCODER_DERIVED_ONLY',
      protection: {
        protectedBitEnd: encoderLayout.protectedBitEnd,
        protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
        originalDataLength: encoderLayout.originalDataLength,
      },
      controllable: {
        allowedBitStart: encoderLayout.allowedBitStart,
        allowedBitEnd: encoderLayout.allowedBitEnd,
        vectorsApplied: totalSelected,
        anyBlockOverBudget,
      },
    });

    // =========================================================================
    // CRITICAL: Protected-region byte verification (UNCONDITIONAL, FAIL-ON-VIOLATION)
    // =========================================================================
    // This verifies that ONLY suffix + padding codewords were modified (HYBRID requirement)
    // The original data bytes must remain unchanged.
    // Uses ENCODER-DERIVED boundaries, not calculated ones!
    
    // First, verify each block's protected bytes are unchanged
    // Protected region: bytes 0 to (paddingStartByte - 1) in the PRE-INTERLEAVED stream
    // We need to map this to per-block byte indices accounting for interleaving
    
    // Get per-block allowed bits using encoder-derived ranges
    const blockAllowedBits = mapAllowedRangesToBlocks(allowedBitRanges, actualVersion, ecc);
    
    let protectedBytesViolated = false;
    const violations: Array<{
      blockIdx: number;
      byteIdx: number;
      original: number;
      modified: number;
      localBitStart: number;
    }> = [];
    
    for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
      const originalData = blockDataArrays[blockIdx];
      const modifiedData = modifiedBlockData[blockIdx];
      const allowedBitsInBlock = blockAllowedBits.get(blockIdx) || new Set<number>();
      
      // Check EACH BIT individually - not just whole bytes
      // This catches boundary bytes that have both protected and allowed bits
      for (let byteIdx = 0; byteIdx < originalData.length; byteIdx++) {
        const originalByte = originalData[byteIdx];
        const modifiedByte = modifiedData[byteIdx];
        
        // Skip if byte is unchanged
        if (originalByte === modifiedByte) continue;
        
        // Check each bit in this byte
        for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
          const localBitIndex = byteIdx * 8 + bitIdx;
          
          // If this bit is NOT allowed (i.e., it's protected), check if it changed
          if (!allowedBitsInBlock.has(localBitIndex)) {
            // Extract the bit values (MSB first, so bit 0 is most significant)
            const originalBit = (originalByte >> (7 - bitIdx)) & 1;
            const modifiedBit = (modifiedByte >> (7 - bitIdx)) & 1;
            
            if (originalBit !== modifiedBit) {
              protectedBytesViolated = true;
              violations.push({
                blockIdx,
                byteIdx,
                original: originalData[byteIdx],
                modified: modifiedData[byteIdx],
                localBitStart: byteIdx * 8,
              });
              // Only record one violation per byte (to avoid spam)
              break;
            }
          }
        }
      }
      
      // Log block comparison for debugging
      const firstProtectedBytes = Math.min(24, originalData.length);
      log.debug('BLOCK HEAD BYTES (orig vs mod)', {
        blockIdx,
        blockDataBytes: originalData.length,
        allowedBitsCount: allowedBitsInBlock.size,
        origHead: Array.from(originalData.slice(0, firstProtectedBytes)),
        modHead: Array.from(modifiedData.slice(0, firstProtectedBytes)),
      });
    }
    
    if (protectedBytesViolated) {
      log.error('PROTECTED BYTES MODIFIED - HYBRID protection violation!', {
        violationCount: violations.length,
        violations: violations.slice(0, 10),
        protectedBitEnd: encoderLayout.protectedBitEnd,
        originalDataLength: encoderLayout.originalDataLength,
        note: 'Vectors modified original data bytes - algorithm bug!',
      });
      
      // FAIL FAST: Return base matrix since we can't trust the modified data
      log.error('FAILING FAST - returning base matrix due to protected byte violation');
      return {
        success: false,
        error: `Protected byte violation: ${violations.length} original data bytes were modified`,
        matrix: baseMatrix,
        moduleCount,
        version: actualVersion,
        maskPattern: actualMask,
        matchingPixels: 0,
        totalControllable: 0,
        matchPercentage: 0,
        encodedData: encodedData,
        originalData: data,
        suffix: actualSuffix,
      };
    }
    
    log.info('HYBRID protection validation PASSED (encoder-derived)', {
      protectedBitRange: `0 - ${encoderLayout.protectedBitEnd} (mode + charCount + original data)`,
      allowedBitRange: `${encoderLayout.allowedBitStart} - ${encoderLayout.allowedBitEnd} (suffix + padding)`,
      originalDataLength: encoderLayout.originalDataLength,
      suffixLength: encoderLayout.suffixLength,
      totalVectorsApplied: totalSelected,
      protectedBytesChecked: 'all blocks verified',
    });

    onProgress?.('Re-encoding QR code', 85);

    // DEBUG: Zero-modification test - verify that regenerating with UNMODIFIED data still scans
    const zeroModMatrix = regenerateQRFromModifiedData(
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask
    );
    const zeroModScan = scanMatrixWithJsQR(zeroModMatrix);
    if (!zeroModScan.success) {
      log.error('ZERO-MODIFICATION TEST FAILED - regeneration itself is broken!', {
        error: zeroModScan.error,
      });
    } else {
      // Compare against encodedData (the exact data we're encoding)
      const matchesData = zeroModScan.data === encodedData;
      
      if (matchesData) {
        log.debug('Zero-modification test PASSED - decoded data matches exactly', {
          decodedData: zeroModScan.data,
        });
      } else {
        log.error('Zero-modification test FAILED - decoded data mismatch!', {
          decodedData: zeroModScan.data,
          expectedData: encodedData,
        });
      }
    }

    // Log modification summary per block
    for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
      let bytesChanged = 0;
      let bitsChanged = 0;
      const origData = blockDataArrays[blockIdx];
      const modData = modifiedBlockData[blockIdx];
      const origEcc = blockEccArrays[blockIdx];
      const modEcc = modifiedBlockEcc[blockIdx];
      
      for (let i = 0; i < origData.length; i++) {
        if (origData[i] !== modData[i]) {
          bytesChanged++;
          // Count bits changed
          let diff = origData[i] ^ modData[i];
          while (diff) {
            bitsChanged += diff & 1;
            diff >>>= 1;
          }
        }
      }
      
      let eccBytesChanged = 0;
      for (let i = 0; i < origEcc.length; i++) {
        if (origEcc[i] !== modEcc[i]) {
          eccBytesChanged++;
        }
      }
      
      if (bytesChanged > 0 || eccBytesChanged > 0) {
        log.debug('Block modification summary', {
          blockIndex: blockIdx,
          dataBytesChanged: bytesChanged,
          dataBitsChanged: bitsChanged,
          eccBytesChanged,
          totalDataBytes: origData.length,
          totalEccBytes: origEcc.length,
        });
      }
    }

    // Step 10: Regenerate QR with modified data AND ECC to get a valid, scannable code
    // We pass the pre-XORed ECC - do NOT recompute it (that would break RS linearity)
    const finalMatrix = regenerateQRFromModifiedData(
      modifiedBlockData,
      modifiedBlockEcc,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask
    );

    // DEBUG: Log differences between base matrix and final matrix
    let diffCount = 0;
    let structuralDiffCount = 0;
    let dataDiffCount = 0;
    const sampleDiffs: Array<{ row: number; col: number; base: boolean; final: boolean; isStructural: boolean }> = [];
    
    // Build set of structural positions for quick lookup
    const structuralPositions = new Set<string>();
    // Finder patterns (7x7 at three corners + separators)
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        structuralPositions.add(`${r},${c}`); // Top-left
        structuralPositions.add(`${r},${moduleCount - 8 + c}`); // Top-right
        structuralPositions.add(`${moduleCount - 8 + r},${c}`); // Bottom-left
      }
    }
    // Timing patterns
    for (let i = 0; i < moduleCount; i++) {
      structuralPositions.add(`6,${i}`);
      structuralPositions.add(`${i},6`);
    }
    // Format info
    for (let i = 0; i < 9; i++) {
      structuralPositions.add(`${i},8`);
      structuralPositions.add(`8,${i}`);
      structuralPositions.add(`${moduleCount - 8 + i},8`);
      structuralPositions.add(`8,${moduleCount - 8 + i}`);
    }
    
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const baseVal = baseMatrix[row]?.[col] ?? false;
        const finalVal = finalMatrix[row]?.[col] ?? false;
        if (baseVal !== finalVal) {
          diffCount++;
          const isStructural = structuralPositions.has(`${row},${col}`);
          if (isStructural) {
            structuralDiffCount++;
          } else {
            dataDiffCount++;
          }
          if (sampleDiffs.length < 10) {
            sampleDiffs.push({ row, col, base: baseVal, final: finalVal, isStructural });
          }
        }
      }
    }

    log.info('Matrix diff between base and final', {
      diffCount,
      structuralDiffCount,
      dataDiffCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      diffPercent: `${((diffCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
      sampleDiffs: sampleDiffs.slice(0, 5),
    });

    // CRITICAL: If structural modules differ, that's a major bug
    if (structuralDiffCount > 0) {
      log.error('CRITICAL: Structural patterns modified!', {
        structuralDiffCount,
        structuralDiffs: sampleDiffs.filter(d => d.isStructural),
      });
    }

    // Comprehensive finder pattern validation
    const finderValidation = validateFinderPatterns(finalMatrix);
    if (!finderValidation.allValid) {
      log.error('FINDER PATTERNS CORRUPTED', {
        topLeft: finderValidation.topLeft,
        topRight: finderValidation.topRight,
        bottomLeft: finderValidation.bottomLeft,
        errors: finderValidation.errors,
      });
    } else {
      log.debug('Finder patterns validated OK');
    }

    // Timing pattern validation
    const timingValidation = validateTimingPatterns(finalMatrix);
    if (!timingValidation.allValid) {
      log.error('TIMING PATTERNS CORRUPTED', {
        horizontal: timingValidation.horizontal,
        vertical: timingValidation.vertical,
        errors: timingValidation.errors,
      });
    } else {
      log.debug('Timing patterns validated OK');
    }

    // Compare format info between base and final
    const baseFormatInfo = extractFormatInfo(baseMatrix);
    const finalFormatInfo = extractFormatInfo(finalMatrix);
    
    log.info('Format info comparison', {
      base: {
        vertical: baseFormatInfo.vertical.toString(2).padStart(15, '0'),
        horizontal: baseFormatInfo.horizontal.toString(2).padStart(15, '0'),
        match: baseFormatInfo.match,
      },
      final: {
        vertical: finalFormatInfo.vertical.toString(2).padStart(15, '0'),
        horizontal: finalFormatInfo.horizontal.toString(2).padStart(15, '0'),
        match: finalFormatInfo.match,
      },
      formatInfoUnchanged: baseFormatInfo.vertical === finalFormatInfo.vertical && 
                           baseFormatInfo.horizontal === finalFormatInfo.horizontal,
    });

    if (baseFormatInfo.vertical !== finalFormatInfo.vertical || 
        baseFormatInfo.horizontal !== finalFormatInfo.horizontal) {
      log.error('FORMAT INFO CHANGED - This will break scanning!');
    }

    // DEBUG: Scan the final matrix to verify it's actually scannable
    let scanResult = scanMatrixWithJsQR(finalMatrix);
    
    // Track the final matrix and vector count (may be updated by binary search fallback)
    let finalMatrixToUse = finalMatrix;
    let actualVectorsApplied = totalSelected;
    
    // =========================================================================
    // STRICT ACCEPTANCE CRITERIA (HYBRID mode)
    // =========================================================================
    // A valid QR-Art result requires:
    // 1. Decoder successfully scans the matrix (scanResult.success === true)
    // 2. Decoded data is long enough (length >= originalDataLength)
    // 3. Byte-exact match for the original data prefix
    //
    // We use byte-level comparison, not text-level, to catch subtle corruption.
    
    if (scanResult.success) {
      // Use strict byte-exact validation
      const validation = validateOriginalDataPreserved(scanResult.data, data);
      
      if (validation.valid) {
        // Log the decoded suffix to see how it was modified
        const decodedSuffix = scanResult.data?.slice(originalDataLength) || '';
        log.info('QR-Art matrix scan validation PASSED (byte-exact)', {
          originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
          originalDataLength,
          decodedDataLength: scanResult.data?.length,
          originalSuffix: actualSuffix.slice(0, 30) + (actualSuffix.length > 30 ? '...' : ''),
          decodedSuffix: decodedSuffix.slice(0, 30) + (decodedSuffix.length > 30 ? '...' : ''),
          suffixModified: decodedSuffix !== actualSuffix,
          scanAttempts: scanResult.attempts,
          validationMethod: 'BYTE_EXACT_PREFIX',
        });
      } else {
        // ORIGINAL DATA was corrupted - this should NOT happen with HYBRID!
        // Log with byte-level detail to find exactly where corruption occurred
        const expectedBytes = stringToBytes(data);
        const actualData = scanResult.data || '';
        const actualBytes = stringToBytes(actualData);
        
        log.error('ORIGINAL DATA CORRUPTED - byte-exact validation FAILED!', {
          expectedOriginal: data,
          actual: actualData,
          expectedLength: originalDataLength,
          actualLength: actualData.length,
          validationReason: validation.reason,
          mismatchDetails: validation.mismatch,
          note: 'The original URL/data was modified - this is a bug!',
        });
        
        log.error('DECODED BYTES (hex comparison)', {
          decodedPrefixHex: toHex(actualBytes.slice(0, originalDataLength)),
          expectedPrefixHex: toHex(expectedBytes),
          mismatchIndex: validation.mismatch?.index,
          expectedByte: validation.mismatch?.expectedByte?.toString(16),
          actualByte: validation.mismatch?.actualByte?.toString(16),
        });
        
        // Mark as failed - need fallback
        scanResult = { success: false, error: 'Byte-exact validation failed: ' + validation.reason };
      }
    }
    
    if (!scanResult.success) {
      log.error('QR-Art matrix scan validation FAILED - matrix does not scan!', {
        error: scanResult.error,
        expectedData: encodedData,
        scanAttempts: scanResult.attempts,
        finderPatternsOK: finderValidation.allValid,
        timingPatternsOK: timingValidation.allValid,
        formatInfoOK: baseFormatInfo.vertical === finalFormatInfo.vertical,
        structuralDiffsCount: structuralDiffCount,
        dataDiffsCount: dataDiffCount,
        controllableVectors: basis.vectors.length,
        controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      });
      
      // FALLBACK: Use binary search to find the maximum number of vectors
      // that still produces a scannable QR code
      log.info('Attempting binary search fallback to find scannable configuration');
      
      // Flatten selections and sort by importance (most important pixels first)
      const flattenedSelections = flattenAndOrderSelections(
        blockSelections,
        elimination,
        importance,
        moduleCount
      );
      
      // Create a regeneration function that captures the necessary parameters
      const regenerateFn = (
        blockData: Uint8Array[],
        blockEcc: Uint8Array[],
        dataCounts: number[],
        eccCounts: number[]
      ) => regenerateQRFromModifiedData(
        blockData,
        blockEcc,
        dataCounts,
        eccCounts,
        actualVersion,
        ecc,
        actualMask
      );
      
      // Run binary search - pass original data for PREFIX match validation (HYBRID mode)
      // HYBRID: We can modify suffix, so decoded data should START WITH original data
      const binarySearchResult = binarySearchMaxVectors(
        flattenedSelections,
        blockDataArrays,  // Original, unmodified data
        blockEccArrays,   // Original, unmodified ECC
        blockDataCounts,
        blockEccCounts,
        elimination,
        regenerateFn,
        scanMatrixWithJsQR,
        data  // HYBRID: prefix match validation (original data only)
      );
      
      if (binarySearchResult.maxCount > 0) {
        log.info('Binary search fallback successful', {
          originalVectors: totalSelected,
          usableVectors: binarySearchResult.maxCount,
          reductionPercent: `${((1 - binarySearchResult.maxCount / totalSelected) * 100).toFixed(1)}%`,
          iterations: binarySearchResult.iterations,
        });
        
        // Use the optimized matrix from binary search
        finalMatrixToUse = binarySearchResult.matrix;
        actualVectorsApplied = binarySearchResult.maxCount;
        
        // Re-scan to confirm and validate decoded content using STRICT byte-exact validation
        scanResult = scanMatrixWithJsQR(finalMatrixToUse);
        if (scanResult.success) {
          // HYBRID: Validate with byte-exact prefix match
          const postSearchValidation = validateOriginalDataPreserved(scanResult.data, data);
          if (postSearchValidation.valid) {
            log.info('Binary search result validated - original data preserved (byte-exact)', {
              originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
              decodedDataLength: scanResult.data?.length,
              validationMethod: 'BYTE_EXACT_PREFIX',
            });
          } else {
            log.error('Binary search result scans but ORIGINAL DATA CORRUPTED!', {
              expectedOriginal: data,
              actual: scanResult.data,
              validationReason: postSearchValidation.reason,
              mismatchDetails: postSearchValidation.mismatch,
            });
          }
        } else {
          log.error('Binary search result does not scan!', {
            error: scanResult.error,
          });
        }
      } else {
        // Even 0 vectors didn't help - return base matrix
        log.warn('Binary search found 0 usable vectors - returning base matrix', {
          iterations: binarySearchResult.iterations,
        });
        finalMatrixToUse = baseMatrix;
        actualVectorsApplied = 0;
      }
    }

    // Also scan the base matrix to confirm it was valid
    const baseScanResult = scanMatrixWithJsQR(baseMatrix);
    log.debug('Base matrix scan check', {
      success: baseScanResult.success,
      data: baseScanResult.data,
      error: baseScanResult.error,
      scanAttempts: baseScanResult.attempts,
    });

    onProgress?.('Validating result', 95);

    // Step 11: Count actual matching pixels in the final matrix
    // Use finalMatrixToUse which may have been updated by binary search fallback
    let matching = 0;
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const pixelIdx = row * moduleCount + col;
        if (!dataPixels.has(pixelIdx)) continue;

        const finalValue = finalMatrixToUse[row]?.[col] ?? false;
        const targetValue = targets[row]?.[col] ?? false;
        if (finalValue === targetValue) {
          matching++;
        }
      }
    }

    const matchPercentage = total > 0 ? (matching / total) * 100 : 0;

    log.info('QR-Art generation complete (HYBRID)', {
      matchingPixels: matching,
      totalControllable: total,
      matchPercentage: `${matchPercentage.toFixed(1)}%`,
      vectorsApplied: actualVectorsApplied,
      usedBinarySearchFallback: actualVectorsApplied < totalSelected,
      originalDataLength,
      suffixLength: actualSuffix.length,
      controllablePercent: `${actualControlPercentage.toFixed(1)}%`,
    });

    onProgress?.('Complete', 100);

    return {
      success: true,
      matrix: finalMatrixToUse,
      moduleCount,
      version: actualVersion,
      maskPattern: actualMask,
      matchingPixels: matching,
      totalControllable: total,
      matchPercentage,
      encodedData: encodedData,
      originalData: data,
      suffix: actualSuffix,
    };
  } catch (error) {
    log.error('QR-Art generation failed', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: encodedData,
      originalData: data,
      suffix: actualSuffix,
    };
  }
}

/**
 * Generate QR-Art trying all 8 mask patterns and selecting the best
 * Uses encoder-derived semantic layout for HYBRID protection.
 */
export async function generateFullQArtBestMask(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  let bestResult: FullQArtResult | null = null;
  
  // Pre-calculate optimal version and suffix for all mask comparisons
  // This ensures consistent encoding across all mask attempts
  const targetControlPercent = config.targetControlPercent ?? 50;
  const optimalConfig = calculateOptimalVersionAndSuffix(
    config.forceVersion ?? config.version,
    config.ecc,
    config.data.length,
    targetControlPercent
  );
  
  // Generate DETERMINISTIC suffix once for all masks (ensures consistent comparison)
  // Using deterministic generation ensures same suffix across runs for same input
  const sharedVersion = config.forceVersion ?? optimalConfig.version;
  let sharedSuffix: string;
  if (config.suffix !== undefined) {
    sharedSuffix = config.suffix;
  } else if (config.autoSuffix !== false) {
    const suffixCharCount = Math.max(0, optimalConfig.suffixLength - 1);
    const seed = hashStringToSeed(config.data + sharedVersion.toString() + config.ecc);
    sharedSuffix = '#' + generateDeterministicSuffix(suffixCharCount, seed);
  } else {
    sharedSuffix = '';
  }
  
  log.info('Pre-selected version and DETERMINISTIC suffix for mask comparison (HYBRID mode)', {
    sharedVersion,
    originalDataLength: config.data.length,
    suffixLength: sharedSuffix.length,
    suffixWasCapped: optimalConfig.suffixWasCapped,
    paddingBytes: optimalConfig.paddingBytes,
    expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
    note: 'Each mask will use the same DETERMINISTIC suffix for fair comparison',
  });

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      forceVersion: sharedVersion,  // Use same version for all masks
      suffix: sharedSuffix,          // Use same suffix for fair comparison
      autoSuffix: false,             // Disable auto-suffix since we pre-generated it
      maskPattern: mask,
      onProgress: (stage, percent) => {
        config.onProgress?.(`Mask ${mask}: ${stage}`, (mask * 100 + percent) / 8);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    }
  }

  if (!bestResult) {
    return {
      success: false,
      error: 'All mask patterns failed',
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: config.data + sharedSuffix,
      originalData: config.data,
      suffix: sharedSuffix,
    };
  }

  log.info('Best mask pattern selected', {
    maskPattern: bestResult.maskPattern,
    matchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
  });

  return bestResult;
}

/**
 * Generate QR-Art trying multiple rotations of the target image
 */
export async function generateFullQArtBestRotation(
  config: FullQArtConfig
): Promise<FullQArtResult> {
  // For now, just use the base implementation
  // TODO: Implement image rotation and try 0, 90, 180, 270 degrees
  return generateFullQArt(config);
}

/**
 * Generate QR-Art with optimal settings (best mask, rotation, etc.)
 */
export async function generateFullQArtOptimal(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  // Use best mask selection
  return generateFullQArtBestMask(config);
}
