/**
 * QR-Art Validation Utilities
 *
 * Shared types and validation functions used by both generate.ts and scan-fallback.ts.
 * This module exists to break the circular dependency between those two modules.
 */

import { createLogger } from '../../lib/logger';
import { readFormatInfo as decoderReadFormatInfo } from '../qr-decoder/format';
import type { ECCLevel } from './bit-mapping';

// Re-export ECCLevel for consumers
export type { ECCLevel } from './bit-mapping';

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
    const charCode = toValidate.codePointAt(i)!;

    // Check if character is in valid set
    if (!VALID_SUFFIX_CHARS.has(char)) {
      return {
        valid: false,
        invalidCharIndex: i,
        invalidCharCode: charCode,
        invalidChar:
          charCode >= 32 && charCode < 127 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`,
      };
    }
  }

  return { valid: true };
}

/**
 * Validate that a suffix contains only digits (numeric mode).
 */
export function validateNumericSuffix(suffix: string): {
  valid: boolean;
  invalidCharIndex?: number;
  invalidCharCode?: number;
  invalidChar?: string;
} {
  const toValidate = suffix.startsWith('#') ? suffix.slice(1) : suffix;

  for (let i = 0; i < toValidate.length; i++) {
    const char = toValidate[i];
    const charCode = toValidate.codePointAt(i)!;
    if (char < '0' || char > '9') {
      return {
        valid: false,
        invalidCharIndex: i,
        invalidCharCode: charCode,
        invalidChar:
          charCode >= 32 && charCode < 127 ? char : `\\x${charCode.toString(16).padStart(2, '0')}`,
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
      isValid: true, // Decoder parsed it successfully with BCH correction
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
  const verticalMask = verticalData & 0x07; // Lower 3 bits
  const verticalEcc = (verticalData >> 3) & 0x03; // Next 2 bits

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
