import { readFormatInfoFromDecoder } from './read-format-info-from-decoder';
import { extractFormatInfo } from './extract-format-info';
import { log } from './log';

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
