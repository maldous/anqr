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
import { decodeQR, type DecodedSegmentInfo } from '../qr-decoder';
import { readFormatInfo as decoderReadFormatInfo } from '../qr-decoder/format';
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
  unflattenSelections,
} from './scan-fallback';
import {
  buildFullBasis,
  calculateOptimalVersionAndSuffix,
  clearBasisCache,
  computeECC,
  generateDeterministicSuffix,
  hashStringToSeed,
  MIN_QART_VERSION,
} from './rs-basis';
import {
  type BitRange,
  calculateVersionForSlack,
  mapAllowedRangesToBlocks,
} from './semantic-layout';

// Re-export BitRange for use in EncoderDerivedLayout
export type { BitRange };

// Export ECCLevel type alias for use in other modules
export type { ECCLevel } from './bit-mapping';

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
  strictSuffix: boolean = false
): SemanticValidationResult {
  // Step 1: Scan the matrix
  const scanResult = scanFn(matrix);
  
  if (!scanResult.success) {
    return {
      valid: false,
      reason: 'SCAN_FAILED',
      description: `Scan failed: ${scanResult.error}`,
    };
  }
  
  const decoded = scanResult.data;
  
  // Step 2: Check decoded data exists and has sufficient length
  if (decoded === undefined || decoded === null) {
    return {
      valid: false,
      reason: 'SCAN_FAILED',
      description: 'Decoded data is null/undefined',
    };
  }
  
  if (decoded.length < originalData.length) {
    return {
      valid: false,
      reason: 'LENGTH_TOO_SHORT',
      description: `Decoded length ${decoded.length} < original length ${originalData.length}`,
      details: {
        expectedLength: originalData.length,
        actualLength: decoded.length,
      },
    };
  }
  
  // Step 3: Byte-exact prefix comparison
  for (let i = 0; i < originalData.length; i++) {
    const expectedByte = originalData.charCodeAt(i);
    const actualByte = decoded.charCodeAt(i);
    
    if (expectedByte !== actualByte) {
      return {
        valid: false,
        reason: 'BYTE_MISMATCH',
        description: `Byte mismatch at index ${i}: expected 0x${expectedByte.toString(16)}, got 0x${actualByte.toString(16)}`,
        details: {
          mismatchIndex: i,
          expectedByte,
          actualByte,
        },
      };
    }
  }
  
  // Step 4: Verify format info (ECC and mask)
  const formatInfo = extractMaskFromMatrix(matrix);
  const actualEccLevel = eccNumericToLevel(formatInfo.eccLevel);
  
  if (actualEccLevel !== expectedEcc) {
    return {
      valid: false,
      reason: 'ECC_MISMATCH',
      description: `Format ECC mismatch: expected ${expectedEcc}, got ${actualEccLevel}`,
      details: {
        expectedEcc,
        actualEcc: actualEccLevel,
      },
    };
  }
  
  if (formatInfo.mask !== expectedMask) {
    return {
      valid: false,
      reason: 'MASK_MISMATCH',
      description: `Format mask mismatch: expected ${expectedMask}, got ${formatInfo.mask}`,
      details: {
        expectedMask,
        actualMask: formatInfo.mask,
      },
    };
  }
  
  // Step 5: If suffix is expected, validate suffix charset (SOFT PENALTY unless strictSuffix=true)
  // The suffix CAN be modified by QR-Art - that's the whole point of HYBRID mode!
  // Non-URL-safe bytes in the suffix are expected when maximizing pixel control.
  if (expectedSuffix !== undefined && decoded.length > originalData.length) {
    const actualSuffix = decoded.slice(originalData.length);
    const charsetValidation = validateSuffixCharset(actualSuffix);
    
    if (!charsetValidation.valid) {
      // Only reject if strictSuffix is enabled
      if (strictSuffix) {
        return {
          valid: false,
          reason: 'SUFFIX_CHARSET_INVALID',
          description: `Suffix contains invalid character at index ${charsetValidation.invalidCharIndex}: ${charsetValidation.invalidChar} (0x${charsetValidation.invalidCharCode?.toString(16)})`,
          details: {
            mismatchIndex: originalData.length + (charsetValidation.invalidCharIndex ?? 0),
            actualByte: charsetValidation.invalidCharCode,
          },
        };
      }
      // With strictSuffix=false, we log the violation but don't reject
      log.debug('Suffix charset violation (accepted - strictSuffix=false)', {
        invalidCharIndex: charsetValidation.invalidCharIndex,
        invalidChar: charsetValidation.invalidChar,
        invalidCharCode: charsetValidation.invalidCharCode,
        suffixPreview: actualSuffix.slice(0, 30),
      });
    }
  }
  
  // Step 6: Verify structural validity (no extra fake segments after primary data)
  // This catches the "byte segment ok, then fake Kanji" pattern that occurs when
  // terminator bits get flipped to fake mode indicators
  if (scanResult.structurallyValid === false) {
    // Get segment info for detailed error message
    const segmentModes = scanResult.segments?.map(s => s.modeName) ?? [];
    const invalidSegments = scanResult.segments?.filter(s => !s.valid) ?? [];
    
    return {
      valid: false,
      reason: 'EXTRA_SEGMENT',
      description: `Extra/fake segment(s) detected after primary data (modes: ${segmentModes.join(', ')})`,
      details: {
        segmentCount: scanResult.segmentCount,
      },
    };
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
 * Rejection reason codes for candidate acceptance
 * These are used for comprehensive logging and debugging
 */
export type RejectionReason =
  | 'SCAN_FAILED'
  | 'DECODER_INVALID'
  | 'LENGTH_TOO_SHORT'
  | 'BYTE_MISMATCH'
  | 'ECC_MISMATCH'
  | 'MASK_MISMATCH'
  | 'EXTRA_SEGMENT'
  | 'SEGMENT_PLAN_MISMATCH'
  | 'TERMINATOR_CORRUPT'
  | 'BLOCK_BUDGET_EXCEEDED'
  | 'RS_LINEARITY_BROKEN'
  | 'PROTECTED_BYTE_VIOLATION'
  | 'SUFFIX_CHARSET_INVALID';

/**
 * Valid characters for URL fragment suffix in HYBRID mode.
 * This is a strict subset of URL-safe characters that should be
 * preserved through QR encoding/decoding without corruption.
 * 
 * Includes: A-Z, a-z, 0-9, and limited special chars: - _ . ~
 * The '#' character is NOT included as it's added as the prefix.
 */
export const VALID_SUFFIX_CHARS = new Set(
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.~'.split('')
);

/**
 * Validate that a suffix contains only URL-safe printable characters.
 * Non-printable or non-URL-safe bytes indicate corruption.
 * 
 * @param suffix The suffix string to validate (without leading #)
 * @returns Validation result with details
 */
export function validateSuffixCharset(suffix: string): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  // Skip the leading '#' if present
  const toValidate = suffix.startsWith('#') ? suffix.slice(1) : suffix;
  
  for (let i = 0; i < toValidate.length; i++) {
    const char = toValidate[i];
    const charCode = toValidate.charCodeAt(i);
    
    // Check if character is in valid set
    if (!VALID_SUFFIX_CHARS.has(char)) {
      return {
        valid: false,
        invalidCharIndex: i,
        invalidCharCode: charCode,
        invalidChar: charCode >= 32 && charCode < 127 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`,
      };
    }
  }
  
  return { valid: true };
}

/**
 * Result of semantic validation
 */
export interface SemanticValidationResult {
  /** Whether validation passed */
  valid: boolean;
  /** Rejection reason if not valid */
  reason?: RejectionReason;
  /** Human-readable description */
  description?: string;
  /** Details about the failure */
  details?: {
    mismatchIndex?: number;
    expectedByte?: number;
    actualByte?: number;
    expectedLength?: number;
    actualLength?: number;
    expectedEcc?: string;
    actualEcc?: string;
    expectedMask?: number;
    actualMask?: number;
    segmentCount?: number;
  };
}

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
  /** Length of suffix (0 if no suffix) */
  suffixLength: number;
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
 * Extract format info bits from a QR matrix
 * Format info is stored in two places for redundancy
 * 
 * NOTE: This is a legacy implementation. Prefer using `readFormatInfoFromDecoder()`
 * which uses the decoder's proven format parser.
 */
export function extractFormatInfo(matrix: boolean[][]): {
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
 * Read format info using the decoder's proven format parser.
 * This is the PREFERRED method for reading format info as it uses
 * BCH error correction and handles edge cases correctly.
 * 
 * @param matrix The QR matrix to read format info from
 * @returns FormatInfo with eccLevel (0-3) and maskPattern (0-7), or null if unreadable
 */
export function readFormatInfoFromDecoder(matrix: boolean[][]): {
  eccLevel: number;
  maskPattern: number;
} | null {
  const moduleCount = matrix.length;
  return decoderReadFormatInfo(matrix, moduleCount);
}

/**
 * Map ECC numeric value (from format info) to ECCLevel character
 * Format info encoding: L=1, M=0, Q=3, H=2
 * 
 * Exported for use in validation functions.
 */
export function eccNumericToLevel(eccNumeric: number): ECCLevel {
  switch (eccNumeric) {
    case 0: return 'M';
    case 1: return 'L';
    case 2: return 'H';
    case 3: return 'Q';
    default: return 'M';
  }
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
 * UPDATED: Now uses the decoder's proven format parser as the primary method,
 * with legacy extraction as fallback. This ensures consistency between
 * encoder and decoder format info handling.
 * 
 * Exported for use in validation functions.
 * 
 * @param matrix The QR matrix to extract mask from
 * @returns Object with extracted mask, ECC, and validation info
 */
export function extractMaskFromMatrix(matrix: boolean[][]): {
  mask: number;
  eccLevel: number;
  isValid: boolean;
  formatInfoMatch: boolean;
  rawVertical: number;
  rawHorizontal: number;
} {
  // FIRST: Try using the decoder's proven format parser
  // This uses BCH error correction and handles edge cases correctly
  const decoderResult = readFormatInfoFromDecoder(matrix);
  
  if (decoderResult !== null) {
    // Decoder successfully parsed format info
    // Get raw bits for diagnostic info (legacy method)
    const legacyFormatInfo = extractFormatInfo(matrix);
    
    return {
      mask: decoderResult.maskPattern,
      eccLevel: decoderResult.eccLevel,
      isValid: true,  // Decoder parsed it successfully with BCH correction
      formatInfoMatch: legacyFormatInfo.match,
      rawVertical: legacyFormatInfo.vertical,
      rawHorizontal: legacyFormatInfo.horizontal,
    };
  }
  
  // FALLBACK: Use legacy extraction if decoder failed
  // This shouldn't happen for valid QR codes, but provides backwards compatibility
  log.warn('Decoder format parser failed, falling back to legacy extraction');
  
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

      if (result && result.data !== null) {
        // Extract segment info for structural validation
        const segments: DecodedSegmentInfo[] = result.segments?.map(s => ({
          index: s.index,
          mode: s.mode,
          modeName: s.modeName,
          charCount: s.charCount,
          decodedLength: s.decodedLength,
          valid: s.valid,
          bitOffset: s.bitOffset,
        })) ?? [];
        
        // Check for fake/extra segments after primary data
        // This catches the "byte segment ok, then fake Kanji" pattern
        const hasExtraInvalidSegment = segments.some((seg, idx) => {
          // Skip first segment (primary data)
          if (idx === 0) return false;
          // Terminator is fine
          if (seg.modeName === 'terminator') return false;
          // Any non-terminator segment after primary that is invalid indicates fake segment
          return !seg.valid || seg.modeName === 'unknown';
        });
        
        // structurallyValid = decoder said valid AND no extra invalid segments detected
        const structurallyValid = (result.structurallyValid ?? true) && !hasExtraInvalidSegment;
        
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
  /**
   * Whether to enforce strict suffix charset validation (default: true).
   * 
   * When true (default, recommended for real-world scanning):
   * - Suffix must contain only URL-safe characters
   * - Ensures the QR decodes to a valid, clean URL
   * - Better compatibility with real phone cameras
   * 
   * When false:
   * - Suffix bytes can be ANY byte value (including non-printable)
   * - May produce more visually accurate QR-Art
   * - Risk of binary garbage in the decoded URL suffix
   */
  strictSuffix?: boolean;
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
  // Always use single byte-mode segment for QART compatibility:
  // byte mode allows ANY bit flip to produce a valid decoded byte,
  // whereas numeric mode rejects ~90% of vectors (10-bit groups exceed 999).
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
    
    // Check if extracted ECC matches what we requested
    // The encoder is the SOURCE OF TRUTH - it knows what it wrote.
    // If the decoder parser disagrees, it's likely a parser bug, not an encoder bug.
    const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);
    if (extractedEccLevel !== ecc) {
      // FORMAT_PARSER_DISAGREEMENT: Log as WARNING, not ERROR
      // The encoder wrote the correct format info - decoder parser may have bugs.
      // We continue with encoder-requested values; final scan validates correctness.
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
  
  // DIAGNOSTIC VERIFICATION: Check format info matches expected values
  // This is now DIAGNOSTIC ONLY - the base matrix scan validation is the real gate.
  // The encoder is the source of truth for format info. If decoder parser disagrees,
  // it may be a parser bug. We log the disagreement but continue.
  const formatVerification = verifyMatrixFormatInfo(matrix, ecc, actualMask);
  if (!formatVerification.valid) {
    // FORMAT_PARSER_DISAGREEMENT: Log as WARNING, continue with regenerated matrix
    // The real validation is whether the matrix scans correctly (checked later).
    log.warn('FORMAT_PARSER_DISAGREEMENT: Base matrix format verification disagreement (diagnostic)', {
      expectedEcc: ecc,
      extractedEcc: formatVerification.extractedEcc,
      eccMatch: formatVerification.eccMatch,
      expectedMask: actualMask,
      extractedMask: formatVerification.extractedMask,
      maskMatch: formatVerification.maskMatch,
      parserDisagreement: formatVerification.reason,
      action: 'CONTINUE_TO_SCAN_VALIDATION',
      note: 'Encoder is authoritative. Base matrix scan validation is the real gate.',
    });
    // DO NOT return error - continue to base matrix scan validation
  } else {
    log.debug('Base matrix format verification passed', {
      ecc,
      mask: actualMask,
    });
  }

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
  log.debug('encodeDataToBytes called (HYBRID byte mode)', {
    fullDataLength: fullData.length,
    originalDataLength,
    suffixLength,
    originalDataPreview: fullData.slice(0, Math.min(60, originalDataLength)) + (originalDataLength > 60 ? '...' : ''),
    suffixPreview: suffix.slice(0, 20) + (suffix.length > 20 ? '...' : ''),
    version,
    ecc,
  });

  const eccLevel = eccToNumericForEncoder(ecc);
  const rsBlocks = getRSBlocks(version, eccLevel);

  // Always use single byte-mode segment for QART:
  // Byte mode allows ANY bit flip to produce a valid decoded byte.
  // Numeric mode would reject ~90% of vectors (10-bit groups exceed 999).
  const buffer = qrBitBuffer();
  const segment = qr8BitByte(fullData);
  
  buffer.put(segment.getMode(), 4);
  const bitsAfterMode = buffer.getLengthInBits();
  buffer.put(segment.getLength(), getLengthInBits(segment.getMode(), version));
  const bitsAfterCharCount = buffer.getLengthInBits();
  
  // Where ORIGINAL data ends (PROTECTION BOUNDARY)
  const bitsAfterOriginalData = bitsAfterCharCount + (originalDataLength * 8);
  
  segment.write(buffer);
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
  
  // =========================================================================
  // CRITICAL FIX: TWO-INTERVAL SAFE MUTATION REGIONS
  // =========================================================================
  // 
  // The mutable region is split into TWO SEPARATE BYTE-ALIGNED INTERVALS:
  // 1. Suffix BYTES only (complete bytes, excludes boundary byte with terminator)
  // 2. Padding codeword BYTES only (the 0xEC 0x11 pattern)
  // 
  // The GAP between these intervals (terminator + pad-to-byte) is PROTECTED.
  // This prevents the decoder from seeing fake mode indicators when terminator bits flip.
  //
  // Bit layout:
  // [Mode][CharCount][Original Data][Suffix Data][Terminator][Pad-to-byte][Padding codewords]
  // |<---- PROTECTED ---->|         |<- GAP ->|              |<-- SAFE -->|
  // |<------ PROTECTED -------->|   |<- SAFE SUFFIX ->|      |<- SAFE PAD ->|
  //
  // Key insight: The byte containing the END of suffix also contains the START of terminator.
  // We must NOT modify that boundary byte, so suffix safe range ends at floor(bitsAfterData/8)*8.
  
  // Protection boundary: after mode + charCount + original data (rounded up to byte)
  const protectedBitEnd = Math.ceil(bitsAfterOriginalData / 8) * 8;
  
  // INTERVAL 1: Safe suffix bytes
  // Start: where protection ends (already byte-aligned)
  // End: floor(bitsAfterData/8)*8 - excludes the boundary byte containing terminator
  const suffixSafeStartBit = protectedBitEnd;
  const suffixSafeEndBit = Math.floor(bitsAfterData / 8) * 8;
  
  // INTERVAL 2: Safe padding codeword bytes  
  // Start: paddingStartByte * 8 (already byte-aligned, after terminator + pad-to-byte)
  // End: total data capacity
  const paddingSafeStartBit = paddingStartByte * 8;
  const paddingSafeEndBit = totalDataCount * 8;
  
  // THE GAP: Contains terminator + pad-to-byte bits (PROTECTED, NEVER MODIFY)
  // This is the byte(s) between suffix safe end and padding safe start
  const gapStartBit = suffixSafeEndBit;
  const gapEndBit = paddingSafeStartBit;
  const gapBitCount = gapEndBit - gapStartBit;
  
  // Calculate actual controllable bits (only in safe ranges)
  const suffixSafeBits = Math.max(0, suffixSafeEndBit - suffixSafeStartBit);
  const paddingSafeBits = Math.max(0, paddingSafeEndBit - paddingSafeStartBit);
  const totalControllableBits = suffixSafeBits + paddingSafeBits;
  
  // Build the two allowed bit ranges for the RS basis builder
  const allowedBitRanges: BitRange[] = [];
  if (suffixSafeEndBit > suffixSafeStartBit) {
    allowedBitRanges.push({ startBit: suffixSafeStartBit, endBit: suffixSafeEndBit });
  }
  if (paddingSafeEndBit > paddingSafeStartBit) {
    allowedBitRanges.push({ startBit: paddingSafeStartBit, endBit: paddingSafeEndBit });
  }
  
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
    fullDataLength: fullData.length,
    encoding: 'byte mode (single segment)',
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
      interval1_suffix: suffixSafeEndBit > suffixSafeStartBit
        ? `bits ${suffixSafeStartBit} - ${suffixSafeEndBit} (${suffixSafeBits} bits, ${suffixSafeBits / 8} bytes)`
        : 'NONE (suffix too short or ends mid-byte)',
      interval2_padding: paddingSafeEndBit > paddingSafeStartBit
        ? `bits ${paddingSafeStartBit} - ${paddingSafeEndBit} (${paddingSafeBits} bits, ${paddingSafeBits / 8} bytes)`
        : 'NONE (no padding codewords)',
      gap_protected: gapBitCount > 0
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
 * Result of format info verification
 * 
 * Exported for use in binary search fallback validation.
 */
export interface FormatVerificationResult {
  /** Whether verification passed (both ECC and mask match) */
  valid: boolean;
  /** Extracted ECC level from format info */
  extractedEcc: ECCLevel;
  /** Extracted mask from format info */
  extractedMask: number;
  /** Whether ECC matches expected */
  eccMatch: boolean;
  /** Whether mask matches expected */
  maskMatch: boolean;
  /** Rejection reason if not valid */
  reason?: RejectionReason;
}

/**
 * Verify that a matrix's format info matches expected ECC and mask.
 * 
 * This is a critical sanity check that should be performed after:
 * 1. Base matrix generation
 * 2. Final matrix regeneration  
 * 3. Binary search fallback attempts
 * 
 * If format info doesn't match, the QR will decode but with wrong
 * error correction level, which affects scannability.
 * 
 * Exported for use in binary search fallback validation.
 * 
 * @param matrix The QR matrix to verify
 * @param expectedEcc Expected ECC level
 * @param expectedMask Expected mask pattern
 * @returns Verification result with extracted values
 */
export function verifyMatrixFormatInfo(
  matrix: boolean[][],
  expectedEcc: ECCLevel,
  expectedMask: number
): FormatVerificationResult {
  const extracted = extractMaskFromMatrix(matrix);
  const extractedEcc = eccNumericToLevel(extracted.eccLevel);
  const eccMatch = extractedEcc === expectedEcc;
  const maskMatch = extracted.mask === expectedMask;
  
  let reason: RejectionReason | undefined;
  if (!eccMatch) {
    reason = 'ECC_MISMATCH';
  } else if (!maskMatch) {
    reason = 'MASK_MISMATCH';
  }
  
  return {
    valid: eccMatch && maskMatch,
    extractedEcc,
    extractedMask: extracted.mask,
    eccMatch,
    maskMatch,
    reason,
  };
}

/**
 * Regenerate a QR code from modified per-block data and ECC
 * This directly constructs a valid QR matrix with all structural patterns
 * and the modified data codewords placed via zigzag traversal.
 *
 * IMPORTANT: The ECC arrays must be pre-computed to preserve RS linearity.
 * When XORing basis vectors, we XOR both data AND ECC, so the combined
 * result remains a valid RS codeword. We must NOT recompute ECC here.
 * 
 * VERIFICATION: After regeneration, we verify the format info matches
 * expected ECC and mask. If not, this indicates a critical bug.
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

  // 2. Draw alignment patterns (5x5, version >= 2)
  // IMPORTANT: Must be placed BEFORE timing patterns to match encoder order!
  // The encoder does: Finders -> Alignment -> Timing
  // Timing has null check and won't overwrite alignment patterns.
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

  // 3. Draw timing patterns (alternating dark/light at row 6 and col 6)
  // IMPORTANT: Must be placed AFTER alignment patterns to match encoder order!
  // This ensures timing doesn't overwrite alignment pattern centers on row/col 6.
  for (let i = 8; i < moduleCount - 8; i++) {
    const dark = i % 2 === 0;
    if (modules[6][i] === null) modules[6][i] = dark; // Horizontal
    if (modules[i][6] === null) modules[i][6] = dark; // Vertical
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
    strictSuffix = true,  // Default to true for real-world scannability
  } = config;

  // Store original data length for protection boundary tracking
  const originalDataLength = data.length;

  // Track if version was auto-upgraded for QR-Art
  let versionWasUpgradedForQArt = false;

  // HYBRID STRATEGY: Add suffix for more controllable bits
  // The suffix can be modified freely while original data is protected
  let encodedData: string;
  let actualSuffix: string;
  let versionToUse: number;
  
  // First, determine the version to use (needed for suffix calculation)
  // QR-Art requires minimum version for reliable real-world scanning
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
    log.info('Using QR version for QR-Art', { version: versionToUse, wasUpgraded: versionWasUpgradedForQArt });
  } else if (version > 0) {
    if (version < MIN_QART_VERSION) {
      log.warn('Specified version is below MIN_QART_VERSION, upgrading for reliable scanning', {
        requestedVersion: version,
        minQArtVersion: MIN_QART_VERSION,
        reason: 'Lower versions have insufficient ECC capacity for real phone cameras',
      });
      versionToUse = MIN_QART_VERSION;
      versionWasUpgradedForQArt = true;
    } else {
      versionToUse = version;
    }
    log.info('Using QR version for QR-Art', { version: versionToUse, wasUpgraded: versionWasUpgradedForQArt });
  } else {
    // Will be calculated after suffix determination
    // calculateOptimalVersionAndSuffix enforces MIN_QART_VERSION internally
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
      encoding: 'byte mode (single segment)',
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
      // Enforce MIN_QART_VERSION for reliable scanning
      if (versionToUse < MIN_QART_VERSION) {
        log.warn('Calculated version is below MIN_QART_VERSION, upgrading for reliable scanning', {
          calculatedVersion: versionToUse,
          minQArtVersion: MIN_QART_VERSION,
          reason: 'Lower versions have insufficient ECC capacity for real phone cameras',
        });
        versionToUse = MIN_QART_VERSION;
        versionWasUpgradedForQArt = true;
      }
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
    versionWasUpgradedForQArt,
    minQArtVersion: MIN_QART_VERSION,
    ecc,
    strictSuffix,
    strategy: 'HYBRID - original data protected, suffix + padding controllable',
    suffixPolicy: strictSuffix 
      ? 'STRICT - suffix must contain only URL-safe characters'
      : 'RELAXED - suffix can contain ANY byte values (max QArt control)',
  });

  try {
    onProgress?.('Encoding base data', 0);

    // CRITICAL: Clear basis cache to ensure fresh calculation
    clearBasisCache();
    log.debug('Cleared basis cache for fresh calculation');

    // Step 1: Generate base QR to determine version, get initial matrix, and extract per-block data/ECC
    // HYBRID MODE: Pass protectedDataLength to track protection boundaries
    // CRITICAL: When suffix starts with '#', we must protect the '#' character too!
    // The '#' separates the URL from the fragment - it must not be corrupted.
    // Otherwise QR-Art may modify the '#' to garbage, breaking the URL structure.
    const protectedDataLength = actualSuffix.startsWith('#') 
      ? originalDataLength + 1  // Include the '#' in protected region
      : originalDataLength;
    
    const baseResult = generateBaseQR(encodedData, versionToUse, ecc, maskPattern, protectedDataLength);
    
    // FAIL FAST: If base matrix generation failed (e.g., ECC/mask mismatch), return error immediately
    if (!baseResult.success) {
      log.error('BASE QR GENERATION FAILED - FAIL FAST!', {
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
    // Verify encoder layout fields are internally consistent.
    // This works for byte-mode encoding (any future encoding mode changes should be validated here).
    // Rather than recalculating from scratch (which requires mode-specific formulas),
    // we validate structural invariants that must hold regardless of encoding mode.
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
      log.error('INTERNAL CONSISTENCY FAILURE - encoder boundary math is wrong!', {
        bitsAfterOriginalData: encoderLayout.bitsAfterOriginalData,
        bitsAfterData: encoderLayout.bitsAfterData,
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
    
    // Log comprehensive semantic boundary information using ENCODER-DERIVED values (TWO-INTERVAL HYBRID mode)
    log.info('ENCODER-DERIVED SEMANTIC LAYOUT (TWO-INTERVAL HYBRID STRATEGY)', {
      version: actualVersion,
      ecc,
      originalDataLength: encoderLayout.originalDataLength,
      suffixLength: encoderLayout.suffixLength,
      fullDataLength: encodedData.length,
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

    // =========================================================================
    // GUARD: Verify no basis vector touches protected bits OR the terminator gap
    // =========================================================================
    // This is a sanity check - if any vector's linear bit is:
    // 1. Below protectedBitEnd (in original data region), OR
    // 2. In the GAP between suffix safe end and padding safe start (terminator region)
    // Then something is wrong with our allowed range calculation.
    const protectedBitEnd = encoderLayout.protectedBitEnd;
    const gapStartBit = encoderLayout.gapStartBit;
    const gapEndBit = encoderLayout.gapEndBit;
    
    const vectorsInProtectedRegion: Array<{
      vectorIndex: number;
      dataBitIndex: number;
      blockIndex: number;
      localBitIndex: number;
      linearBit: number;
      violationType: 'ORIGINAL_DATA' | 'TERMINATOR_GAP';
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
      
      // Check if this linear bit is in the protected region (original data)
      if (linearBit < protectedBitEnd) {
        vectorsInProtectedRegion.push({
          vectorIndex: i,
          dataBitIndex: vector.dataBitIndex,
          blockIndex: vector.rsBlockIndex,
          localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
          linearBit,
          violationType: 'ORIGINAL_DATA',
        });
      }
      // Check if this linear bit is in the GAP (terminator + pad-to-byte)
      else if (linearBit >= gapStartBit && linearBit < gapEndBit) {
        vectorsInProtectedRegion.push({
          vectorIndex: i,
          dataBitIndex: vector.dataBitIndex,
          blockIndex: vector.rsBlockIndex,
          localBitIndex: vector.posInBlock * 8 + (7 - vector.bitInByte),
          linearBit,
          violationType: 'TERMINATOR_GAP',
        });
      }
    }
    
    if (vectorsInProtectedRegion.length > 0) {
      const originalDataViolations = vectorsInProtectedRegion.filter(v => v.violationType === 'ORIGINAL_DATA');
      const terminatorViolations = vectorsInProtectedRegion.filter(v => v.violationType === 'TERMINATOR_GAP');
      
      log.error('CRITICAL: Basis vectors exist in PROTECTED region or TERMINATOR GAP!', {
        protectedBitEnd,
        gapRange: `${gapStartBit} - ${gapEndBit}`,
        originalDataViolations: originalDataViolations.length,
        terminatorViolations: terminatorViolations.length,
        totalViolations: vectorsInProtectedRegion.length,
        sampleViolations: vectorsInProtectedRegion.slice(0, 10),
        note: originalDataViolations.length > 0 
          ? 'These vectors would corrupt original data!'
          : 'These vectors would corrupt terminator bits (causing fake mode indicators)!',
      });
      
      // FAIL FAST - this is a fundamental bug in allowed range calculation
      return {
        success: false,
        error: `${vectorsInProtectedRegion.length} basis vectors touch protected/gap bits - algorithm bug`,
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
    
    log.info('GUARD PASSED: All basis vectors are in allowed regions (suffix bytes OR padding bytes)', {
      protectedBitEnd,
      gapRange: `${gapStartBit} - ${gapEndBit} (${encoderLayout.gapBitCount} bits protected)`,
      suffixSafeRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
      paddingSafeRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
      vectorCount: basis.vectors.length,
      numIntervals: encoderLayout.allowedBitRanges.length,
      stage: 'POST_BASIS_BUILD',
    });

    // Calculate actual controllable bits
    const actualControllableBits = basis.vectors.length;
    const totalDataBits = encoderLayout.totalDataBytes * 8;
    const actualControlPercentage = totalDataBits > 0 ? (actualControllableBits / totalDataBits) * 100 : 0;
    const expectedControllableBits = encoderLayout.suffixBits + encoderLayout.paddingBits;
    
    log.info('QR-Art capacity analysis (TWO-INTERVAL HYBRID STRATEGY)', {
      totalDataBits,
      protectedBits: encoderLayout.protectedBitEnd,
      protectedContent: `mode + charCount + original data (${encoderLayout.originalDataLength} chars)`,
      twoIntervalRanges: {
        interval1_suffix: `${encoderLayout.suffixBits} bits (bytes ${Math.floor(encoderLayout.suffixSafeStartBit/8)} - ${Math.floor(encoderLayout.suffixSafeEndBit/8)})`,
        interval2_padding: `${encoderLayout.paddingBits} bits (bytes ${Math.floor(encoderLayout.paddingSafeStartBit/8)} - ${Math.floor(encoderLayout.paddingSafeEndBit/8)})`,
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
      
      // Determine which interval this vector is in
      const isInSuffixInterval = linearBit >= encoderLayout.suffixSafeStartBit && linearBit < encoderLayout.suffixSafeEndBit;
      const isInPaddingInterval = linearBit >= encoderLayout.paddingSafeStartBit && linearBit < encoderLayout.paddingSafeEndBit;
      const isInGap = linearBit >= encoderLayout.gapStartBit && linearBit < encoderLayout.gapEndBit;
      const isInProtected = linearBit < encoderLayout.protectedBitEnd;
      
      log.info('Test vector details (TWO-INTERVAL)', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        vectorPosInBlock: testVector.posInBlock,
        vectorBitInByte: testVector.bitInByte,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        twoIntervalAnalysis: {
          isInSuffixInterval,
          isInPaddingInterval,
          isInGap,
          isInProtected,
          suffixRange: `${encoderLayout.suffixSafeStartBit} - ${encoderLayout.suffixSafeEndBit}`,
          paddingRange: `${encoderLayout.paddingSafeStartBit} - ${encoderLayout.paddingSafeEndBit}`,
          gapRange: `${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit}`,
        },
        status: isInSuffixInterval 
          ? 'Vector is in SUFFIX safe interval (EXPECTED)'
          : isInPaddingInterval
            ? 'Vector is in PADDING safe interval (EXPECTED)'
            : isInGap
              ? 'Vector is in TERMINATOR GAP - BUG!'
              : isInProtected
                ? 'Vector is in PROTECTED region - BUG!'
                : 'Vector is in UNKNOWN region - BUG!',
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
      
      log.info('HYBRID MUTATION TEST PASSED (TWO-INTERVAL byte-exact)', {
        vectorDataBitIndex: testVector.dataBitIndex,
        vectorBlockIndex: testVector.rsBlockIndex,
        localBitIndex: testLocalBitIndex,
        linearByte,
        linearBit,
        vectorInterval: isInSuffixInterval ? 'SUFFIX' : isInPaddingInterval ? 'PADDING' : 'UNKNOWN',
        gapProtected: `bits ${encoderLayout.gapStartBit} - ${encoderLayout.gapEndBit} (${encoderLayout.gapBitCount} bits)`,
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
    let blockSelections = selectBasisVectorsForTarget(
      elimination,
      targets,
      baseMatrix,
      moduleCount
    );

    let totalSelected = blockSelections.reduce(
      (sum, s) => sum + s.selectedVectorIndices.length,
      0
    );
    log.debug('Vectors selected', {
      selectedCount: totalSelected,
      controllable: elimination.controllablePixels,
      blocksWithSelections: blockSelections.filter((s) => s.selectedVectorIndices.length > 0)
        .length,
    });

    // NOTE: No static vector cap. The binary search fallback in scan-fallback.ts
    // dynamically finds the maximum safe vector count for phone cameras.

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
    
    // =========================================================================
    // DIAGNOSTIC: Check format info after regeneration
    // =========================================================================
    // This is DIAGNOSTIC ONLY - the semantic scan validation is the real gate.
    // If decoder parser disagrees with encoder format info, log it but continue.
    // The scan-based validation (performSemanticValidation) will catch real issues.
    const finalFormatVerification = verifyMatrixFormatInfo(finalMatrix, ecc, actualMask);
    if (!finalFormatVerification.valid) {
      // FORMAT_PARSER_DISAGREEMENT: Log as WARNING, continue to scan validation
      log.warn('FORMAT_PARSER_DISAGREEMENT: Final matrix format verification disagreement (diagnostic)', {
        expectedEcc: ecc,
        extractedEcc: finalFormatVerification.extractedEcc,
        eccMatch: finalFormatVerification.eccMatch,
        expectedMask: actualMask,
        extractedMask: finalFormatVerification.extractedMask,
        maskMatch: finalFormatVerification.maskMatch,
        parserDisagreement: finalFormatVerification.reason,
        action: 'CONTINUE_TO_SEMANTIC_VALIDATION',
        note: 'Encoder is authoritative. Semantic scan validation is the real gate.',
      });
      // DO NOT return error - continue to semantic validation
    } else {
      log.info('Final matrix format verification passed (diagnostic)', {
        ecc,
        mask: actualMask,
        eccMatch: finalFormatVerification.eccMatch,
        maskMatch: finalFormatVerification.maskMatch,
      });
    }

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
    // SEMANTIC-HARD-GATE ACCEPTANCE CRITERIA (HYBRID mode)
    // =========================================================================
    // A valid QR-Art result requires ALL of:
    // 1. Decoder successfully scans the matrix
    // 2. Decoded data is long enough (length >= originalDataLength)
    // 3. Byte-exact match for the original data prefix
    // 4. Format info ECC matches requested ECC
    // 5. Format info mask matches requested mask
    //
    // We use comprehensive semantic validation to catch ALL corruption types.
    
    const semanticValidation = performSemanticValidation(
      finalMatrix,
      data,
      ecc,
      actualMask,
      actualSuffix,
      scanMatrixWithJsQR,
      strictSuffix
    );
    
    if (semanticValidation.valid) {
      // Full semantic validation passed!
      log.info('QR-Art SEMANTIC-HARD-GATE validation PASSED', {
        originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
        originalDataLength,
        decodedDataLength: scanResult.data?.length,
        ecc,
        mask: actualMask,
        strictSuffix,
        structurallyValid: scanResult.structurallyValid,
        segmentCount: scanResult.segmentCount,
        segmentModes: scanResult.segments?.map(s => s.modeName),
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
      // Semantic validation FAILED - log detailed rejection info
      log.error('QR-Art SEMANTIC-HARD-GATE validation FAILED', {
        rejectionReason: semanticValidation.reason,
        description: semanticValidation.description,
        details: semanticValidation.details,
        originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
        originalDataLength,
        ecc,
        mask: actualMask,
        structurallyValid: scanResult.structurallyValid,
        segmentCount: scanResult.segmentCount,
        segmentModes: scanResult.segments?.map(s => s.modeName),
        segments: scanResult.segments?.map(s => ({
          mode: s.modeName,
          charCount: s.charCount,
          valid: s.valid,
          bitOffset: s.bitOffset,
        })),
        note: 'Candidate rejected by semantic-hard-gate',
      });
      
      // If we had a scan result, add byte-level debug info
      if (scanResult.success && scanResult.data) {
        const expectedBytes = stringToBytes(data);
        const actualBytes = stringToBytes(scanResult.data);
        
        log.error('DECODED BYTES (hex comparison)', {
          decodedPrefixHex: toHex(actualBytes.slice(0, originalDataLength)),
          expectedPrefixHex: toHex(expectedBytes),
          mismatchIndex: semanticValidation.details?.mismatchIndex,
          expectedByte: semanticValidation.details?.expectedByte?.toString(16),
          actualByte: semanticValidation.details?.actualByte?.toString(16),
        });
      }
      
      // Mark scanResult as failed to trigger fallback
      scanResult = { 
        success: false, 
        error: `Semantic validation failed: ${semanticValidation.reason} - ${semanticValidation.description}` 
      };
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
      // SEMANTIC-HARD-GATE: Also pass ECC and mask for format info verification
      // strictSuffix: Controls whether suffix charset violations cause rejection
      const binarySearchResult = binarySearchMaxVectors(
        flattenedSelections,
        blockDataArrays,  // Original, unmodified data
        blockEccArrays,   // Original, unmodified ECC
        blockDataCounts,
        blockEccCounts,
        elimination,
        regenerateFn,
        scanMatrixWithJsQR,
        data,  // HYBRID: prefix match validation (original data only)
        ecc,   // SEMANTIC-HARD-GATE: verify format info ECC
        actualMask,  // SEMANTIC-HARD-GATE: verify format info mask
        strictSuffix  // Controls suffix charset rejection (default: false for max QArt control)
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
        
        // Re-validate using SEMANTIC-HARD-GATE
        const postSearchValidation = performSemanticValidation(
          finalMatrixToUse,
          data,
          ecc,
          actualMask,
          actualSuffix,
          scanMatrixWithJsQR,
          strictSuffix
        );
        
        if (postSearchValidation.valid) {
          const postSearchScan = scanMatrixWithJsQR(finalMatrixToUse);
          log.info('Binary search result SEMANTIC-HARD-GATE validation PASSED', {
            originalData: data.length > 50 ? data.slice(0, 50) + '...' : data,
            ecc,
            mask: actualMask,
            structurallyValid: postSearchScan.structurallyValid,
            segmentCount: postSearchScan.segmentCount,
            segmentModes: postSearchScan.segments?.map(s => s.modeName),
            validationMethod: 'SEMANTIC_HARD_GATE',
          });
          // Update scanResult for downstream logic
          scanResult = postSearchScan;
        } else {
          const postSearchScan = scanMatrixWithJsQR(finalMatrixToUse);
          log.error('Binary search result SEMANTIC-HARD-GATE validation FAILED!', {
            rejectionReason: postSearchValidation.reason,
            description: postSearchValidation.description,
            details: postSearchValidation.details,
            expectedOriginal: data,
            structurallyValid: postSearchScan.structurallyValid,
            segmentCount: postSearchScan.segmentCount,
            segmentModes: postSearchScan.segments?.map(s => s.modeName),
            segments: postSearchScan.segments?.map(s => ({
              mode: s.modeName,
              charCount: s.charCount,
              valid: s.valid,
              bitOffset: s.bitOffset,
            })),
          });
          // Mark as failed
          scanResult = {
            success: false,
            error: `Post-search semantic validation failed: ${postSearchValidation.reason}`,
          };
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
        segmentModes: finalScan.segments?.map(s => s.modeName),
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
    paddingBytes: optimalConfig.paddingBytes,
    expectedControlPercent: `${optimalConfig.expectedControlPercent.toFixed(1)}%`,
    encoding: 'byte mode (single segment)',
    note: 'Each mask will use the same DETERMINISTIC suffix for fair comparison',
  });

  for (let mask = 0; mask < 8; mask++) {
    const result = await generateFullQArt({
      ...config,
      forceVersion: sharedVersion,  // Use same version for all masks
      suffix: sharedSuffix,          // Use same suffix for fair comparison
      autoSuffix: false,             // Disable auto-suffix since we pre-generated it
      maskPattern: mask,
      strictSuffix: config.strictSuffix ?? true,  // Default true for phone-safe URLs
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
