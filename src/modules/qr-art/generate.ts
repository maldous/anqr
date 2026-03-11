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
import { type DecodedSegmentInfo, decodeQR } from '../qr-decoder';
import { qrcode } from '../qr-encoder';
import { qrBitBuffer } from '../qr-encoder/bit-buffer';
import { qr8BitByte, qrNumber } from '../qr-encoder/data-modes';
import { createQRInstanceWithSegments, type MaskPattern } from '../qr-encoder/encoder-api';
import { getRSBlocks } from '../qr-encoder/rs-blocks';
import { QRErrorCorrectionLevel, QRMode } from '../qr-encoder/types';
import {
  getBCHTypeInfo,
  getBCHTypeNumber,
  getLengthInBits,
  getPatternPosition,
} from '../qr-encoder/utils';
import { getMaskFunction } from '../qr-spec/masks';
import { buildBitPixelMap, type ECCLevel, getDataPixelIndices } from './bit-mapping';
import {
  applyAllSelectedVectors,
  type BlockSelectionResult,
  countMatchingPixels,
  gaussJordanEliminate,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
  type EliminationResult,
} from './elimination';
import { mapImageToTargetsSupersampled } from './image-utils';
import {
  buildFullBasis,
  calculateOptimalVersionAndSuffix,
  computeECC,
  generateDeterministicNumericSuffix,
  generateDeterministicSuffix,
  hashStringToSeed,
  MIN_QART_VERSION,
} from './rs-basis';
import {
  binarySearchMaxVectors,
  type FlattenedSelection,
  flattenAndOrderSelections,
  flattenAndOrderSelectionsLimited,
} from './scan-fallback';
import {
  type BitRange,
  calculateVersionForSlack,
  mapAllowedRangesToBlocks,
} from './semantic-layout';
import {
  eccNumericToLevel,
  extractFormatInfo,
  extractMaskFromMatrix,
  type RejectionReason,
  type SemanticValidationResult,
  validateNumericSuffix,
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from './validation';
import { acquireUint8Buffer, releaseUint8Buffer } from './buffer-pool';

// Re-export BitRange for use in EncoderDerivedLayout
export type { BitRange } from './semantic-layout';

// Re-export validation utilities for backwards compatibility
export {
  type ECCLevel,
  eccNumericToLevel,
  extractFormatInfo,
  extractMaskFromMatrix,
  type FormatVerificationResult,
  type RejectionReason,
  readFormatInfoFromDecoder,
  type SemanticValidationResult,
  VALID_SUFFIX_CHARS,
  validateNumericSuffix,
  validateSuffixCharset,
  verifyMatrixFormatInfo,
} from './validation';

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
    bytes[i] = str.codePointAt(i)! & 0xff;
  }
  return bytes;
}

/**
 * Convert bytes to hex string for debugging
 */
function toHex(bytes: Uint8Array, maxBytes: number = 32): string {
  const slice = bytes.slice(0, maxBytes);
  const hex = Array.from(slice)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
  return bytes.length > maxBytes ? `${hex}...` : hex;
}

const BALANCED_MASK_EARLY_EXIT_THRESHOLD = 92;
const BALANCED_MASK_STALL_WINDOW = 3;
const BALANCED_MASK_STALL_DELTA = 0.35;

type QArtPerformanceSettings = {
  supersampleLevel: 1 | 2 | 3;
  maxCandidateFraction: number;
  maxDarkSpeckleArea: number;
  maxLightHoleArea: number;
};

function resolvePerformanceSettings(profile: QArtPerformanceProfile): QArtPerformanceSettings {
  if (profile === 'quality') {
    return {
      supersampleLevel: 3,
      maxCandidateFraction: 1,
      maxDarkSpeckleArea: 2,
      maxLightHoleArea: 2,
    };
  }

  return {
    supersampleLevel: 1,
    maxCandidateFraction: 0.25,
    maxDarkSpeckleArea: 2,
    maxLightHoleArea: 2,
  };
}

/**
 * Find the first byte index where two strings differ (in the protected region)
 */
function _findFirstMismatch(
  expected: string,
  actual: string,
  protectedLength: number
): { index: number; expected: number; actual: number } | null {
  const len = Math.min(protectedLength, expected.length, actual.length);
  for (let i = 0; i < len; i++) {
    if (expected.codePointAt(i) !== actual.codePointAt(i)!) {
      return {
        index: i,
        expected: expected.codePointAt(i)!,
        actual: actual.codePointAt(i)!,
      };
    }
  }
  // Check if lengths differ in protected region
  if (actual.length < protectedLength) {
    return {
      index: actual.length,
      expected: expected.codePointAt(actual.length)! || 0,
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
      reason: `decoded length (${decoded.length}) < original length (${originalData.length})`,
    };
  }

  // Byte-exact comparison for the protected prefix
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;

    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: `byte mismatch at index ${i}`,
        mismatch: {
          index: i,
          expectedByte,
          actualByte,
          expectedChar: String.fromCodePoint(expectedByte),
          actualChar: String.fromCodePoint(actualByte),
        },
      };
    }
  }

  return { valid: true };
}

function semanticFailure(
  reason: RejectionReason,
  description: string,
  details?: SemanticValidationResult['details']
): SemanticValidationResult {
  return {
    valid: false,
    reason,
    description,
    details,
  };
}

function validateDecodedPrefix(
  decoded: string,
  originalData: string
): SemanticValidationResult | null {
  if (decoded.length < originalData.length) {
    return semanticFailure(
      'LENGTH_TOO_SHORT',
      `Decoded length ${decoded.length} < original length ${originalData.length}`,
      {
        expectedLength: originalData.length,
        actualLength: decoded.length,
      }
    );
  }

  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.codePointAt(i)!;
    const actualByte = decoded.codePointAt(i)!;
    if (expectedByte !== actualByte) {
      return semanticFailure(
        'BYTE_MISMATCH',
        `Byte mismatch at index ${i}: expected 0x${expectedByte.toString(16)}, got 0x${actualByte.toString(16)}`,
        {
          mismatchIndex: i,
          expectedByte,
          actualByte,
        }
      );
    }
  }

  return null;
}

function validateSuffixForSemanticGate(
  decoded: string,
  originalDataLength: number,
  expectedSuffix: string | undefined,
  strictSuffix: boolean,
  suffixMode: 'byte' | 'numeric'
): SemanticValidationResult | null {
  if (expectedSuffix === undefined || decoded.length <= originalDataLength) {
    return null;
  }

  const actualSuffix = decoded.slice(originalDataLength);
  const charsetValidation =
    suffixMode === 'numeric'
      ? validateNumericSuffix(actualSuffix)
      : validateSuffixCharset(actualSuffix);

  if (charsetValidation.valid) {
    return null;
  }

  if (strictSuffix) {
    return semanticFailure(
      'SUFFIX_CHARSET_INVALID',
      `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
      {
        mismatchIndex: originalDataLength + (charsetValidation.invalidCharIndex ?? 0),
        actualByte: charsetValidation.invalidCharCode,
      }
    );
  }

  log.debug('Suffix charset violation (accepted - strictSuffix=false)', {
    invalidCharIndex: charsetValidation.invalidCharIndex,
    invalidChar: charsetValidation.invalidChar,
    invalidCharCode: charsetValidation.invalidCharCode,
    suffixPreview: actualSuffix.slice(0, 30),
  });
  return null;
}

/**
 * SEMANTIC-HARD-GATE VALIDATION
 *
 * This is the acceptance criteria for QR-Art candidates.
 * A candidate is ONLY accepted if ALL of the following HARD GATE checks pass:
 *
 * 1. Decoder successfully scanned the matrix
 * 2. Decoded data length >= original data length
 * 3. First N bytes match exactly (N = original data length)
 * 4. Format info ECC matches requested ECC
 * 5. Format info mask matches requested mask
 * 6. Structural validity (no fake segments)
 *
 * SOFT PENALTY (does NOT cause rejection unless strictSuffix=true):
 * - Suffix charset violations (non-URL-safe bytes in suffix)
 *
 * The HYBRID mode intentionally allows the suffix to be mutated.
 * Rejecting candidates for suffix charset violations defeats the purpose
 * of QArt - we WANT to allow arbitrary byte values in the suffix for
 * maximum pixel control.
 *
 * This function performs comprehensive validation and returns
 * detailed rejection reasons for debugging.
 *
 * @param matrix The QR matrix to validate
 * @param originalData The original data that must be preserved
 * @param expectedEcc The requested ECC level
 * @param expectedMask The requested mask pattern
 * @param expectedSuffix Optional: the expected suffix (for HYBRID mode)
 * @param scanFn Function to scan the matrix
 * @param strictSuffix If true, reject candidates with non-URL-safe suffix bytes (default: false)
 * @returns Comprehensive validation result
 */
function performSemanticValidation(
  matrix: boolean[][],
  originalData: string,
  expectedEcc: ECCLevel,
  expectedMask: number,
  expectedSuffix: string | undefined,
  scanFn: (matrix: boolean[][]) => ScanResult,
  strictSuffix: boolean = false,
  suffixMode: 'byte' | 'numeric' = 'byte'
): SemanticValidationResult {
  // Step 1: Scan the matrix
  const scanResult = scanFn(matrix);

  if (!scanResult.success) {
    return semanticFailure('SCAN_FAILED', `Scan failed: ${scanResult.error}`);
  }

  const decoded = scanResult.data;

  // Step 2: Check decoded data exists and has sufficient length
  if (decoded === undefined || decoded === null) {
    return semanticFailure('SCAN_FAILED', 'Decoded data is null/undefined');
  }

  const prefixValidationError = validateDecodedPrefix(decoded, originalData);
  if (prefixValidationError) {
    return prefixValidationError;
  }

  // Step 4: Verify format info (ECC and mask)
  const formatInfo = extractMaskFromMatrix(matrix);
  const actualEccLevel = eccNumericToLevel(formatInfo.eccLevel);

  if (actualEccLevel !== expectedEcc) {
    return semanticFailure(
      'ECC_MISMATCH',
      `Format ECC mismatch: expected ${expectedEcc}, got ${actualEccLevel}`,
      {
        expectedEcc,
        actualEcc: actualEccLevel,
      }
    );
  }

  if (formatInfo.mask !== expectedMask) {
    return semanticFailure(
      'MASK_MISMATCH',
      `Format mask mismatch: expected ${expectedMask}, got ${formatInfo.mask}`,
      {
        expectedMask,
        actualMask: formatInfo.mask,
      }
    );
  }

  // Step 5: Validate suffix charset (soft penalty unless strictSuffix=true).
  const suffixValidationError = validateSuffixForSemanticGate(
    decoded,
    originalData.length,
    expectedSuffix,
    strictSuffix,
    suffixMode
  );
  if (suffixValidationError) {
    return suffixValidationError;
  }

  // Step 6: Verify structural validity (no extra fake segments after primary data)
  // This catches the "byte segment ok, then fake Kanji" pattern that occurs when
  // terminator bits get flipped to fake mode indicators
  if (scanResult.structurallyValid === false) {
    // Get segment info for detailed error message
    const segmentModes = scanResult.segments?.map((s) => s.modeName) ?? [];
    const _invalidSegments = scanResult.segments?.filter((s) => !s.valid) ?? [];

    return semanticFailure(
      'EXTRA_SEGMENT',
      `Extra/fake segment(s) detected after primary data (modes: ${segmentModes.join(', ')})`,
      {
        segmentCount: scanResult.segmentCount,
      }
    );
  }

  // All checks passed!
  return {
    valid: true,
  };
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
 *
 * CRITICAL FIX: The mutable region is split into TWO SEPARATE BYTE-ALIGNED INTERVALS:
 * 1. Suffix BYTES only (complete bytes, not including the boundary byte with terminator)
 * 2. Padding codeword BYTES only (the 0xEC 0x11 pattern)
 *
 * The GAP between these intervals (terminator + pad-to-byte) is PROTECTED and NEVER modified.
 * This prevents the decoder from seeing fake mode indicators when terminator bits flip.
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
  /** Length of suffix (0 if no suffix). For numeric mode, this is digits only. */
  suffixLength: number;
  /** Suffix encoding mode */
  suffixMode: 'byte' | 'numeric';
  /** Protected bit range (mode + charCount + original data bytes only) */
  protectedBitEnd: number;

  // =========================================================================
  // TWO-INTERVAL SAFE MUTATION REGIONS (byte-aligned, excludes terminator)
  // =========================================================================

  /** INTERVAL 1: Safe suffix bit range start (byte-aligned, after protection) */
  suffixSafeStartBit: number;
  /** INTERVAL 1: Safe suffix bit range end (byte-aligned, before terminator boundary byte) */
  suffixSafeEndBit: number;
  /** INTERVAL 2: Safe padding bit range start (byte-aligned, after pad-to-byte) */
  paddingSafeStartBit: number;
  /** INTERVAL 2: Safe padding bit range end (byte-aligned, end of data capacity) */
  paddingSafeEndBit: number;

  /** The GAP between suffix and padding that contains terminator + pad-to-byte (PROTECTED) */
  gapStartBit: number;
  /** End of the protected gap */
  gapEndBit: number;
  /** Number of bits in the protected gap (terminator + pad-to-byte) */
  gapBitCount: number;

  /** The two allowed bit ranges for mutation (suffix bytes + padding bytes) */
  allowedBitRanges: BitRange[];

  // Legacy fields (kept for backwards compatibility)
  /** @deprecated Use suffixSafeStartBit instead */
  allowedBitStart: number;
  /** @deprecated Use paddingSafeEndBit instead */
  allowedBitEnd: number;
  /** Number of controllable suffix bits (in safe range only) */
  suffixBits: number;
  /** Number of controllable padding bits */
  paddingBits: number;
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

// DecodedSegmentInfo is imported from '../qr-decoder'

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
  /** Whether the decoder reported fully valid structure (no truncated/fake segments) */
  structurallyValid?: boolean;
  /** Number of segments decoded (including terminator if found) */
  segmentCount?: number;
  /** Array of segment info for each decoded segment */
  segments?: DecodedSegmentInfo[];
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
 *
 * STRUCTURAL VALIDITY:
 * The result includes `structurallyValid` to indicate if the QR code has a clean
 * segment structure (no truncated/fake segments after the primary data).
 * When terminator bits get flipped to fake mode indicators (like 0x8 = Kanji),
 * structurallyValid will be false even if data was extracted.
 */
function fillModuleBlock(
  data: Uint8ClampedArray,
  size: number,
  startX: number,
  startY: number,
  scale: number,
  color: number
): void {
  for (let py = 0; py < scale; py++) {
    for (let px = 0; px < scale; px++) {
      const idx = ((startY + py) * size + (startX + px)) * 4;
      data[idx] = color;
      data[idx + 1] = color;
      data[idx + 2] = color;
    }
  }
}

function renderMatrixToImageData(
  matrix: boolean[][],
  moduleCount: number,
  scale: number,
  quietZone: number,
  invert: boolean
): ImageData {
  const size = (moduleCount + quietZone * 2) * scale;
  const data = new Uint8ClampedArray(size * size * 4);

  const bgColor = invert ? 0 : 255;
  const fgColor = invert ? 255 : 0;
  for (let i = 0; i < data.length; i += 4) {
    data[i] = bgColor;
    data[i + 1] = bgColor;
    data[i + 2] = bgColor;
    data[i + 3] = 255;
  }

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const isDark = matrix[row]?.[col] ?? false;
      if (isDark) {
        const startX = (col + quietZone) * scale;
        const startY = (row + quietZone) * scale;
        fillModuleBlock(data, size, startX, startY, scale, fgColor);
      }
    }
  }

  return new ImageData(data, size, size);
}

function hasExtraInvalidSegments(segments: DecodedSegmentInfo[]): boolean {
  return segments.some((seg, idx) => {
    if (idx === 0) return false;
    if (seg.modeName === 'terminator') return false;
    return !seg.valid || seg.modeName === 'unknown';
  });
}

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

    try {
      const imageData = renderMatrixToImageData(matrix, moduleCount, scale, quietZone, invert);
      const result = decodeQR(imageData, {
        inversionAttempts: 'attemptBoth',
      });

      if (result && result.data !== null) {
        // Extract segment info for structural validation
        const segments: DecodedSegmentInfo[] =
          result.segments?.map((s) => ({
            index: s.index,
            mode: s.mode,
            modeName: s.modeName,
            charCount: s.charCount,
            decodedLength: s.decodedLength,
            valid: s.valid,
            bitOffset: s.bitOffset,
          })) ?? [];

        // structurallyValid = decoder said valid AND no extra invalid segments detected
        const structurallyValid =
          (result.structurallyValid ?? true) && !hasExtraInvalidSegments(segments);

        return {
          success: true,
          data: result.data,
          attempts,
          structurallyValid,
          segmentCount: result.segmentCount ?? segments.length,
          segments,
        };
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
export type QArtPerformanceProfile = 'quality' | 'balanced';

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
   *
   * For suffixMode = "byte": include the leading '#' (e.g. "#ABC123").
   * For suffixMode = "numeric": provide digits only (e.g. "123456").
   */
  suffix?: string;
  /**
   * Suffix encoding mode.
   * - "numeric": mixed-mode encoding (byte prefix + numeric suffix).
   * - "byte": single byte-mode segment (legacy).
   * - "auto": prefer numeric for URLs, otherwise byte.
   */
  suffixMode?: 'numeric' | 'byte' | 'auto';
  /**
   * Whether to auto-generate a suffix when none is provided (default: true).
   *
   * When true: Automatically adds a fragment suffix to fill QR capacity.
   * When false: Only padding bits are controllable (very limited).
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
   * Target control percentage for auto-suffix generation (default: 100).
   * A larger QR version may be selected to achieve this control level,
   * unless lockVersionToMinimum is enabled.
   * Higher values = more controllable pixels = better image quality.
   */
  targetControlPercent?: number;
  /**
   * Number of full search attempts (different deterministic suffix seeds).
   * Higher values improve chances of cleaner artwork at higher compute cost.
   */
  searchAttempts?: number;
  /**
   * Base seed used when exploring multiple search attempts.
   * Keeps results deterministic for same inputs.
   */
  searchSeed?: number;
  /**
   * If true and version=0, lock to the minimum version that fits the payload
   * and only adjust suffix length within that version (no auto-upgrade).
   */
  lockVersionToMinimum?: boolean;
  /**
   * Whether to enforce strict suffix charset validation (default: true).
   *
   * When true (default, recommended for real-world scanning):
   * - Suffix must contain only URL-safe characters (byte mode)
   * - Numeric mode requires digits only
   *
   * When false:
   * - Suffix bytes can be ANY byte value (including non-printable)
   * - May produce more visually accurate QR-Art
   * - Risk of binary garbage in the decoded URL suffix
   */
  strictSuffix?: boolean;
  /**
   * Performance profile for QR-Art compute.
   * - "quality": maximize visual matching (higher compute cost)
   * - "balanced": reduce compute for faster previews with stable scan quality
   */
  performanceProfile?: QArtPerformanceProfile;
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
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
  /** Rejection reason if failed */
  rejectionReason?: RejectionReason;
  /** Details about the failure (e.g., expected vs actual values) */
  errorDetails?: {
    expectedEcc?: ECCLevel;
    actualEcc?: ECCLevel;
    expectedMask?: number;
    actualMask?: number;
  };
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

// Note: eccNumericToLevel is defined and exported above

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
function createQREncoderForGenerate(
  data: string,
  originalDataLength: number,
  suffixMode: 'byte' | 'numeric',
  ecc: ECCLevel,
  version: number,
  mask: number | undefined
): { getModuleCount: () => number; isDark: (row: number, col: number) => boolean } {
  if (suffixMode === 'numeric') {
    return createQRInstanceWithSegments(
      [
        { data: data.slice(0, originalDataLength), mode: 'byte' as const },
        ...(data.slice(originalDataLength).length > 0
          ? [{ data: data.slice(originalDataLength), mode: 'numeric' as const }]
          : []),
      ],
      ecc,
      version,
      { maskPattern: mask as MaskPattern }
    );
  }
  const instance = qrcode(version, ecc);
  instance.addData(data);
  instance.make(mask);
  return instance;
}

function extractActualMaskPattern(
  qr: { isDark: (row: number, col: number) => boolean },
  moduleCount: number,
  ecc: ECCLevel,
  maskPattern: number
): number {
  if (maskPattern >= 0) return maskPattern;

  const tempMatrix: boolean[][] = [];
  for (let r = 0; r < moduleCount; r++) {
    tempMatrix[r] = [];
    for (let c = 0; c < moduleCount; c++) {
      tempMatrix[r][c] = qr.isDark(r, c);
    }
  }

  const extracted = extractMaskFromMatrix(tempMatrix);
  const actualMask = extracted.mask;

  const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);
  if (extractedEccLevel !== ecc) {
    log.warn('FORMAT_PARSER_DISAGREEMENT: Decoder extracted different ECC than requested', {
      requested: ecc,
      extracted: extractedEccLevel,
      extractedNumeric: extracted.eccLevel,
      action: 'CONTINUE_WITH_ENCODER_ECC',
      note: 'Encoder-requested ECC is authoritative. Final scan validates correctness.',
    });
  }

  log.info('Extracted actual mask from encoder (auto-mask mode)', {
    extractedMask: actualMask,
    extractedEcc: extractedEccLevel,
    formatInfoValid: extracted.isValid,
    formatInfoMatch: extracted.formatInfoMatch,
    eccParserAgreement: extractedEccLevel === ecc,
  });

  return actualMask;
}

function logFormatVerificationDiagnostic(
  matrix: boolean[][],
  ecc: ECCLevel,
  actualMask: number
): void {
  const formatVerification = verifyMatrixFormatInfo(matrix, ecc, actualMask);
  if (formatVerification.valid) {
    log.debug('Base matrix format verification passed', { ecc, mask: actualMask });
  } else {
    log.warn(
      'FORMAT_PARSER_DISAGREEMENT: Base matrix format verification disagreement (diagnostic)',
      {
        expectedEcc: ecc,
        extractedEcc: formatVerification.extractedEcc,
        eccMatch: formatVerification.eccMatch,
        expectedMask: actualMask,
        extractedMask: formatVerification.extractedMask,
        maskMatch: formatVerification.maskMatch,
        parserDisagreement: formatVerification.reason,
        action: 'CONTINUE_TO_SCAN_VALIDATION',
        note: 'Encoder is authoritative. Base matrix scan validation is the real gate.',
      }
    );
  }
}

function logMatrixMismatchDiagnostic(
  matrix: boolean[][],
  data: string,
  originalDataLength: number,
  suffixMode: 'byte' | 'numeric',
  ecc: ECCLevel,
  actualVersion: number,
  actualMask: number,
  moduleCount: number
): void {
  const debugQr = createQREncoderForGenerate(
    data,
    originalDataLength,
    suffixMode,
    ecc,
    actualVersion,
    actualMask
  );

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
    log.warn('Total matrix mismatches', {
      mismatchCount,
      moduleCount,
      totalModules: moduleCount * moduleCount,
      mismatchPercent: `${((mismatchCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    });
  } else {
    log.info('Matrix validation passed - regenerated matrix matches encoder exactly');
  }
}

function generateBaseQR(
  data: string,
  version: number,
  ecc: ECCLevel,
  maskPattern: number,
  originalDataLength: number,
  suffixMode: 'byte' | 'numeric'
): BaseQRResult {
  // Log the exact data being encoded for debugging
  log.debug('generateBaseQR called', {
    dataLength: data.length,
    dataPreview: data.length > 80 ? `${data.slice(0, 80)}...` : data,
    dataHash: data
      .split('')
      .reduce((a, c) => Math.trunc((a << 5) - a + (c.codePointAt(0) ?? 0)), 0)
      .toString(16),
    version,
    ecc,
    maskPattern,
  });

  // First, use the encoder to determine the actual version if auto-detecting
  const useMask = maskPattern >= 0 ? maskPattern : undefined;
  const qr = createQREncoderForGenerate(
    data,
    originalDataLength,
    suffixMode,
    ecc,
    version,
    useMask
  );

  const moduleCount = qr.getModuleCount();
  const actualVersion = version > 0 ? version : Math.ceil((moduleCount - 17) / 4);

  const actualMask = extractActualMaskPattern(qr, moduleCount, ecc, maskPattern);

  // Get the actual encoded data bytes and compute ECC using the encoder's bit buffer
  // This is critical - we need the real data bytes AND their ECC for RS linearity
  // Also captures the ACTUAL semantic bit positions from the encoder
  // HYBRID MODE: Pass originalDataLength to track protection boundaries
  const plan: QArtEncodingPlan =
    suffixMode === 'numeric'
      ? {
          mode: 'numeric',
          prefix: data.slice(0, originalDataLength),
          suffix: data.slice(originalDataLength),
          originalDataLength,
          suffixLength: data.length - originalDataLength,
        }
      : {
          mode: 'byte',
          fullData: data,
          originalDataLength,
          suffixLength: data.length - originalDataLength,
        };

  const { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts, encoderLayout } =
    encodeDataToBytes(plan, actualVersion, ecc);

  // DEBUG: Verify that computeECC produces the same ECC as the encoder
  for (let i = 0; i < blockDataArrays.length; i++) {
    const testEcc = computeECC(blockDataArrays[i], blockEccCounts[i]);
    const encoderEcc = blockEccArrays[i];
    if (arraysEqual(testEcc, encoderEcc)) {
      log.debug('ECC verification passed for block', { blockIndex: i });
    } else {
      log.warn('ECC MISMATCH - computeECC differs from encoder!', {
        blockIndex: i,
        dataCount: blockDataCounts[i],
        eccCount: blockEccCounts[i],
        computeEccFirst5: Array.from(testEcc.slice(0, 5)),
        encoderEccFirst5: Array.from(encoderEcc.slice(0, 5)),
      });
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

  // DIAGNOSTIC VERIFICATION + DEBUG: Compare matrices
  logFormatVerificationDiagnostic(matrix, ecc, actualMask);
  logMatrixMismatchDiagnostic(
    matrix,
    data,
    originalDataLength,
    suffixMode,
    ecc,
    actualVersion,
    actualMask,
    moduleCount
  );

  return {
    success: true,
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
type QArtEncodingPlan =
  | {
      mode: 'byte';
      fullData: string;
      originalDataLength: number;
      suffixLength: number;
    }
  | {
      mode: 'numeric';
      prefix: string;
      suffix: string;
      originalDataLength: number;
      suffixLength: number;
    };

function computeNumericGroupSafeBits(
  suffixLength: number,
  numericDataStart: number,
  buffer: { getAt: (index: number) => boolean }
): boolean[] {
  const numericDataBits = getNumericBitsCount(suffixLength);
  const safeBits: boolean[] = new Array(numericDataBits).fill(false);

  let bitCursor = numericDataStart;
  let remaining = suffixLength;
  let localIndex = 0;

  while (remaining > 0) {
    const groupDigits = Math.min(3, remaining);
    const bitsPerGroup = groupDigits === 3 ? 10 : groupDigits === 2 ? 7 : 4;

    let value = 0;
    for (let j = 0; j < bitsPerGroup; j++) {
      value = (value << 1) | (buffer.getAt(bitCursor + j) ? 1 : 0);
    }

    const maxVal = getNumericGroupMax(bitsPerGroup);
    for (let j = 0; j < bitsPerGroup; j++) {
      const mask = 1 << (bitsPerGroup - 1 - j);
      const flipped = value ^ mask;
      if (flipped <= maxVal) {
        safeBits[localIndex + j] = true;
      }
    }

    bitCursor += bitsPerGroup;
    localIndex += bitsPerGroup;
    remaining -= groupDigits;
  }

  return safeBits;
}

function collectSafeBitRanges(
  safeBits: boolean[],
  numericDataStart: number
): { ranges: BitRange[]; safeBitCount: number } {
  const ranges: BitRange[] = [];
  let safeBitCount = 0;
  let inRange = false;
  let start = 0;

  for (let i = 0; i < safeBits.length; i++) {
    if (safeBits[i]) {
      safeBitCount++;
      if (!inRange) {
        inRange = true;
        start = i;
      }
    } else if (inRange) {
      ranges.push({ startBit: numericDataStart + start, endBit: numericDataStart + i });
      inRange = false;
    }
  }

  if (inRange) {
    ranges.push({
      startBit: numericDataStart + start,
      endBit: numericDataStart + safeBits.length,
    });
  }

  return { ranges, safeBitCount };
}

function buildNumericSafeRangesForEncoder(
  bitsAfterOriginalData: number,
  suffixLength: number,
  version: number,
  buffer: { getAt: (index: number) => boolean }
): { ranges: BitRange[]; safeBitCount: number } {
  const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  const numericDataStart = bitsAfterOriginalData + 4 + numericCharCountBits;
  const safeBits = computeNumericGroupSafeBits(suffixLength, numericDataStart, buffer);
  return collectSafeBitRanges(safeBits, numericDataStart);
}

interface SegmentWriteResult {
  bitsAfterMode: number;
  bitsAfterCharCount: number;
  bitsAfterOriginalData: number;
  bitsAfterData: number;
  originalDataPreview: string;
  suffixPreview: string;
  fullDataLength: number;
}

function writeSegmentsToBuffer(
  plan: QArtEncodingPlan,
  buffer: ReturnType<typeof qrBitBuffer>,
  version: number
): SegmentWriteResult {
  if (plan.mode === 'numeric') {
    const prefixSegment = qr8BitByte(plan.prefix);
    buffer.put(prefixSegment.getMode(), 4);
    const bitsAfterMode = buffer.getLengthInBits();
    buffer.put(prefixSegment.getLength(), getLengthInBits(prefixSegment.getMode(), version));
    const bitsAfterCharCount = buffer.getLengthInBits();
    prefixSegment.write(buffer);
    const bitsAfterOriginalData = buffer.getLengthInBits();

    if (plan.suffix.length > 0) {
      const suffixSegment = qrNumber(plan.suffix);
      buffer.put(suffixSegment.getMode(), 4);
      buffer.put(suffixSegment.getLength(), getLengthInBits(suffixSegment.getMode(), version));
      suffixSegment.write(buffer);
    }

    return {
      bitsAfterMode,
      bitsAfterCharCount,
      bitsAfterOriginalData,
      bitsAfterData: buffer.getLengthInBits(),
      originalDataPreview:
        plan.prefix.slice(0, Math.min(60, plan.prefix.length)) +
        (plan.prefix.length > 60 ? '...' : ''),
      suffixPreview: plan.suffix.slice(0, 20) + (plan.suffix.length > 20 ? '...' : ''),
      fullDataLength: plan.prefix.length + plan.suffix.length,
    };
  }

  const segment = qr8BitByte(plan.fullData);
  buffer.put(segment.getMode(), 4);
  const bitsAfterMode = buffer.getLengthInBits();
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  const bitsAfterCharCount = buffer.getLengthInBits();
  const bitsAfterOriginalData = bitsAfterCharCount + plan.originalDataLength * 8;
  segment.write(buffer);

  return {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData: buffer.getLengthInBits(),
    originalDataPreview:
      plan.fullData.slice(0, Math.min(60, plan.originalDataLength)) +
      (plan.originalDataLength > 60 ? '...' : ''),
    suffixPreview:
      plan.fullData.slice(plan.originalDataLength, plan.originalDataLength + 20) +
      (plan.fullData.length - plan.originalDataLength > 20 ? '...' : ''),
    fullDataLength: plan.fullData.length,
  };
}

function computeTwoIntervalSafeRanges(
  bitsAfterOriginalData: number,
  bitsAfterData: number,
  paddingStartByte: number,
  totalDataCount: number,
  suffixMode: 'byte' | 'numeric',
  suffixLength: number,
  version: number,
  buffer: { getAt: (index: number) => boolean }
): {
  protectedBitEnd: number;
  suffixSafeStartBit: number;
  suffixSafeEndBit: number;
  paddingSafeStartBit: number;
  paddingSafeEndBit: number;
  gapStartBit: number;
  gapEndBit: number;
  gapBitCount: number;
  suffixSafeBits: number;
  paddingSafeBits: number;
  allowedBitRanges: BitRange[];
} {
  const protectedBitEnd = Math.ceil(bitsAfterOriginalData / 8) * 8;
  const suffixSafeStartBit = protectedBitEnd;
  const suffixSafeEndBit = Math.floor(bitsAfterData / 8) * 8;
  const paddingSafeStartBit = paddingStartByte * 8;
  const paddingSafeEndBit = totalDataCount * 8;
  const gapStartBit = suffixSafeEndBit;
  const gapEndBit = paddingSafeStartBit;
  const gapBitCount = gapEndBit - gapStartBit;

  let numericSafeBitCount = 0;
  let numericSafeRanges: BitRange[] = [];
  if (suffixMode === 'numeric' && suffixLength > 0) {
    const numericSafe = buildNumericSafeRangesForEncoder(
      bitsAfterOriginalData,
      suffixLength,
      version,
      buffer
    );
    numericSafeRanges = numericSafe.ranges
      .map((range) => ({
        startBit: Math.max(range.startBit, suffixSafeStartBit),
        endBit: Math.min(range.endBit, suffixSafeEndBit),
      }))
      .filter((range) => range.endBit > range.startBit);
    numericSafeBitCount = numericSafeRanges.reduce((sum, r) => sum + (r.endBit - r.startBit), 0);
  }

  const suffixSafeBits =
    suffixMode === 'numeric'
      ? numericSafeBitCount
      : Math.max(0, suffixSafeEndBit - suffixSafeStartBit);
  const paddingSafeBits = Math.max(0, paddingSafeEndBit - paddingSafeStartBit);

  const allowedBitRanges: BitRange[] = [];
  if (suffixMode === 'numeric') {
    allowedBitRanges.push(...numericSafeRanges);
  } else if (suffixSafeEndBit > suffixSafeStartBit) {
    allowedBitRanges.push({ startBit: suffixSafeStartBit, endBit: suffixSafeEndBit });
  }
  if (paddingSafeEndBit > paddingSafeStartBit) {
    allowedBitRanges.push({ startBit: paddingSafeStartBit, endBit: paddingSafeEndBit });
  }

  return {
    protectedBitEnd,
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    gapStartBit,
    gapEndBit,
    gapBitCount,
    suffixSafeBits,
    paddingSafeBits,
    allowedBitRanges,
  };
}

function extractBlocksFromBuffer(
  bufferBytes: number[] | Uint8Array,
  rsBlocks: Array<{ dataCount: number; totalCount: number }>
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
} {
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

    const eccBytes = computeECC(blockData, eccCount);
    blockEccArrays.push(eccBytes);

    offset += block.dataCount;
  }

  return { blockDataArrays, blockEccArrays, blockDataCounts, blockEccCounts };
}

function encodeDataToBytes(
  plan: QArtEncodingPlan,
  version: number,
  ecc: ECCLevel
): {
  blockDataArrays: Uint8Array[];
  blockEccArrays: Uint8Array[];
  blockDataCounts: number[];
  blockEccCounts: number[];
  encoderLayout: EncoderDerivedLayout;
} {
  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);
  const buffer = qrBitBuffer();

  const suffixLength = plan.suffixLength;
  const originalDataLength = plan.originalDataLength;
  const suffixMode: 'byte' | 'numeric' = plan.mode === 'numeric' ? 'numeric' : 'byte';

  const segments = writeSegmentsToBuffer(plan, buffer, version);
  const {
    bitsAfterMode,
    bitsAfterCharCount,
    bitsAfterOriginalData,
    bitsAfterData,
    originalDataPreview,
    suffixPreview,
    fullDataLength,
  } = segments;

  log.debug(`encodeDataToBytes called (HYBRID ${suffixMode} mode)`, {
    fullDataLength,
    originalDataLength,
    suffixLength,
    originalDataPreview,
    suffixPreview,
    version,
    ecc,
    suffixMode,
  });

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

  // Compute two-interval safe mutation ranges
  const safeRanges = computeTwoIntervalSafeRanges(
    bitsAfterOriginalData,
    bitsAfterData,
    paddingStartByte,
    totalDataCount,
    suffixMode,
    suffixLength,
    version,
    buffer
  );
  const {
    protectedBitEnd,
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    gapStartBit,
    gapEndBit,
    gapBitCount,
    suffixSafeBits,
    paddingSafeBits,
    allowedBitRanges,
  } = safeRanges;
  const totalControllableBits = suffixSafeBits + paddingSafeBits;

  // Legacy fields for backwards compatibility
  const allowedBitStart = suffixSafeStartBit;
  const allowedBitEnd = paddingSafeEndBit;

  // Build the encoder-derived layout with TWO-INTERVAL safe ranges
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
    suffixMode,
    // Protection boundary (mode + charCount + original data)
    protectedBitEnd,
    // TWO-INTERVAL safe mutation ranges (byte-aligned, excludes terminator)
    suffixSafeStartBit,
    suffixSafeEndBit,
    paddingSafeStartBit,
    paddingSafeEndBit,
    // The protected gap (terminator + pad-to-byte)
    gapStartBit,
    gapEndBit,
    gapBitCount,
    // The two allowed bit ranges for RS basis building
    allowedBitRanges,
    // Legacy fields for backwards compatibility
    allowedBitStart,
    allowedBitEnd,
    suffixBits: suffixSafeBits,
    paddingBits: paddingSafeBits,
  };

  // Log the ACTUAL semantic boundaries from the encoder (HYBRID mode)
  // This now shows the TWO-INTERVAL safe ranges and the protected gap
  log.info('ENCODER-DERIVED SEMANTIC BOUNDARIES (TWO-INTERVAL HYBRID mode)', {
    version,
    ecc,
    originalDataLength,
    suffixLength,
    fullDataLength,
    encoding: suffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    checkpoints: {
      bitsAfterMode: `${bitsAfterMode} bits (mode indicator)`,
      bitsAfterCharCount: `${bitsAfterCharCount} bits (+char count)`,
      bitsAfterOriginalData: `${bitsAfterOriginalData} bits (+original data)`,
      bitsAfterData: `${bitsAfterData} bits (+suffix data)`,
      bitsAfterTerminator: `${bitsAfterTerminator} bits (+terminator)`,
      bitsAfterPadToByte: `${bitsAfterPadToByte} bits (+pad-to-byte)`,
    },
    paddingStartByte,
    totalDataBytes: totalDataCount,
    paddingByteCount,
    protection: {
      protectedBits: `0 - ${protectedBitEnd} (mode + charCount + original data)`,
      protectedBytes: Math.ceil(protectedBitEnd / 8),
    },
    twoIntervalSafeRanges: {
      interval1_suffix:
        suffixSafeEndBit > suffixSafeStartBit
          ? `bits ${suffixSafeStartBit} - ${suffixSafeEndBit} (${suffixSafeBits} bits, ${suffixSafeBits / 8} bytes)`
          : 'NONE (suffix too short or ends mid-byte)',
      interval2_padding:
        paddingSafeEndBit > paddingSafeStartBit
          ? `bits ${paddingSafeStartBit} - ${paddingSafeEndBit} (${paddingSafeBits} bits, ${paddingSafeBits / 8} bytes)`
          : 'NONE (no padding codewords)',
      gap_protected:
        gapBitCount > 0
          ? `bits ${gapStartBit} - ${gapEndBit} (${gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!]`
          : 'NONE (no gap)',
    },
    controllable: {
      totalControllableBits,
      controllablePercent: `${((totalControllableBits / (totalDataCount * 8)) * 100).toFixed(1)}%`,
      numIntervals: allowedBitRanges.length,
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

  const blocks = extractBlocksFromBuffer(bufferBytes, rsBlocks);

  return { ...blocks, encoderLayout };
}

// ============================================================================
// NUMERIC SUFFIX SAFETY FILTER (greedy, preserves numeric validity)
// ============================================================================

function getNumericBitsCount(digits: number): number {
  const fullGroups = Math.floor(digits / 3);
  const rem = digits % 3;
  return fullGroups * 10 + (rem === 1 ? 4 : rem === 2 ? 7 : 0);
}

function getNumericGroupMax(bits: number): number {
  return bits === 10 ? 999 : bits === 7 ? 99 : 9;
}

function getLinearBit(data: Uint8Array, bitIndex: number): number {
  const byteIndex = Math.floor(bitIndex / 8);
  const bitInByte = bitIndex % 8;
  const byte = data[byteIndex] ?? 0;
  // bitIndex 0 is MSB of byte 0
  return (byte >> (7 - bitInByte)) & 1;
}

function buildBlockSelectionsFromFlattened(
  flattened: FlattenedSelection[],
  blockIndices: number[]
): BlockSelectionResult[] {
  const blockMap = new Map<number, number[]>();
  for (const idx of blockIndices) {
    blockMap.set(idx, []);
  }
  for (const entry of flattened) {
    const list = blockMap.get(entry.blockIndex);
    if (list) list.push(entry.vectorIndex);
  }
  return Array.from(blockMap.entries())
    .map(([blockIndex, selectedVectorIndices]) => ({ blockIndex, selectedVectorIndices }))
    .sort((a, b) => a.blockIndex - b.blockIndex);
}

function accumulateByteGroupMasks(
  byteValue: number,
  linearByteOffset: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array,
  touchedCount: number
): number {
  for (let bitInByte = 7; bitInByte >= 0; bitInByte--) {
    if ((byteValue & (1 << bitInByte)) === 0) continue;
    const linearBit = linearByteOffset * 8 + (7 - bitInByte);
    if (linearBit < numericDataStart || linearBit >= numericDataStart + numericDataBits) continue;
    const local = linearBit - numericDataStart;
    const g = groupIndexForBit[local];
    if (g < 0) continue;
    if (groupMasks[g] === 0) {
      touched[touchedCount++] = g;
    }
    groupMasks[g] ^= bitMaskForBit[local];
  }
  return touchedCount;
}

type NumericSelectionMask = {
  entry: FlattenedSelection;
  groups: Int32Array;
  masks: Int32Array;
};

function markInvalidGroups(
  currentValues: number[],
  groupMax: number[],
  groupCount: number,
  invalid: Uint8Array
): number {
  let count = 0;
  for (let g = 0; g < groupCount; g++) {
    const bad = currentValues[g] > (groupMax[g] ?? 0);
    invalid[g] = bad ? 1 : 0;
    if (bad) count++;
  }
  return count;
}

function selectionTouchesInvalidGroup(sel: NumericSelectionMask, invalid: Uint8Array): boolean {
  for (let j = 0; j < sel.groups.length; j++) {
    if (invalid[sel.groups[j]]) return true;
  }
  return false;
}

function removeSelectionAndUpdate(sel: NumericSelectionMask, currentValues: number[]): void {
  for (let j = 0; j < sel.groups.length; j++) {
    const g = sel.groups[j];
    currentValues[g] = (currentValues[g] ?? 0) ^ sel.masks[j];
  }
}

function greedyRemoveInvalidSelections(
  selections: NumericSelectionMask[],
  currentValues: number[],
  groupMax: number[],
  groupCount: number
): boolean[] {
  const invalid = new Uint8Array(groupCount);
  let invalidCount = markInvalidGroups(currentValues, groupMax, groupCount, invalid);
  const keep = new Array<boolean>(selections.length).fill(true);

  while (invalidCount > 0) {
    let removed = false;
    for (let i = selections.length - 1; i >= 0; i--) {
      if (!keep[i]) continue;
      if (!selectionTouchesInvalidGroup(selections[i], invalid)) continue;

      keep[i] = false;
      removeSelectionAndUpdate(selections[i], currentValues);
      removed = true;
      invalidCount = markInvalidGroups(currentValues, groupMax, groupCount, invalid);
      break;
    }
    if (!removed) break;
  }

  return keep;
}

function buildNumericGroupMaps(
  linearData: Uint8Array,
  numericDataStart: number,
  suffixLength: number
): {
  groupIndexForBit: Int32Array;
  bitMaskForBit: Int32Array;
  groupMax: number[];
  baseGroupValues: number[];
} {
  const numericDataBits = getNumericBitsCount(suffixLength);
  const groupIndexForBit = new Int32Array(numericDataBits).fill(-1);
  const bitMaskForBit = new Int32Array(numericDataBits).fill(0);
  const groupMax: number[] = [];
  const baseGroupValues: number[] = [];

  let remainingDigits = suffixLength;
  let bitCursor = 0;
  let groupIndex = 0;
  while (remainingDigits > 0) {
    const groupDigits = Math.min(3, remainingDigits);
    const bitsPerGroup = groupDigits === 3 ? 10 : groupDigits === 2 ? 7 : 4;
    const maxVal = getNumericGroupMax(bitsPerGroup);

    let value = 0;
    for (let i = 0; i < bitsPerGroup; i++) {
      const bit = getLinearBit(linearData, numericDataStart + bitCursor + i);
      value = (value << 1) | bit;
      groupIndexForBit[bitCursor + i] = groupIndex;
      bitMaskForBit[bitCursor + i] = 1 << (bitsPerGroup - 1 - i);
    }

    groupMax.push(maxVal);
    baseGroupValues.push(value);

    bitCursor += bitsPerGroup;
    remainingDigits -= groupDigits;
    groupIndex++;
  }

  return { groupIndexForBit, bitMaskForBit, groupMax, baseGroupValues };
}

function computeEntryGroupMasks(
  entry: FlattenedSelection,
  blockDataCounts: number[],
  blockStartBytes: number[],
  numericStartByte: number,
  numericEndByte: number,
  numericDataStart: number,
  numericDataBits: number,
  groupIndexForBit: Int32Array,
  bitMaskForBit: Int32Array,
  groupMasks: Int32Array,
  touched: Int32Array
): NumericSelectionMask {
  const vector = entry.vector;
  const dataCount = blockDataCounts[entry.blockIndex] ?? 0;
  const blockStart = blockStartBytes[entry.blockIndex] ?? 0;
  let touchedCount = 0;

  const nzIdx = vector.nonZeroByteIndices;
  const nzVals = vector.nonZeroByteValues;
  if (nzIdx && nzVals) {
    const firstByte = nzIdx[0] ?? -1;
    const lastByte = nzIdx[nzIdx.length - 1] ?? -1;
    if (firstByte < numericEndByte && lastByte >= numericStartByte) {
      for (let k = 0; k < nzIdx.length; k++) {
        const byteIdx = nzIdx[k];
        if (byteIdx >= dataCount) continue;
        touchedCount = accumulateByteGroupMasks(
          nzVals[k],
          blockStart + byteIdx,
          numericDataStart,
          numericDataBits,
          groupIndexForBit,
          bitMaskForBit,
          groupMasks,
          touched,
          touchedCount
        );
      }
    }
  } else {
    for (let byteIdx = 0; byteIdx < dataCount; byteIdx++) {
      const byte = vector.blockBits[byteIdx];
      if (!byte) continue;
      touchedCount = accumulateByteGroupMasks(
        byte,
        blockStart + byteIdx,
        numericDataStart,
        numericDataBits,
        groupIndexForBit,
        bitMaskForBit,
        groupMasks,
        touched,
        touchedCount
      );
    }
  }

  if (touchedCount === 0) {
    return { entry, groups: new Int32Array(0), masks: new Int32Array(0) };
  }
  const groups = new Int32Array(touchedCount);
  const masks = new Int32Array(touchedCount);
  for (let i = 0; i < touchedCount; i++) {
    const g = touched[i];
    groups[i] = g;
    masks[i] = groupMasks[g];
    groupMasks[g] = 0;
  }
  return { entry, groups, masks };
}

function filterSelectionsForNumericSuffix(
  flattened: FlattenedSelection[],
  blockDataArrays: Uint8Array[],
  blockDataCounts: number[],
  encoderLayout: EncoderDerivedLayout,
  version: number
): FlattenedSelection[] {
  if (encoderLayout.suffixMode !== 'numeric' || encoderLayout.suffixLength <= 0) {
    return flattened;
  }

  const numericCharCountBits = getLengthInBits(QRMode.MODE_NUMBER, version);
  const numericDataStart = encoderLayout.bitsAfterOriginalData + 4 + numericCharCountBits;
  const numericDataBits = getNumericBitsCount(encoderLayout.suffixLength);
  if (numericDataBits <= 0) return flattened;
  const numericStartByte = Math.floor(numericDataStart / 8);
  const numericEndByte = Math.ceil((numericDataStart + numericDataBits) / 8);

  const totalDataBytes = blockDataCounts.reduce((sum, c) => sum + c, 0);
  const linearData = new Uint8Array(totalDataBytes);
  let offset = 0;
  for (let i = 0; i < blockDataArrays.length; i++) {
    linearData.set(blockDataArrays[i], offset);
    offset += blockDataCounts[i];
  }

  const { groupIndexForBit, bitMaskForBit, groupMax, baseGroupValues } = buildNumericGroupMaps(
    linearData,
    numericDataStart,
    encoderLayout.suffixLength
  );

  const blockStartBytes: number[] = [];
  offset = 0;
  for (const count of blockDataCounts) {
    blockStartBytes.push(offset);
    offset += count;
  }

  const groupCount = groupMax.length;
  const groupMasks = new Int32Array(groupCount);
  const touched = new Int32Array(groupCount);

  const selections: NumericSelectionMask[] = flattened.map((entry) =>
    computeEntryGroupMasks(
      entry,
      blockDataCounts,
      blockStartBytes,
      numericStartByte,
      numericEndByte,
      numericDataStart,
      numericDataBits,
      groupIndexForBit,
      bitMaskForBit,
      groupMasks,
      touched
    )
  );

  const currentValues = baseGroupValues.slice();
  for (const sel of selections) {
    for (let i = 0; i < sel.groups.length; i++) {
      const g = sel.groups[i];
      currentValues[g] = (currentValues[g] ?? 0) ^ sel.masks[i];
    }
  }

  const keep = greedyRemoveInvalidSelections(selections, currentValues, groupMax, groupCount);

  const accepted: FlattenedSelection[] = [];
  for (let i = 0; i < selections.length; i++) {
    if (keep[i]) accepted.push(selections[i].entry);
  }

  if (accepted.length !== flattened.length) {
    log.info('Numeric suffix repair filter applied', {
      originalSelections: flattened.length,
      acceptedSelections: accepted.length,
      removed: flattened.length - accepted.length,
    });
  }

  return accepted;
}

function drawFinderPattern(
  modules: (boolean | null)[][],
  moduleCount: number,
  centerRow: number,
  centerCol: number
): void {
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
}

function drawSingleAlignmentPattern(modules: (boolean | null)[][], row: number, col: number): void {
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

function drawAlignmentPatterns(
  modules: (boolean | null)[][],
  version: number,
  moduleCount: number
): void {
  if (version < 2) return;
  const positions = getPatternPosition(version);
  for (const row of positions) {
    for (const col of positions) {
      if (modules[row][col] !== null) continue;
      drawSingleAlignmentPattern(modules, row, col);
    }
  }
}

function drawTimingPatterns(modules: (boolean | null)[][], moduleCount: number): void {
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    modules[6][i] ??= dark;
    modules[i][6] ??= dark;
  }
}

function writeFormatInfo(
  modules: (boolean | null)[][],
  ecc: ECCLevel,
  maskPattern: number,
  moduleCount: number
): void {
  const eccLevel = eccToNumericForEncoder(ecc);
  const formatData = (eccLevel << 3) | maskPattern;
  const formatBits = getBCHTypeInfo(formatData);

  for (let i = 0; i < 15; i++) {
    const mod = ((formatBits >> i) & 1) === 1;

    if (i < 6) {
      modules[i][8] = mod;
    } else if (i < 8) {
      modules[i + 1][8] = mod;
    } else {
      modules[moduleCount - 15 + i][8] = mod;
    }

    if (i < 8) {
      modules[8][moduleCount - i - 1] = mod;
    } else if (i < 9) {
      modules[8][15 - i - 1 + 1] = mod;
    } else {
      modules[8][15 - i - 1] = mod;
    }
  }

  modules[moduleCount - 8][8] = true;
}

function writeVersionInfo(
  modules: (boolean | null)[][],
  version: number,
  moduleCount: number
): void {
  if (version < 7) return;
  const versionBits = getBCHTypeNumber(version);
  for (let i = 0; i < 18; i++) {
    const mod = ((versionBits >> i) & 1) === 1;
    modules[Math.floor(i / 3)][(i % 3) + moduleCount - 8 - 3] = mod;
    modules[(i % 3) + moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
  }
}

function interleaveBlockCodewords(
  blockCodewords: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[]
): number[] {
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

  return interleaved;
}

function placeOneDataModule(
  modules: (boolean | null)[][],
  row: number,
  col: number,
  interleaved: number[],
  byteIndex: number,
  bitIndex: number,
  maskFunc: (r: number, c: number) => boolean
): { byteIndex: number; bitIndex: number } {
  if (modules[row][col] !== null) {
    return { byteIndex, bitIndex };
  }

  let dark = false;
  if (byteIndex < interleaved.length) {
    dark = ((interleaved[byteIndex] >>> bitIndex) & 1) === 1;
  }
  if (maskFunc(row, col)) {
    dark = !dark;
  }
  modules[row][col] = dark;
  bitIndex--;
  if (bitIndex === -1) {
    byteIndex++;
    bitIndex = 7;
  }
  return { byteIndex, bitIndex };
}

function placeDataWithZigzag(
  modules: (boolean | null)[][],
  interleaved: number[],
  maskPattern: number,
  moduleCount: number
): void {
  const maskFunc = getMaskFunction(maskPattern);
  let inc = -1;
  let row = moduleCount - 1;
  let bitIndex = 7;
  let byteIndex = 0;

  let col = moduleCount - 1;
  while (col > 0) {
    if (col === 6) col -= 1;

    while (true) {
      for (let c = 0; c < 2; c++) {
        const placed = placeOneDataModule(
          modules,
          row,
          col - c,
          interleaved,
          byteIndex,
          bitIndex,
          maskFunc
        );
        byteIndex = placed.byteIndex;
        bitIndex = placed.bitIndex;
      }

      row += inc;

      if (row < 0 || row >= moduleCount) {
        row -= inc;
        inc = -inc;
        break;
      }
    }
    col -= 2;
  }
}

/**
 * Regenerate a QR code from modified per-block data and ECC.
 * Uses extracted helpers for structural pattern drawing, interleaving,
 * and zigzag data placement.
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
  drawFinderPattern(modules, moduleCount, 0, 0);
  drawFinderPattern(modules, moduleCount, moduleCount - 7, 0);
  drawFinderPattern(modules, moduleCount, 0, moduleCount - 7);

  // 2. Draw alignment patterns (must be BEFORE timing to match encoder order)
  drawAlignmentPatterns(modules, version, moduleCount);

  // 3. Draw timing patterns (must be AFTER alignment to match encoder order)
  drawTimingPatterns(modules, moduleCount);

  // 4. Write format information
  writeFormatInfo(modules, ecc, maskPattern, moduleCount);

  // 5. Write version information
  writeVersionInfo(modules, version, moduleCount);

  // 6. Combine data and pre-computed ECC for each block (DO NOT recompute ECC!)
  const blockCodewords: Uint8Array[] = [];
  for (let i = 0; i < blockDataArrays.length; i++) {
    const data = blockDataArrays[i];
    const eccBytes = blockEccArrays[i];
    const codeword = new Uint8Array(data.length + eccBytes.length);
    codeword.set(data, 0);
    codeword.set(eccBytes, data.length);
    blockCodewords.push(codeword);
  }

  // 7. Interleave and place data using zigzag traversal
  const interleaved = interleaveBlockCodewords(blockCodewords, blockDataCounts, blockEccCounts);
  placeDataWithZigzag(modules, interleaved, maskPattern, moduleCount);

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

type BasisVectorViolation = {
  vectorIndex: number;
  dataBitIndex: number;
  blockIndex: number;
  localBitIndex: number;
  linearBit: number;
  violationType: 'ORIGINAL_DATA' | 'TERMINATOR_GAP';
};

function validateBasisVectorSafety(
  vectors: Array<{
    rsBlockIndex: number;
    posInBlock: number;
    bitInByte: number;
    dataBitIndex: number;
  }>,
  blockDataCounts: number[],
  protectedBitEnd: number,
  gapStartBit: number,
  gapEndBit: number
): BasisVectorViolation[] {
  const violations: BasisVectorViolation[] = [];

  for (let i = 0; i < vectors.length; i++) {
    const vector = vectors[i];
    let linearByteOffset = 0;
    for (let b = 0; b < vector.rsBlockIndex; b++) {
      linearByteOffset += blockDataCounts[b];
    }
    const linearByte = linearByteOffset + vector.posInBlock;
    const linearBit = linearByte * 8 + (7 - vector.bitInByte);

    if (linearBit < protectedBitEnd) {
      violations.push({
        vectorIndex: i,
        dataBitIndex: vector.dataBitIndex,
        blockIndex: vector.rsBlockIndex,
        localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
        linearBit,
        violationType: 'ORIGINAL_DATA',
      });
    } else if (linearBit >= gapStartBit && linearBit < gapEndBit) {
      violations.push({
        vectorIndex: i,
        dataBitIndex: vector.dataBitIndex,
        blockIndex: vector.rsBlockIndex,
        localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
        linearBit,
        violationType: 'TERMINATOR_GAP',
      });
    }
  }

  return violations;
}

function checkBlockByteViolations(
  blockIdx: number,
  originalData: Uint8Array,
  modifiedData: Uint8Array,
  allowedBitsInBlock: Set<number>,
  violations: Array<{
    blockIdx: number;
    byteIdx: number;
    original: number;
    modified: number;
    localBitStart: number;
  }>
): void {
  for (let byteIdx = 0; byteIdx < originalData.length; byteIdx++) {
    const originalByte = originalData[byteIdx];
    const modifiedByte = modifiedData[byteIdx];

    if (originalByte === modifiedByte) continue;

    for (let bitIdx = 0; bitIdx < 8; bitIdx++) {
      const localBitIndex = byteIdx * 8 + bitIdx;

      if (!allowedBitsInBlock.has(localBitIndex)) {
        const originalBit = (originalByte >> (7 - bitIdx)) & 1;
        const modifiedBit = (modifiedByte >> (7 - bitIdx)) & 1;

        if (originalBit !== modifiedBit) {
          violations.push({
            blockIdx,
            byteIdx,
            original: originalData[byteIdx],
            modified: modifiedData[byteIdx],
            localBitStart: byteIdx * 8,
          });
          break;
        }
      }
    }
  }
}

function verifyProtectedBytes(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockAllowedBits: Map<number, Set<number>>
): {
  valid: boolean;
  violations: Array<{
    blockIdx: number;
    byteIdx: number;
    original: number;
    modified: number;
    localBitStart: number;
  }>;
} {
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

    checkBlockByteViolations(blockIdx, originalData, modifiedData, allowedBitsInBlock, violations);

    const firstProtectedBytes = Math.min(24, originalData.length);
    log.debug('BLOCK HEAD BYTES (orig vs mod)', {
      blockIdx,
      blockDataBytes: originalData.length,
      allowedBitsCount: allowedBitsInBlock.size,
      origHead: Array.from(originalData.slice(0, firstProtectedBytes)),
      modHead: Array.from(modifiedData.slice(0, firstProtectedBytes)),
    });
  }

  return { valid: violations.length === 0, violations };
}

function buildStructuralPositionSet(moduleCount: number): Set<string> {
  const structuralPositions = new Set<string>();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      structuralPositions.add(`${r},${c}`);
      structuralPositions.add(`${r},${moduleCount - 8 + c}`);
      structuralPositions.add(`${moduleCount - 8 + r},${c}`);
    }
  }
  for (let i = 0; i < moduleCount; i++) {
    structuralPositions.add(`6,${i}`);
    structuralPositions.add(`${i},6`);
  }
  for (let i = 0; i < 9; i++) {
    structuralPositions.add(`${i},8`);
    structuralPositions.add(`8,${i}`);
    structuralPositions.add(`${moduleCount - 8 + i},8`);
    structuralPositions.add(`8,${moduleCount - 8 + i}`);
  }
  return structuralPositions;
}

function analyzeMatrixDiff(
  baseMatrix: boolean[][],
  finalMatrix: boolean[][],
  moduleCount: number
): {
  diffCount: number;
  structuralDiffCount: number;
  dataDiffCount: number;
  sampleDiffs: Array<{
    row: number;
    col: number;
    base: boolean;
    final: boolean;
    isStructural: boolean;
  }>;
} {
  let diffCount = 0;
  let structuralDiffCount = 0;
  let dataDiffCount = 0;
  const sampleDiffs: Array<{
    row: number;
    col: number;
    base: boolean;
    final: boolean;
    isStructural: boolean;
  }> = [];

  const structuralPositions = buildStructuralPositionSet(moduleCount);

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

  return { diffCount, structuralDiffCount, dataDiffCount, sampleDiffs };
}

function computeLinearBitPosition(
  blockIndex: number,
  posInBlock: number,
  bitInByte: number,
  blockDataCounts: number[]
): { linearByte: number; linearBit: number } {
  let linearByteOffset = 0;
  for (let b = 0; b < blockIndex; b++) {
    linearByteOffset += blockDataCounts[b];
  }
  const linearByte = linearByteOffset + posInBlock;
  const linearBit = linearByte * 8 + (7 - bitInByte);
  return { linearByte, linearBit };
}

function classifyIntervalStatus(
  linearBit: number,
  encoderLayout: EncoderDerivedLayout
): {
  isInSuffixInterval: boolean;
  isInPaddingInterval: boolean;
  isInGap: boolean;
  isInProtected: boolean;
  status: string;
} {
  const isInSuffixInterval =
    linearBit >= encoderLayout.suffixSafeStartBit && linearBit < encoderLayout.suffixSafeEndBit;
  const isInPaddingInterval =
    linearBit >= encoderLayout.paddingSafeStartBit && linearBit < encoderLayout.paddingSafeEndBit;
  const isInGap = linearBit >= encoderLayout.gapStartBit && linearBit < encoderLayout.gapEndBit;
  const isInProtected = linearBit < encoderLayout.protectedBitEnd;
  const status = isInSuffixInterval
    ? 'Vector is in SUFFIX safe interval (EXPECTED)'
    : isInPaddingInterval
      ? 'Vector is in PADDING safe interval (EXPECTED)'
      : isInGap
        ? 'Vector is in TERMINATOR GAP - BUG!'
        : isInProtected
          ? 'Vector is in PROTECTED region - BUG!'
          : 'Vector is in UNKNOWN region - BUG!';
  return { isInSuffixInterval, isInPaddingInterval, isInGap, isInProtected, status };
}

function applyTestVectorAndScan(
  testVector: { rsBlockIndex: number; blockBits: Uint8Array },
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number
): ScanResult {
  const testBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
  const testBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));

  const blockIdx = testVector.rsBlockIndex;
  for (let byteIdx = 0; byteIdx < testBlockData[blockIdx].length; byteIdx++) {
    testBlockData[blockIdx][byteIdx] ^= testVector.blockBits[byteIdx];
  }
  for (let byteIdx = 0; byteIdx < testBlockEcc[blockIdx].length; byteIdx++) {
    testBlockEcc[blockIdx][byteIdx] ^= testVector.blockBits[blockDataCounts[blockIdx] + byteIdx];
  }

  const testMatrix = regenerateQRFromModifiedData(
    testBlockData,
    testBlockEcc,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );
  return scanMatrixWithJsQR(testMatrix);
}

function runDeterministicMutationTest(
  testVector: {
    rsBlockIndex: number;
    posInBlock: number;
    bitInByte: number;
    dataBitIndex: number;
    blockBits: Uint8Array;
  },
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  data: string,
  originalDataLength: number,
  actualSuffix: string
): { passed: boolean; error?: string } {
  const testLocalBitIndex = testVector.posInBlock * 8 + (7 - testVector.bitInByte);
  const { linearByte, linearBit } = computeLinearBitPosition(
    testVector.rsBlockIndex,
    testVector.posInBlock,
    testVector.bitInByte,
    blockDataCounts
  );
  const interval = classifyIntervalStatus(linearBit, encoderLayout);

  log.info('Test vector details (TWO-INTERVAL)', {
    vectorDataBitIndex: testVector.dataBitIndex,
    vectorBlockIndex: testVector.rsBlockIndex,
    vectorPosInBlock: testVector.posInBlock,
    vectorBitInByte: testVector.bitInByte,
    localBitIndex: testLocalBitIndex,
    linearByte,
    linearBit,
    twoIntervalAnalysis: {
      ...interval,
      suffixRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      paddingRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gapRange: `${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit}`,
    },
    status: interval.status,
  });

  const testScan = applyTestVectorAndScan(
    testVector,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask
  );

  if (!testScan.success) {
    log.warn('HYBRID MUTATION TEST FAILED - single vector breaks scan!', {
      vectorDataBitIndex: testVector.dataBitIndex,
      vectorBlockIndex: testVector.rsBlockIndex,
      localBitIndex: testLocalBitIndex,
      linearByte,
      linearBit,
      paddingStartByte: encoderLayout.paddingStartByte,
      allowedBitStart: encoderLayout.allowedBitStart,
      scanError: testScan.error,
    });
    return {
      passed: false,
      error: 'HYBRID mutation test failed: single vector application broke QR scan',
    };
  }

  const mutationValidation = validateOriginalDataPreserved(testScan.data, data);
  if (!mutationValidation.valid) {
    log.warn('HYBRID MUTATION TEST FAILED - byte-exact validation failed!', {
      expectedOriginal: data,
      actualData: testScan.data,
      expectedLength: originalDataLength,
      actualLength: testScan.data?.length,
      validationReason: mutationValidation.reason,
      mismatchDetails: mutationValidation.mismatch,
      localBitIndex: testLocalBitIndex,
      linearByte,
      linearBit,
      protectedBitEnd: encoderLayout.protectedBitEnd,
    });
    return { passed: false, error: `HYBRID mutation test failed: ${mutationValidation.reason}` };
  }

  const decodedSuffix = testScan.data?.slice(originalDataLength) || '';
  log.info('HYBRID MUTATION TEST PASSED (TWO-INTERVAL byte-exact)', {
    vectorDataBitIndex: testVector.dataBitIndex,
    vectorBlockIndex: testVector.rsBlockIndex,
    localBitIndex: testLocalBitIndex,
    linearByte,
    linearBit,
    vectorInterval: interval.isInSuffixInterval
      ? 'SUFFIX'
      : interval.isInPaddingInterval
        ? 'PADDING'
        : 'UNKNOWN',
    gapProtected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits)`,
    originalDataPreserved: true,
    validationMethod: 'BYTE_EXACT_PREFIX',
    suffixWasModified: decodedSuffix !== actualSuffix,
    matrixScansCorrectly: true,
  });

  return { passed: true };
}

function handleScanFailureFallback(
  blockSelections: BlockSelectionResult[],
  elimination: EliminationResult,
  importance: number[][],
  moduleCount: number,
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  data: string,
  actualSuffix: string,
  strictSuffix: boolean,
  totalSelected: number,
  baseMatrix: boolean[][]
): { matrix: boolean[][]; vectorsApplied: number; scanResult: ScanResult } {
  log.info('Attempting binary search fallback to find scannable configuration');

  const flattenedSelections = flattenAndOrderSelections(
    blockSelections,
    elimination,
    importance,
    moduleCount
  );

  const regenerateFn = (
    blockData: Uint8Array[],
    blockEcc: Uint8Array[],
    dataCounts: number[],
    eccCounts: number[]
  ) =>
    regenerateQRFromModifiedData(
      blockData,
      blockEcc,
      dataCounts,
      eccCounts,
      actualVersion,
      ecc,
      actualMask
    );

  const binarySearchResult = binarySearchMaxVectors(
    flattenedSelections,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    elimination,
    regenerateFn,
    scanMatrixWithJsQR,
    data,
    ecc,
    actualMask,
    strictSuffix
  );

  if (binarySearchResult.maxCount > 0) {
    log.info('Binary search fallback successful', {
      originalVectors: totalSelected,
      usableVectors: binarySearchResult.maxCount,
      reductionPercent: `${((1 - binarySearchResult.maxCount / totalSelected) * 100).toFixed(1)}%`,
      iterations: binarySearchResult.iterations,
    });

    const resultMatrix = binarySearchResult.matrix;
    const vectorsApplied = binarySearchResult.maxCount;

    const postSearchValidation = performSemanticValidation(
      resultMatrix,
      data,
      ecc,
      actualMask,
      actualSuffix,
      scanMatrixWithJsQR,
      strictSuffix
    );

    if (postSearchValidation.valid) {
      const postSearchScan = scanMatrixWithJsQR(resultMatrix);
      log.info('Binary search result SEMANTIC-HARD-GATE validation PASSED', {
        originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
        ecc,
        mask: actualMask,
        structurallyValid: postSearchScan.structurallyValid,
        segmentCount: postSearchScan.segmentCount,
        segmentModes: postSearchScan.segments?.map((s) => s.modeName),
        validationMethod: 'SEMANTIC_HARD_GATE',
      });
      return { matrix: resultMatrix, vectorsApplied, scanResult: postSearchScan };
    } else {
      const postSearchScan = scanMatrixWithJsQR(resultMatrix);
      log.warn('Binary search result SEMANTIC-HARD-GATE validation FAILED!', {
        rejectionReason: postSearchValidation.reason,
        description: postSearchValidation.description,
        details: postSearchValidation.details,
        expectedOriginal: data,
        structurallyValid: postSearchScan.structurallyValid,
        segmentCount: postSearchScan.segmentCount,
        segmentModes: postSearchScan.segments?.map((s) => s.modeName),
        segments: postSearchScan.segments?.map((s) => ({
          mode: s.modeName,
          charCount: s.charCount,
          valid: s.valid,
          bitOffset: s.bitOffset,
        })),
      });
      return {
        matrix: resultMatrix,
        vectorsApplied,
        scanResult: {
          success: false,
          error: `Post-search semantic validation failed: ${postSearchValidation.reason}`,
        },
      };
    }
  } else {
    log.warn('Binary search found 0 usable vectors - returning base matrix', {
      iterations: binarySearchResult.iterations,
    });
    return { matrix: baseMatrix, vectorsApplied: 0, scanResult: scanMatrixWithJsQR(baseMatrix) };
  }
}

function estimateBlockECCDamage(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockEccCounts: number[]
): { anyBlockOverBudget: boolean; blockDamage: Array<{ changed: number; safeLimit: number }> } {
  let anyBlockOverBudget = false;
  const blockDamage: Array<{ changed: number; safeLimit: number }> = [];

  for (let blockIdx = 0; blockIdx < modifiedBlockData.length; blockIdx++) {
    const eccDamage = calculateECCDamage(
      blockDataArrays[blockIdx],
      modifiedBlockData[blockIdx],
      blockEccCounts[blockIdx]
    );

    blockDamage.push({ changed: eccDamage.changedCodewords, safeLimit: eccDamage.safeLimit });

    if (eccDamage.isOverBudget) {
      anyBlockOverBudget = true;
    }

    log.info('ECC DAMAGE ESTIMATE', {
      blockIndex: blockIdx,
      eccCount: blockEccCounts[blockIdx],
      changedDataCodewords: eccDamage.changedCodewords,
      changedTotalCodewords: eccDamage.changedCodewords,
      safeLimit: eccDamage.safeLimit,
      isOverBudget: eccDamage.isOverBudget,
      percentOfBudget:
        eccDamage.safeLimit > 0
          ? `${((eccDamage.changedCodewords / eccDamage.safeLimit) * 100).toFixed(1)}%`
          : 'N/A',
    });
  }

  return { anyBlockOverBudget, blockDamage };
}

function resolveQArtVersion(
  forceVersion: number | undefined,
  version: number
): { versionToUse: number; versionWasUpgradedForQArt: boolean } {
  let versionWasUpgradedForQArt = false;
  let versionToUse: number;

  if (forceVersion && forceVersion > 0) {
    if (forceVersion < MIN_QART_VERSION) {
      log.warn('Forced version is below MIN_QART_VERSION, upgrading for reliable scanning', {
        requestedVersion: forceVersion,
        minQArtVersion: MIN_QART_VERSION,
        reason: 'Lower versions have insufficient ECC capacity for real phone cameras',
      });
      versionToUse = MIN_QART_VERSION;
      versionWasUpgradedForQArt = true;
    } else {
      versionToUse = forceVersion;
    }
    log.info('Using QR version for QR-Art', {
      version: versionToUse,
      wasUpgraded: versionWasUpgradedForQArt,
    });
  } else if (version > 0) {
    versionToUse = version;
    log.info('Using QR version for QR-Art', { version: versionToUse, wasUpgraded: false });
  } else {
    versionToUse = 0;
  }

  return { versionToUse, versionWasUpgradedForQArt };
}

function handleUserProvidedSuffix(
  suffix: string,
  resolvedSuffixMode: 'numeric' | 'byte',
  prefix: string,
  data: string,
  originalDataLength: number
): {
  resolvedSuffixMode: 'numeric' | 'byte';
  actualSuffix: string;
  encodedData: string;
  originalData: string;
  originalDataLength: number;
} {
  let actualSuffix = '';
  let encodedData = '';
  let currentMode = resolvedSuffixMode;
  let currentOriginalData = prefix;
  let currentOriginalDataLength = originalDataLength;

  if (currentMode === 'numeric') {
    const normalized = suffix.startsWith('#') ? suffix.slice(1) : suffix;
    if (/^\d*$/.test(normalized)) {
      actualSuffix = normalized;
      encodedData = prefix + actualSuffix;
      log.info('Using user-provided numeric suffix', {
        originalDataLength,
        suffixLength: actualSuffix.length,
        suffixPreview: actualSuffix.slice(0, 20) + (actualSuffix.length > 20 ? '...' : ''),
      });
    } else {
      log.warn('Numeric suffix mode requires digits only; falling back to byte suffix mode', {
        providedSuffix: suffix,
      });
      currentMode = 'byte';
      currentOriginalData = data;
      currentOriginalDataLength = data.length;
    }
  }

  if (currentMode === 'byte') {
    actualSuffix = suffix;
    encodedData = data + suffix;
    log.info('Using user-provided suffix', {
      originalDataLength: currentOriginalDataLength,
      suffixLength: suffix.length,
      suffixPreview: suffix.slice(0, 20) + (suffix.length > 20 ? '...' : ''),
    });
  }

  return {
    resolvedSuffixMode: currentMode,
    actualSuffix,
    encodedData,
    originalData: currentOriginalData,
    originalDataLength: currentOriginalDataLength,
  };
}

function handleAutoSuffix(
  data: string,
  ecc: ECCLevel,
  prefix: string,
  resolvedSuffixMode: 'numeric' | 'byte',
  originalDataLength: number,
  versionToUse: number,
  targetControlPercent: number,
  lockVersionToMinimum: boolean
): { actualSuffix: string; encodedData: string; optimalVersion: number } {
  const controlTarget = lockVersionToMinimum || versionToUse > 0 ? 0 : targetControlPercent;
  const optimalConfig = calculateOptimalVersionAndSuffix(
    versionToUse,
    ecc,
    originalDataLength,
    controlTarget,
    resolvedSuffixMode
  );
  const seed = hashStringToSeed(data + optimalConfig.version.toString() + ecc);

  let actualSuffix: string;
  let encodedData: string;
  if (resolvedSuffixMode === 'numeric') {
    const suffixDigits = Math.max(0, optimalConfig.suffixLength);
    actualSuffix = generateDeterministicNumericSuffix(suffixDigits, seed);
    encodedData = prefix + actualSuffix;
  } else {
    const suffixCharCount = Math.max(0, optimalConfig.suffixLength - 1);
    actualSuffix = `#${generateDeterministicSuffix(suffixCharCount, seed)}`;
    encodedData = data + actualSuffix;
  }

  log.info('Auto-generated DETERMINISTIC suffix for HYBRID QR-Art', {
    originalDataLength,
    suffixLength: actualSuffix.length,
    suffixPreview: actualSuffix.slice(0, 30) + (actualSuffix.length > 30 ? '...' : ''),
    encoding:
      resolvedSuffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
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
    lockVersionToMinimum,
  });

  return { actualSuffix, encodedData, optimalVersion: optimalConfig.version };
}

function resolveQArtSuffixConfig(config: {
  data: string;
  version: number;
  ecc: ECCLevel;
  suffix?: string;
  suffixMode: 'auto' | 'numeric' | 'byte';
  autoSuffix: boolean;
  minPadCodewords: number;
  forceVersion?: number;
  targetControlPercent: number;
  lockVersionToMinimum: boolean;
}): {
  resolvedSuffixMode: 'numeric' | 'byte';
  encodingSuffixMode: 'numeric' | 'byte';
  encodedData: string;
  actualSuffix: string;
  originalData: string;
  originalDataLength: number;
  versionToUse: number;
  versionWasUpgradedForQArt: boolean;
} {
  const {
    data,
    version,
    ecc,
    suffix,
    suffixMode,
    autoSuffix,
    minPadCodewords,
    forceVersion,
    targetControlPercent,
    lockVersionToMinimum,
  } = config;

  const isUrlLike = /^https?:\/\//i.test(data);
  let resolvedSuffixMode: 'numeric' | 'byte' =
    suffixMode === 'auto' ? (isUrlLike ? 'numeric' : 'byte') : suffixMode;

  const encodingSuffixMode: 'numeric' | 'byte' = resolvedSuffixMode;

  const hashIndex = data.indexOf('#');
  const baseUrl = hashIndex >= 0 ? data.slice(0, hashIndex) : data;
  if (resolvedSuffixMode === 'numeric' && hashIndex >= 0) {
    log.warn('Numeric suffix mode: dropping existing fragment and regenerating numeric suffix', {
      originalData: data.length > 60 ? `${data.slice(0, 60)}...` : data,
    });
  }

  const prefix = resolvedSuffixMode === 'numeric' ? `${baseUrl}#` : data;
  let originalData = prefix;
  let originalDataLength = originalData.length;

  let versionWasUpgradedForQArt = false;
  let encodedData = '';
  let actualSuffix = '';
  let versionToUse: number;

  // Determine the version to use
  const versionResult = resolveQArtVersion(forceVersion, version);
  versionToUse = versionResult.versionToUse;
  versionWasUpgradedForQArt = versionResult.versionWasUpgradedForQArt;

  // Handle suffix generation
  if (suffix !== undefined) {
    const userSuffixResult = handleUserProvidedSuffix(
      suffix,
      resolvedSuffixMode,
      prefix,
      data,
      originalDataLength
    );
    resolvedSuffixMode = userSuffixResult.resolvedSuffixMode;
    actualSuffix = userSuffixResult.actualSuffix;
    encodedData = userSuffixResult.encodedData;
    originalData = userSuffixResult.originalData;
    originalDataLength = userSuffixResult.originalDataLength;
  } else if (autoSuffix) {
    const autoResult = handleAutoSuffix(
      data,
      ecc,
      prefix,
      resolvedSuffixMode,
      originalDataLength,
      versionToUse,
      targetControlPercent,
      lockVersionToMinimum
    );
    actualSuffix = autoResult.actualSuffix;
    encodedData = autoResult.encodedData;
    if (versionToUse === 0) {
      versionToUse = autoResult.optimalVersion;
    }
  } else {
    actualSuffix = '';
    encodedData = data;
    resolvedSuffixMode = 'byte';
    originalData = data;
    originalDataLength = data.length;
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

  return {
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    versionWasUpgradedForQArt,
  };
}

function buildQArtFailResult(
  error: string,
  matrix: boolean[][],
  moduleCount: number,
  version: number,
  mask: number,
  encodedData: string,
  originalData: string,
  suffix: string
): FullQArtResult {
  return {
    success: false,
    error,
    matrix,
    moduleCount,
    version,
    maskPattern: mask,
    matchingPixels: 0,
    totalControllable: 0,
    matchPercentage: 0,
    encodedData,
    originalData,
    suffix,
  };
}

function verifyBaseMatrixScan(
  baseMatrix: boolean[][],
  data: string,
  originalDataLength: number
): string | null {
  const baseVerificationScan = scanMatrixWithJsQR(baseMatrix);
  if (baseVerificationScan.success) {
    const baseValidation = validateOriginalDataPreserved(baseVerificationScan.data, data);
    if (baseValidation.valid) {
      log.info('BASE MATRIX VERIFICATION PASSED (byte-exact)', {
        originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
        decodedDataLength: baseVerificationScan.data?.length,
        suffixPresent: (baseVerificationScan.data?.length ?? 0) > originalDataLength,
        validationMethod: 'BYTE_EXACT_PREFIX',
      });
      return null;
    }
    log.warn('BASE MATRIX VERIFICATION FAILED - byte-exact validation failed!', {
      expectedOriginal: data,
      actualDecodedData: baseVerificationScan.data,
      validationReason: baseValidation.reason,
      mismatchDetails: baseValidation.mismatch,
    });
    return `Base matrix byte-exact validation failed: ${baseValidation.reason}`;
  }
  log.warn('BASE MATRIX VERIFICATION FAILED - base matrix does not scan!', {
    error: baseVerificationScan.error,
  });
  return `Base matrix does not scan: ${baseVerificationScan.error}`;
}

function verifyRSLinearityAllBlocks(
  modifiedBlockData: Uint8Array[],
  modifiedBlockEcc: Uint8Array[],
  blockEccCounts: number[]
): boolean {
  let ok = true;
  for (let i = 0; i < modifiedBlockData.length; i++) {
    const expectedEcc = computeECC(modifiedBlockData[i], blockEccCounts[i]);
    const actualEcc = modifiedBlockEcc[i];
    if (arraysEqual(expectedEcc, actualEcc)) {
      log.debug('RS linearity verified for modified block', { blockIndex: i });
    } else {
      ok = false;
      log.warn('RS LINEARITY BROKEN - modified codeword is invalid!', {
        blockIndex: i,
        dataCount: modifiedBlockData[i].length,
        eccCount: blockEccCounts[i],
        expectedEccFirst5: Array.from(expectedEcc.slice(0, 5)),
        actualEccFirst5: Array.from(actualEcc.slice(0, 5)),
        modifiedDataFirst5: Array.from(modifiedBlockData[i].slice(0, 5)),
      });
    }
  }
  if (ok) {
    log.info('RS linearity preserved - all modified codewords are valid');
  } else {
    log.warn('RS LINEARITY CHECK FAILED - QR code will likely not scan!');
  }
  return ok;
}

function logBlockModificationSummary(
  blockDataArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  blockEccArrays: Uint8Array[],
  modifiedBlockEcc: Uint8Array[]
): void {
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
}

function validateFinalMatrixDiagnostics(
  finalMatrix: boolean[][],
  baseMatrix: boolean[][],
  ecc: ECCLevel,
  actualMask: number,
  moduleCount: number
): {
  structuralDiffCount: number;
  dataDiffCount: number;
  finderValidation: ReturnType<typeof validateFinderPatterns>;
  timingValidation: ReturnType<typeof validateTimingPatterns>;
  baseFormatInfo: ReturnType<typeof extractFormatInfo>;
  finalFormatInfo: ReturnType<typeof extractFormatInfo>;
} {
  const finalFormatVerification = verifyMatrixFormatInfo(finalMatrix, ecc, actualMask);
  if (finalFormatVerification.valid) {
    log.info('Final matrix format verification passed (diagnostic)', {
      ecc,
      mask: actualMask,
      eccMatch: finalFormatVerification.eccMatch,
      maskMatch: finalFormatVerification.maskMatch,
    });
  } else {
    log.warn(
      'FORMAT_PARSER_DISAGREEMENT: Final matrix format verification disagreement (diagnostic)',
      {
        expectedEcc: ecc,
        extractedEcc: finalFormatVerification.extractedEcc,
        eccMatch: finalFormatVerification.eccMatch,
        expectedMask: actualMask,
        extractedMask: finalFormatVerification.extractedMask,
        maskMatch: finalFormatVerification.maskMatch,
        parserDisagreement: finalFormatVerification.reason,
        action: 'CONTINUE_TO_SEMANTIC_VALIDATION',
        note: 'Encoder is authoritative. Semantic scan validation is the real gate.',
      }
    );
  }

  const matrixDiff = analyzeMatrixDiff(baseMatrix, finalMatrix, moduleCount);
  const { diffCount, structuralDiffCount, dataDiffCount, sampleDiffs } = matrixDiff;

  log.info('Matrix diff between base and final', {
    diffCount,
    structuralDiffCount,
    dataDiffCount,
    moduleCount,
    totalModules: moduleCount * moduleCount,
    diffPercent: `${((diffCount / (moduleCount * moduleCount)) * 100).toFixed(2)}%`,
    sampleDiffs: sampleDiffs.slice(0, 5),
  });

  if (structuralDiffCount > 0) {
    log.warn('CRITICAL: Structural patterns modified!', {
      structuralDiffCount,
      structuralDiffs: sampleDiffs.filter((d) => d.isStructural),
    });
  }

  const finderValidation = validateFinderPatterns(finalMatrix);
  if (finderValidation.allValid) {
    log.debug('Finder patterns validated OK');
  } else {
    log.warn('FINDER PATTERNS CORRUPTED', {
      topLeft: finderValidation.topLeft,
      topRight: finderValidation.topRight,
      bottomLeft: finderValidation.bottomLeft,
      errors: finderValidation.errors,
    });
  }

  const timingValidation = validateTimingPatterns(finalMatrix);
  if (timingValidation.allValid) {
    log.debug('Timing patterns validated OK');
  } else {
    log.warn('TIMING PATTERNS CORRUPTED', {
      horizontal: timingValidation.horizontal,
      vertical: timingValidation.vertical,
      errors: timingValidation.errors,
    });
  }

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
    formatInfoUnchanged:
      baseFormatInfo.vertical === finalFormatInfo.vertical &&
      baseFormatInfo.horizontal === finalFormatInfo.horizontal,
  });

  if (
    baseFormatInfo.vertical !== finalFormatInfo.vertical ||
    baseFormatInfo.horizontal !== finalFormatInfo.horizontal
  ) {
    log.warn('FORMAT INFO CHANGED - This will break scanning!');
  }

  return {
    structuralDiffCount,
    dataDiffCount,
    finderValidation,
    timingValidation,
    baseFormatInfo,
    finalFormatInfo,
  };
}

function performSemanticGateAndFallback(
  finalMatrix: boolean[][],
  baseMatrix: boolean[][],
  originalData: string,
  data: string,
  encodedData: string,
  ecc: ECCLevel,
  actualMask: number,
  actualSuffix: string,
  strictSuffix: boolean,
  resolvedSuffixMode: 'byte' | 'numeric',
  originalDataLength: number,
  scanResult: ScanResult,
  blockSelections: BlockSelectionResult[],
  elimination: EliminationResult,
  importance: number[][],
  moduleCount: number,
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  totalSelected: number,
  diagnostics: {
    structuralDiffCount: number;
    dataDiffCount: number;
    finderValidation: ReturnType<typeof validateFinderPatterns>;
    timingValidation: ReturnType<typeof validateTimingPatterns>;
    baseFormatInfo: ReturnType<typeof extractFormatInfo>;
    finalFormatInfo: ReturnType<typeof extractFormatInfo>;
  },
  actualControlPercentage: number,
  basisVectorCount: number
): { finalMatrixToUse: boolean[][]; actualVectorsApplied: number } {
  const semanticValidation = performSemanticValidation(
    finalMatrix,
    originalData,
    ecc,
    actualMask,
    actualSuffix,
    scanMatrixWithJsQR,
    strictSuffix,
    resolvedSuffixMode
  );

  let currentScanResult = scanResult;
  let finalMatrixToUse = finalMatrix;
  let actualVectorsApplied = totalSelected;

  if (semanticValidation.valid) {
    log.info('QR-Art SEMANTIC-HARD-GATE validation PASSED', {
      originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
      originalDataLength,
      decodedDataLength: scanResult.data?.length,
      ecc,
      mask: actualMask,
      strictSuffix,
      structurallyValid: scanResult.structurallyValid,
      segmentCount: scanResult.segmentCount,
      segmentModes: scanResult.segments?.map((s) => s.modeName),
      validationMethod: 'SEMANTIC_HARD_GATE',
      checksPerformed: [
        'SCAN_SUCCESS',
        'LENGTH_CHECK',
        'BYTE_EXACT_PREFIX',
        'ECC_INVARIANT',
        'MASK_INVARIANT',
        'STRUCTURAL_VALIDITY',
        strictSuffix ? 'SUFFIX_CHARSET_STRICT' : 'SUFFIX_CHARSET_SOFT',
      ],
    });
  } else {
    log.warn('QR-Art SEMANTIC-HARD-GATE validation FAILED', {
      rejectionReason: semanticValidation.reason,
      description: semanticValidation.description,
      details: semanticValidation.details,
      originalData: data.length > 50 ? `${data.slice(0, 50)}...` : data,
      originalDataLength,
      ecc,
      mask: actualMask,
      structurallyValid: scanResult.structurallyValid,
      segmentCount: scanResult.segmentCount,
      segmentModes: scanResult.segments?.map((s) => s.modeName),
      segments: scanResult.segments?.map((s) => ({
        mode: s.modeName,
        charCount: s.charCount,
        valid: s.valid,
        bitOffset: s.bitOffset,
      })),
      note: 'Candidate rejected by semantic-hard-gate',
    });

    if (scanResult.success && scanResult.data) {
      const expectedBytes = stringToBytes(data);
      const actualBytes = stringToBytes(scanResult.data);
      log.warn('DECODED BYTES (hex comparison)', {
        decodedPrefixHex: toHex(actualBytes.slice(0, originalDataLength)),
        expectedPrefixHex: toHex(expectedBytes),
        mismatchIndex: semanticValidation.details?.mismatchIndex,
        expectedByte: semanticValidation.details?.expectedByte?.toString(16),
        actualByte: semanticValidation.details?.actualByte?.toString(16),
      });
    }

    currentScanResult = {
      success: false,
      error: `Semantic validation failed: ${semanticValidation.reason} - ${semanticValidation.description}`,
    };
  }

  if (!currentScanResult.success) {
    log.warn('QR-Art matrix scan validation FAILED - matrix does not scan!', {
      error: currentScanResult.error,
      expectedData: encodedData,
      scanAttempts: currentScanResult.attempts,
      finderPatternsOK: diagnostics.finderValidation.allValid,
      timingPatternsOK: diagnostics.timingValidation.allValid,
      formatInfoOK: diagnostics.baseFormatInfo.vertical === diagnostics.finalFormatInfo.vertical,
      structuralDiffsCount: diagnostics.structuralDiffCount,
      dataDiffsCount: diagnostics.dataDiffCount,
      controllableVectors: basisVectorCount,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
    });

    const fallbackResult = handleScanFailureFallback(
      blockSelections,
      elimination,
      importance,
      moduleCount,
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      actualVersion,
      ecc,
      actualMask,
      data,
      actualSuffix,
      strictSuffix,
      totalSelected,
      baseMatrix
    );

    finalMatrixToUse = fallbackResult.matrix;
    actualVectorsApplied = fallbackResult.vectorsApplied;
  }

  return { finalMatrixToUse, actualVectorsApplied };
}

function countFinalMatchingPixels(
  finalMatrix: boolean[][],
  targets: boolean[][],
  dataPixels: Set<number>,
  moduleCount: number
): number {
  let matching = 0;
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const pixelIdx = row * moduleCount + col;
      if (!dataPixels.has(pixelIdx)) continue;
      const finalValue = finalMatrix[row]?.[col] ?? false;
      const targetValue = targets[row]?.[col] ?? false;
      if (finalValue === targetValue) {
        matching++;
      }
    }
  }
  return matching;
}

function performZeroModificationTest(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  blockDataCounts: number[],
  blockEccCounts: number[],
  actualVersion: number,
  ecc: ECCLevel,
  actualMask: number,
  encodedData: string
): void {
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
  if (zeroModScan.success) {
    const matchesData = zeroModScan.data === encodedData;
    if (matchesData) {
      log.debug('Zero-modification test PASSED - decoded data matches exactly', {
        decodedData: zeroModScan.data,
      });
    } else {
      log.warn('Zero-modification test FAILED - decoded data mismatch!', {
        decodedData: zeroModScan.data,
        expectedData: encodedData,
      });
    }
  } else {
    log.warn('ZERO-MODIFICATION TEST FAILED - regeneration itself is broken!', {
      error: zeroModScan.error,
    });
  }
}

function validateBoundariesAndBaseline(
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  actualSuffix: string,
  originalDataLength: number,
  protectedDataLength: number,
  baseMatrix: boolean[][],
  moduleCount: number,
  data: string,
  encodedDataLength: number,
  autoSuffix: boolean,
  suffix: string | undefined
): string | null {
  const internalConsistencyOk =
    encoderLayout.bitsAfterData >= encoderLayout.bitsAfterOriginalData &&
    encoderLayout.paddingSafeStartBit >= encoderLayout.suffixSafeEndBit &&
    encoderLayout.protectedBitEnd <= encoderLayout.suffixSafeStartBit &&
    encoderLayout.totalDataBytes > 0;

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
      internalConsistencyOk,
    },
    protection: {
      protectedBitEnd: encoderLayout.protectedBitEnd,
      protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
      protectedBytesCount: Math.ceil(encoderLayout.protectedBitEnd / 8),
      originalDataLength,
      protectedDataLength,
      hashCharProtected: actualSuffix.startsWith('#'),
    },
    twoIntervalRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit} (${encoderLayout.suffixBits} bits)`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit} (${encoderLayout.paddingBits} bits)`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE]`,
    },
    controllable: {
      totalSuffixBits: encoderLayout.suffixBits,
      totalPaddingBits: encoderLayout.paddingBits,
      totalControllableBits: encoderLayout.suffixBits + encoderLayout.paddingBits,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  if (!internalConsistencyOk) {
    log.warn('INTERNAL CONSISTENCY FAILURE - encoder boundary math is wrong!', {
      bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
      bitsAfterData: encoderLayout.bitsAfterData,
      bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
      originalDataLength,
      note: 'This is a bug in encodeDataToBytes()',
    });
    return 'Internal consistency failure: encoder boundary math incorrect';
  }

  log.info('ENCODER-DERIVED SEMANTIC LAYOUT (TWO-INTERVAL HYBRID STRATEGY)', {
    version: actualVersion,
    ecc,
    originalDataLength: encoderLayout.originalDataLength,
    suffixLength: encoderLayout.suffixLength,
    fullDataLength: encodedDataLength,
    encoderCheckpoints: {
      bitsAfterMode: encoderLayout.bitsAfterMode,
      bitsAfterCharCount: encoderLayout.bitsAfterCharCount,
      bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
      bitsAfterData: `${encoderLayout.bitsAfterData} [SUFFIX END - TERMINATOR STARTS HERE]`,
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
    twoIntervalSafeRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit} (${encoderLayout.suffixBits} safe bits)`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit} (${encoderLayout.paddingBits} safe bits)`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits) [TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!]`,
    },
    controllable: {
      totalControllableBits: encoderLayout.suffixBits + encoderLayout.paddingBits,
      controllablePercent: `${(((encoderLayout.suffixBits + encoderLayout.paddingBits) / (encoderLayout.totalDataBytes * 8)) * 100).toFixed(1)}%`,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

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
    note:
      baseDarkPercent > 60 || baseDarkPercent < 40
        ? 'Baseline is unbalanced - QR-Art may struggle'
        : 'Baseline is balanced',
  });

  const baseVerifyError = verifyBaseMatrixScan(baseMatrix, data, originalDataLength);
  return baseVerifyError;
}

function verifyModifiedDataIntegrity(
  blockDataArrays: Uint8Array[],
  blockEccArrays: Uint8Array[],
  modifiedBlockData: Uint8Array[],
  modifiedBlockEcc: Uint8Array[],
  blockEccCounts: number[],
  allowedBitRanges: BitRange[],
  encoderLayout: EncoderDerivedLayout,
  actualVersion: number,
  ecc: ECCLevel,
  totalSelected: number
): string | null {
  const rsLinearityOk = verifyRSLinearityAllBlocks(
    modifiedBlockData,
    modifiedBlockEcc,
    blockEccCounts
  );
  if (!rsLinearityOk) {
    return 'RS linearity broken - modified codewords are invalid';
  }

  const { anyBlockOverBudget } = estimateBlockECCDamage(
    blockDataArrays,
    modifiedBlockData,
    blockEccCounts
  );

  if (anyBlockOverBudget) {
    log.warn('ECC budget exceeded in one or more blocks - falling back to binary search', {
      suggestion: 'Reduce number of vectors or use higher ECC level',
      note: 'Binary search fallback will find maximum safe vector count',
    });
  }

  log.info('BOUNDARY AUDIT (single source of truth: encoderLayout)', {
    version: actualVersion,
    stage: 'PRE_SCAN',
    source: 'ENCODER_DERIVED_TWO_INTERVAL',
    protection: {
      protectedBitEnd: encoderLayout.protectedBitEnd,
      protectedByteEnd: Math.ceil(encoderLayout.protectedBitEnd / 8),
      originalDataLength: encoderLayout.originalDataLength,
    },
    twoIntervalRanges: {
      interval1_suffix: `bits ${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      interval2_padding: `bits ${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gap_protected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits)`,
    },
    controllable: {
      vectorsApplied: totalSelected,
      anyBlockOverBudget,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
  });

  const blockAllowedBits = mapAllowedRangesToBlocks(allowedBitRanges, actualVersion, ecc);

  const protectedCheck = verifyProtectedBytes(blockDataArrays, modifiedBlockData, blockAllowedBits);

  if (!protectedCheck.valid) {
    log.warn('PROTECTED BYTES MODIFIED - HYBRID protection violation!', {
      violationCount: protectedCheck.violations.length,
      violations: protectedCheck.violations.slice(0, 10),
      protectedBitEnd: encoderLayout.protectedBitEnd,
      originalDataLength: encoderLayout.originalDataLength,
      note: 'Vectors modified original data bytes - algorithm bug!',
    });
    log.warn('FAILING FAST - returning base matrix due to protected byte violation');
    return `Protected byte violation: ${protectedCheck.violations.length} original data bytes were modified`;
  }

  log.info('HYBRID protection validation PASSED (TWO-INTERVAL encoder-derived)', {
    protectedBitRange: `0 - ${encoderLayout.protectedBitEnd} (mode + charCount + original data)`,
    twoIntervalRanges: {
      interval1_suffix: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      interval2_padding: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      gap_protected: `${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (terminator + pad-to-byte)`,
    },
    originalDataLength: encoderLayout.originalDataLength,
    suffixLength: encoderLayout.suffixLength,
    totalVectorsApplied: totalSelected,
    protectedBytesChecked: 'all blocks verified (including terminator gap)',
  });

  return null;
}

function logSelectionTiming(
  timingEnabled: boolean,
  timingMarks: Record<string, number>,
  preReduceTargetCount: number | undefined,
  totalSelected: number
): void {
  if (!timingEnabled) return;
  const t = timingMarks;
  log.info('QART selection timing', {
    selectMs:
      t.select_done && t.select_start ? (t.select_done - t.select_start).toFixed(1) : undefined,
    eccApplyMs:
      t.ecc_apply_done && t.ecc_apply_start
        ? (t.ecc_apply_done - t.ecc_apply_start).toFixed(1)
        : undefined,
    flattenMs:
      t.flatten_done && t.flatten_start ? (t.flatten_done - t.flatten_start).toFixed(1) : undefined,
    numericFilterMs:
      t.numeric_filter_done && t.numeric_filter_start
        ? (t.numeric_filter_done - t.numeric_filter_start).toFixed(1)
        : undefined,
    preReduceTargetCount,
    totalSelected,
  });
}

interface QArtCoreParams {
  data: string;
  targetImage: ImageData | HTMLCanvasElement | OffscreenCanvas;
  ecc: ECCLevel;
  maskPattern: number;
  onProgress?: (stage: string, percent: number) => void;
  performanceSettings: QArtPerformanceSettings;
  performanceProfile: QArtPerformanceProfile;
  resolvedSuffixMode: 'numeric' | 'byte';
  encodingSuffixMode: 'numeric' | 'byte';
  encodedData: string;
  actualSuffix: string;
  originalData: string;
  originalDataLength: number;
  versionToUse: number;
  strictSuffix: boolean;
  autoSuffix: boolean;
  suffix?: string;
}

async function generateFullQArtCore(params: QArtCoreParams): Promise<FullQArtResult> {
  const {
    data,
    targetImage,
    ecc,
    maskPattern,
    onProgress,
    performanceSettings,
    performanceProfile,
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    strictSuffix,
    autoSuffix,
    suffix,
  } = params;

  onProgress?.('Encoding base data', 0);

  // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
  // HYBRID MODE: Pass protectedDataLength to track protection boundaries
  // CRITICAL: When using byte-mode suffix with a leading '#', protect the separator.
  // In numeric mode, the prefix already includes '#', so originalDataLength is correct.
  const protectedDataLength =
    resolvedSuffixMode === 'byte' && actualSuffix.startsWith('#')
      ? originalDataLength + 1
      : originalDataLength;

  const baseResult = generateBaseQR(
    encodedData,
    versionToUse,
    ecc,
    maskPattern,
    protectedDataLength,
    encodingSuffixMode
  );

  // FAIL FAST: If base matrix generation failed (e.g., ECC/mask mismatch), return error immediately
  if (!baseResult.success) {
    log.warn('BASE QR GENERATION FAILED - FAIL FAST!', {
      error: baseResult.error,
      rejectionReason: baseResult.rejectionReason,
      errorDetails: baseResult.errorDetails,
      note: 'This indicates a critical bug in the QR encoder or regeneration pipeline',
    });

    return {
      success: false,
      error: baseResult.error ?? 'Base QR generation failed with unknown error',
      matrix: baseResult.matrix,
      moduleCount: baseResult.matrix.length,
      version: baseResult.actualVersion,
      maskPattern: baseResult.actualMask,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: encodedData,
      originalData: data,
      suffix: actualSuffix,
    };
  }

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

  // Step 1.5: Validate boundaries, compute baseline stats, verify base matrix
  onProgress?.('Analyzing semantic layout', 5);

  const boundaryError = validateBoundariesAndBaseline(
    encoderLayout,
    actualVersion,
    ecc,
    actualSuffix,
    originalDataLength,
    protectedDataLength,
    baseMatrix,
    moduleCount,
    data,
    encodedData.length,
    autoSuffix,
    suffix
  );
  if (boundaryError) {
    return buildQArtFailResult(
      boundaryError,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix
    );
  }

  onProgress?.('Building RS basis', 10);

  // Step 2: Build RS basis with TWO-INTERVAL RANGE protection (HYBRID STRATEGY)
  // =========================================================================
  // CRITICAL FIX: Use TWO separate byte-aligned intervals, NOT one continuous range!
  // =========================================================================
  // INTERVAL 1: Suffix BYTES only (excludes boundary byte with terminator)
  // INTERVAL 2: Padding codeword BYTES only (0xEC 0x11 pattern)
  // GAP: Terminator + pad-to-byte bits are PROTECTED (never modify!)
  //
  // This prevents the decoder from seeing fake mode indicators when terminator bits flip.
  const allowedBitRanges = encoderLayout.allowedBitRanges;

  log.info('TWO-INTERVAL SAFE RANGES for RS basis', {
    numIntervals: allowedBitRanges.length,
    interval1_suffix: allowedBitRanges[0]
      ? `bits ${allowedBitRanges[0].startBit} - ${allowedBitRanges[0].endBit}`
      : 'NONE',
    interval2_padding: allowedBitRanges[1]
      ? `bits ${allowedBitRanges[1].startBit} - ${allowedBitRanges[1].endBit}`
      : 'NONE (may be included in interval 1)',
    gap_protected: {
      startBit: encoderLayout.gapStartBit,
      endBit: encoderLayout.gapEndBit,
      bitCount: encoderLayout.gapBitCount,
      description: 'TERMINATOR + PAD-TO-BYTE - NEVER MODIFY!',
    },
  });

  const basis = buildFullBasis(actualVersion, ecc, allowedBitRanges);

  const protectedBitEnd = encoderLayout.protectedBitEnd;
  const gapStartBit = encoderLayout.gapStartBit;
  const gapEndBit = encoderLayout.gapEndBit;

  const vectorsInProtectedRegion = validateBasisVectorSafety(
    basis.vectors,
    blockDataCounts,
    protectedBitEnd,
    gapStartBit,
    gapEndBit
  );

  if (vectorsInProtectedRegion.length > 0) {
    const originalDataViolations = vectorsInProtectedRegion.filter(
      (v) => v.violationType === 'ORIGINAL_DATA'
    );
    const terminatorViolations = vectorsInProtectedRegion.filter(
      (v) => v.violationType === 'TERMINATOR_GAP'
    );

    log.warn('CRITICAL: Basis vectors exist in PROTECTED region or TERMINATOR GAP!', {
      protectedBitEnd,
      gapRange: `${gapStartBit} - ${gapEndBit}`,
      originalDataViolations: originalDataViolations.length,
      terminatorViolations: terminatorViolations.length,
      totalViolations: vectorsInProtectedRegion.length,
      sampleViolations: vectorsInProtectedRegion.slice(0, 10),
      note:
        originalDataViolations.length > 0
          ? 'These vectors would corrupt original data!'
          : 'These vectors would corrupt terminator bits (causing fake mode indicators)!',
    });

    // FAIL FAST - this is a fundamental bug in allowed range calculation
    return buildQArtFailResult(
      `${vectorsInProtectedRegion.length} basis vectors touch protected/gap bits - algorithm bug`,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix
    );
  }

  log.info(
    'GUARD PASSED: All basis vectors are in allowed regions (suffix bytes OR padding bytes)',
    {
      protectedBitEnd,
      gapRange: `${gapStartBit} - ${gapEndBit} (${encoderLayout.gapBitCount} bits protected)`,
      suffixSafeRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      paddingSafeRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      vectorCount: basis.vectors.length,
      numIntervals: encoderLayout.allowedBitRanges.length,
      stage: 'POST_BASIS_BUILD',
    }
  );

  // Calculate actual controllable bits
  const actualControllableBits = basis.vectors.length;
  const totalDataBits = encoderLayout.totalDataBytes * 8;
  const actualControlPercentage =
    totalDataBits > 0 ? (actualControllableBits / totalDataBits) * 100 : 0;
  const expectedControllableBits = encoderLayout.suffixBits + encoderLayout.paddingBits;

  log.info('QR-Art capacity analysis (TWO-INTERVAL HYBRID STRATEGY)', {
    totalDataBits,
    protectedBits: encoderLayout.protectedBitEnd,
    protectedContent: `mode + charCount + original data (${encoderLayout.originalDataLength} chars)`,
    twoIntervalRanges: {
      interval1_suffix: `${encoderLayout.suffixBits} bits (bytes ${Math.floor(encoderLayout.suffixSafeStartBit / 8)} - ${Math.floor(encoderLayout.suffixSafeEndBit / 8)})`,
      interval2_padding: `${encoderLayout.paddingBits} bits (bytes ${Math.floor(encoderLayout.paddingSafeStartBit / 8)} - ${Math.floor(encoderLayout.paddingSafeEndBit / 8)})`,
      gap_protected: `${encoderLayout.gapBitCount} bits (terminator + pad-to-byte)`,
    },
    controllable: {
      totalControllable: actualControllableBits,
      expectedControllable: expectedControllableBits,
      controlPercentage: `${actualControlPercentage.toFixed(1)}%`,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
    vectorsCreated: basis.vectors.length,
    source: 'ENCODER_DERIVED_TWO_INTERVAL',
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
  if (basis.vectors.length > 0) {
    log.info('Running deterministic HYBRID mutation test...');
    const mutationTestResult = runDeterministicMutationTest(
      basis.vectors[0],
      blockDataArrays,
      blockEccArrays,
      blockDataCounts,
      blockEccCounts,
      encoderLayout,
      actualVersion,
      ecc,
      actualMask,
      data,
      originalDataLength,
      actualSuffix
    );

    if (!mutationTestResult.passed) {
      return buildQArtFailResult(
        mutationTestResult.error ?? 'HYBRID mutation test failed',
        baseMatrix,
        moduleCount,
        actualVersion,
        actualMask,
        encodedData,
        data,
        actualSuffix
      );
    }
  }

  onProgress?.('Mapping bits to pixels', 20);

  // Step 3: Build bit-to-pixel mapping
  const mappings = buildBitPixelMap(actualVersion, ecc, actualMask);

  log.debug('Bit-pixel mapping built', {
    totalMappings: mappings.length,
  });

  onProgress?.('Processing target image', 30);

  // Step 4: Map target image to module targets
  const { targets, importance } = mapImageToTargetsSupersampled(targetImage, moduleCount, 128, {
    supersampleLevel: performanceSettings.supersampleLevel,
    cleanupSpeckles: true,
    maxDarkSpeckleArea: performanceSettings.maxDarkSpeckleArea,
    maxLightHoleArea: performanceSettings.maxLightHoleArea,
  });

  // Get set of data pixels
  const dataPixelIndices = getDataPixelIndices(actualVersion);
  const dataPixels = new Set(dataPixelIndices);

  onProgress?.('Ranking pixels by importance', 40);

  // Step 5: Rank pixels by importance
  const rankedPixelOrder = rankPixelsByImportance(targets, importance, moduleCount, dataPixels);
  let eliminationPixelOrder = rankedPixelOrder;
  if (performanceSettings.maxCandidateFraction < 1) {
    const candidateCap = Math.max(
      64,
      Math.floor(moduleCount * moduleCount * performanceSettings.maxCandidateFraction)
    );
    const cappedLength = Math.min(rankedPixelOrder.length, candidateCap);
    eliminationPixelOrder = rankedPixelOrder.slice(0, cappedLength);
    log.info('QR-Art candidate cap applied', {
      originalCandidates: rankedPixelOrder.length,
      cappedCandidates: eliminationPixelOrder.length,
      moduleCount,
      performanceProfile,
    });
  }

  log.debug('Pixels ranked', {
    totalDataPixels: rankedPixelOrder.length,
    eliminationCandidates: eliminationPixelOrder.length,
  });

  onProgress?.('Performing Gauss-Jordan elimination', 50);

  // Step 6: Gauss-Jordan elimination
  const elimination = gaussJordanEliminate(
    basis.vectors,
    mappings,
    moduleCount,
    actualMask,
    eliminationPixelOrder
  );

  log.info('Gauss-Jordan elimination complete', {
    controllablePixels: elimination.controllablePixels,
    totalDataPixels: eliminationPixelOrder.length,
    controlPercentage: `${((elimination.controllablePixels / Math.max(1, eliminationPixelOrder.length)) * 100).toFixed(1)}%`,
  });

  onProgress?.('Selecting basis vectors', 70);

  // Step 7: Select which vectors to apply (per-block)
  const timingEnabled = typeof process !== 'undefined' && process?.env?.QART_TIMING === '1';
  const timingMarks: Record<string, number> = {};
  const mark = (label: string) => {
    if (timingEnabled) timingMarks[label] = performance.now();
  };

  const pixelDiff = acquireUint8Buffer(moduleCount * moduleCount);
  let blockSelections: BlockSelectionResult[] = [];
  try {
    for (const pixelIdx of dataPixelIndices) {
      const row = Math.floor(pixelIdx / moduleCount);
      const col = pixelIdx % moduleCount;
      const target = targets[row]?.[col] ?? false;
      const base = baseMatrix[row]?.[col] ?? false;
      if (target !== base) pixelDiff[pixelIdx] = 1;
    }

    mark('select_start');
    blockSelections = selectBasisVectorsForTarget(
      elimination,
      targets,
      baseMatrix,
      moduleCount,
      pixelDiff
    );
    mark('select_done');
  } finally {
    releaseUint8Buffer(pixelDiff);
  }

  let totalSelected = blockSelections.reduce((sum, s) => sum + s.selectedVectorIndices.length, 0);
  log.debug('Vectors selected', {
    selectedCount: totalSelected,
    controllable: elimination.controllablePixels,
    blocksWithSelections: blockSelections.filter((s) => s.selectedVectorIndices.length > 0).length,
  });

  // Pre-reduce selection size using ECC budget ratio (fast heuristic)
  // Disabled by default: can over-reduce and remove visible artwork.
  const preReduceTargetCount: number | undefined = undefined;

  mark('flatten_start');
  let flattenedSelections = flattenAndOrderSelectionsLimited(
    blockSelections,
    elimination,
    importance,
    moduleCount,
    preReduceTargetCount
  );
  mark('flatten_done');

  if (preReduceTargetCount && flattenedSelections.length > 0) {
    blockSelections = buildBlockSelectionsFromFlattened(
      flattenedSelections,
      elimination.blockResults.map((b) => b.blockIndex)
    );
    totalSelected = flattenedSelections.length;
  }

  // Numeric suffix safety: greedily filter selections to preserve numeric validity
  if (resolvedSuffixMode === 'numeric' && strictSuffix) {
    const preFilterCount = flattenedSelections.length;
    mark('numeric_filter_start');
    const filteredSelections = filterSelectionsForNumericSuffix(
      flattenedSelections,
      blockDataArrays,
      blockDataCounts,
      encoderLayout,
      actualVersion
    );
    mark('numeric_filter_done');

    if (filteredSelections.length !== preFilterCount) {
      blockSelections = buildBlockSelectionsFromFlattened(
        filteredSelections,
        elimination.blockResults.map((b) => b.blockIndex)
      );
      totalSelected = blockSelections.reduce((sum, s) => sum + s.selectedVectorIndices.length, 0);
      flattenedSelections = filteredSelections;
      log.info('Numeric suffix selection constrained', {
        selectedCount: totalSelected,
        removed: preFilterCount - filteredSelections.length,
        controllable: elimination.controllablePixels,
      });
    }
  }

  // NOTE: No static vector cap. The binary search fallback in scan-fallback.ts
  // dynamically finds the maximum safe vector count for phone cameras.

  const _orderedSelections = flattenedSelections;

  logSelectionTiming(timingEnabled, timingMarks, preReduceTargetCount, totalSelected);

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

  // Step 9: Apply vectors and verify integrity (RS linearity, ECC damage, protected bytes)
  const modifiedBlockData = blockDataArrays.map((arr) => new Uint8Array(arr));
  const modifiedBlockEcc = blockEccArrays.map((arr) => new Uint8Array(arr));
  applyAllSelectedVectors(
    modifiedBlockData,
    modifiedBlockEcc,
    elimination,
    blockSelections,
    blockDataCounts
  );

  const integrityError = verifyModifiedDataIntegrity(
    blockDataArrays,
    blockEccArrays,
    modifiedBlockData,
    modifiedBlockEcc,
    blockEccCounts,
    allowedBitRanges,
    encoderLayout,
    actualVersion,
    ecc,
    totalSelected
  );
  if (integrityError) {
    return buildQArtFailResult(
      integrityError,
      baseMatrix,
      moduleCount,
      actualVersion,
      actualMask,
      encodedData,
      data,
      actualSuffix
    );
  }

  onProgress?.('Re-encoding QR code', 85);

  // Zero-modification test - verify that regenerating with UNMODIFIED data still scans
  performZeroModificationTest(
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    ecc,
    actualMask,
    encodedData
  );

  // Log modification summary per block
  logBlockModificationSummary(blockDataArrays, modifiedBlockData, blockEccArrays, modifiedBlockEcc);

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

  // Diagnostic: Check format info, matrix diff, finder/timing patterns, format info comparison
  const diagnostics = validateFinalMatrixDiagnostics(
    finalMatrix,
    baseMatrix,
    ecc,
    actualMask,
    moduleCount
  );

  // Scan the final matrix to verify it's actually scannable
  const scanResult = scanMatrixWithJsQR(finalMatrix);

  // Semantic-hard-gate validation + fallback if needed
  const { finalMatrixToUse, actualVectorsApplied } = performSemanticGateAndFallback(
    finalMatrix,
    baseMatrix,
    originalData,
    data,
    encodedData,
    ecc,
    actualMask,
    actualSuffix,
    strictSuffix,
    resolvedSuffixMode,
    originalDataLength,
    scanResult,
    blockSelections,
    elimination,
    importance,
    moduleCount,
    blockDataArrays,
    blockEccArrays,
    blockDataCounts,
    blockEccCounts,
    actualVersion,
    totalSelected,
    diagnostics,
    actualControlPercentage,
    basis.vectors.length
  );

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
  const matching = countFinalMatchingPixels(finalMatrixToUse, targets, dataPixels, moduleCount);

  const matchPercentage = total > 0 ? (matching / total) * 100 : 0;

  // Get final scan result for segment info
  const finalScan = scanMatrixWithJsQR(finalMatrixToUse);

  log.info('QR-Art generation complete (SEMANTIC-HARD-GATE TWO-INTERVAL HYBRID)', {
    success: true,
    matchingPixels: matching,
    totalControllable: total,
    matchPercentage: `${matchPercentage.toFixed(1)}%`,
    vectorsApplied: actualVectorsApplied,
    usedBinarySearchFallback: actualVectorsApplied < totalSelected,
    originalDataLength,
    suffixLength: actualSuffix.length,
    controllablePercent: `${actualControlPercentage.toFixed(1)}%`,
    strictSuffix,
    semanticValidation: {
      eccInvariantLocked: true,
      maskInvariantLocked: true,
      byteExactPrefixMatch: true,
      formatInfoVerified: true,
      structuralValidityChecked: true,
      suffixCharsetMode: strictSuffix ? 'STRICT' : 'RELAXED',
      ecc,
      mask: actualMask,
    },
    structuralInfo: {
      structurallyValid: finalScan.structurallyValid,
      segmentCount: finalScan.segmentCount,
      segmentModes: finalScan.segments?.map((s) => s.modeName),
    },
    twoIntervalStrategy: {
      suffixSafeBits: encoderLayout.suffixBits,
      paddingSafeBits: encoderLayout.paddingBits,
      gapProtectedBits: encoderLayout.gapBitCount,
      numIntervals: encoderLayout.allowedBitRanges.length,
    },
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
}

export async function generateFullQArt(config: FullQArtConfig): Promise<FullQArtResult> {
  const {
    data,
    targetImage,
    version,
    ecc,
    maskPattern,
    onProgress,
    suffix,
    suffixMode = 'auto',
    autoSuffix = true, // Default to auto-generating suffix for better control
    minPadCodewords = 10, // Lower default since suffix provides most control
    forceVersion,
    targetControlPercent = 100,
    strictSuffix = true, // Default to true for real-world scannability
    lockVersionToMinimum = false,
    performanceProfile = 'quality',
  } = config;
  const performanceSettings = resolvePerformanceSettings(performanceProfile);

  const suffixConfig = resolveQArtSuffixConfig({
    data,
    version,
    ecc,
    suffix,
    suffixMode,
    autoSuffix,
    minPadCodewords,
    forceVersion,
    targetControlPercent,
    lockVersionToMinimum,
  });

  const {
    resolvedSuffixMode,
    encodingSuffixMode,
    encodedData,
    actualSuffix,
    originalData,
    originalDataLength,
    versionToUse,
    versionWasUpgradedForQArt,
  } = suffixConfig;

  // Log the encoding target (HYBRID mode)
  log.info('QR-Art encoding target (HYBRID STRATEGY)', {
    originalData: originalData.length > 50 ? `${originalData.slice(0, 50)}...` : originalData,
    originalDataLength,
    suffix: actualSuffix.length > 30 ? `${actualSuffix.slice(0, 30)}...` : actualSuffix,
    suffixLength: actualSuffix.length,
    fullEncodedLength: encodedData.length,
    versionToUse,
    versionWasUpgradedForQArt,
    minQArtVersion: MIN_QART_VERSION,
    ecc,
    strictSuffix,
    suffixMode: resolvedSuffixMode,
    strategy: 'HYBRID - original data protected, suffix + padding controllable',
    suffixPolicy: strictSuffix
      ? resolvedSuffixMode === 'numeric'
        ? 'STRICT - numeric suffix digits only'
        : 'STRICT - suffix must contain only URL-safe characters'
      : 'RELAXED - suffix can contain ANY byte values (max QArt control)',
  });

  try {
    return await generateFullQArtCore({
      data,
      targetImage,
      ecc,
      maskPattern,
      onProgress,
      performanceSettings,
      performanceProfile,
      resolvedSuffixMode,
      encodingSuffixMode,
      encodedData,
      actualSuffix,
      originalData,
      originalDataLength,
      versionToUse,
      strictSuffix,
      autoSuffix,
      suffix,
    });
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
function resolveSharedSuffix(
  config: Omit<FullQArtConfig, 'maskPattern'>,
  resolvedSuffixMode: 'numeric' | 'byte',
  suffixLength: number,
  sharedVersion: number
): string {
  if (config.suffix !== undefined) return config.suffix;
  if (config.autoSuffix !== false) {
    const baseSeed = hashStringToSeed(config.data + sharedVersion.toString() + config.ecc);
    const searchSeedOffset = config.searchSeed ?? 0;
    const seed = (baseSeed ^ searchSeedOffset) >>> 0;
    if (resolvedSuffixMode === 'numeric') {
      return generateDeterministicNumericSuffix(Math.max(0, suffixLength), seed);
    }
    return `#${generateDeterministicSuffix(Math.max(0, suffixLength - 1), seed)}`;
  }
  return '';
}

function prepareBestMaskConfig(config: Omit<FullQArtConfig, 'maskPattern'>): {
  resolvedSuffixMode: 'numeric' | 'byte';
  sharedVersion: number;
  sharedSuffix: string;
} {
  const targetControlPercent = config.targetControlPercent ?? 100;
  const resolvedSuffixMode: 'numeric' | 'byte' =
    config.suffixMode === 'numeric'
      ? 'numeric'
      : config.suffixMode === 'byte'
        ? 'byte'
        : /^https?:\/\//i.test(config.data)
          ? 'numeric'
          : 'byte';

  const requestedVersion = config.forceVersion ?? config.version;
  const controlTarget =
    config.lockVersionToMinimum || (requestedVersion ?? 0) > 0 ? 0 : targetControlPercent;

  const optimalConfig = calculateOptimalVersionAndSuffix(
    requestedVersion,
    config.ecc,
    config.data.length,
    controlTarget,
    resolvedSuffixMode
  );

  const sharedVersion = config.forceVersion ?? optimalConfig.version;
  const sharedSuffix = resolveSharedSuffix(
    config,
    resolvedSuffixMode,
    optimalConfig.suffixLength,
    sharedVersion
  );

  log.info('Pre-selected version and DETERMINISTIC suffix for mask comparison (HYBRID mode)', {
    sharedVersion,
    originalDataLength: config.data.length,
    suffixLength: sharedSuffix.length,
    paddingBytes: optimalConfig.paddingBytes,
    expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
    encoding:
      resolvedSuffixMode === 'numeric' ? 'mixed (byte + numeric)' : 'byte mode (single segment)',
    lockVersionToMinimum: config.lockVersionToMinimum,
    note: 'Each mask will use the same DETERMINISTIC suffix for fair comparison',
  });

  return { resolvedSuffixMode, sharedVersion, sharedSuffix };
}

function checkBalancedMaskEarlyExit(
  bestResult: FullQArtResult,
  lastBestMatch: number,
  masksWithoutMeaningfulGain: number,
  mask: number
): { shouldExit: boolean; masksWithoutMeaningfulGain: number } {
  if (bestResult.matchPercentage >= BALANCED_MASK_EARLY_EXIT_THRESHOLD) {
    log.info('Balanced profile: ending mask search early after reaching target match', {
      maskEvaluated: mask + 1,
      matchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
      threshold: `${BALANCED_MASK_EARLY_EXIT_THRESHOLD}%`,
    });
    return { shouldExit: true, masksWithoutMeaningfulGain };
  }

  if (
    lastBestMatch >= 0 &&
    bestResult.matchPercentage - lastBestMatch < BALANCED_MASK_STALL_DELTA
  ) {
    masksWithoutMeaningfulGain += 1;
  } else {
    masksWithoutMeaningfulGain = 0;
  }

  if (masksWithoutMeaningfulGain >= BALANCED_MASK_STALL_WINDOW && mask >= 3) {
    log.info('Balanced profile: stopping mask search due to stalled improvement', {
      maskEvaluated: mask + 1,
      bestMatchPercentage: `${bestResult.matchPercentage.toFixed(1)}%`,
      stallWindow: BALANCED_MASK_STALL_WINDOW,
      minGain: BALANCED_MASK_STALL_DELTA,
    });
    return { shouldExit: true, masksWithoutMeaningfulGain };
  }

  return { shouldExit: false, masksWithoutMeaningfulGain };
}

export async function generateFullQArtBestMask(
  config: Omit<FullQArtConfig, 'maskPattern'>
): Promise<FullQArtResult> {
  let bestResult: FullQArtResult | null = null;
  const performanceProfile = config.performanceProfile ?? 'quality';
  let masksWithoutMeaningfulGain = 0;
  let lastBestMatch = -1;

  const { resolvedSuffixMode, sharedVersion, sharedSuffix } = prepareBestMaskConfig(config);

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      forceVersion: sharedVersion,
      suffix: sharedSuffix,
      suffixMode: resolvedSuffixMode,
      autoSuffix: false,
      maskPattern: mask,
      strictSuffix: config.strictSuffix ?? true,
      onProgress: (stage, percent) => {
        config.onProgress?.(`Mask ${mask}: ${stage}`, (mask * 100 + percent) / 8);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    }

    if (performanceProfile !== 'balanced' || !bestResult) continue;

    const earlyExit = checkBalancedMaskEarlyExit(
      bestResult,
      lastBestMatch,
      masksWithoutMeaningfulGain,
      mask
    );
    masksWithoutMeaningfulGain = earlyExit.masksWithoutMeaningfulGain;
    lastBestMatch = bestResult.matchPercentage;
    if (earlyExit.shouldExit) break;
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
      encodedData:
        resolvedSuffixMode === 'numeric'
          ? `${config.data.split('#')[0]}#${sharedSuffix}`
          : config.data + sharedSuffix,
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
  const attempts = Math.max(1, Math.min(8, Math.floor(config.searchAttempts ?? 1)));
  if (attempts === 1) {
    return generateFullQArtBestMask(config);
  }

  let bestResult: FullQArtResult | null = null;
  let lastFailure: FullQArtResult | null = null;
  const baseSearchSeed = config.searchSeed ?? 0;

  for (let attempt = 0; attempt < attempts; attempt++) {
    const attemptSeed = (baseSearchSeed + Math.imul(attempt + 1, 0x9e3779b1)) >>> 0;
    const result = await generateFullQArtBestMask({
      ...config,
      searchAttempts: 1,
      searchSeed: attemptSeed,
      onProgress: (stage, percent) => {
        const scaledPercent = Math.trunc((attempt * 100 + percent) / attempts);
        config.onProgress?.(`Attempt ${attempt + 1}/${attempts}: ${stage}`, scaledPercent);
      },
    });

    if (result.success) {
      if (!bestResult || result.matchPercentage > bestResult.matchPercentage) {
        bestResult = result;
      }
    } else {
      lastFailure = result;
    }
  }

  if (bestResult) {
    config.onProgress?.('Complete', 100);
    return bestResult;
  }

  return (
    lastFailure ?? {
      success: false,
      error: 'All search attempts failed',
      matrix: [],
      moduleCount: 0,
      version: 0,
      maskPattern: 0,
      matchingPixels: 0,
      totalControllable: 0,
      matchPercentage: 0,
      encodedData: config.data,
      originalData: config.data,
      suffix: '',
    }
  );
}
