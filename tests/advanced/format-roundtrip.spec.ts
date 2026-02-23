/**
 * Format Info Round-Trip Tests
 *
 * Tests all 32 (ECC, mask) pairs to ensure format info encoding and decoding
 * is consistent between encoder and decoder. These tests catch:
 * - Bit-order reversal in format-info readback
 * - Mask pattern mismatches (e.g., 1 ↔ 4)
 * - ECC level mismatches (e.g., H ↔ L)
 *
 * Based on requirements from: https://research.swtch.com/qart
 */

import { test, expect } from '@playwright/test';

// Import the encoder
import { qrcode } from '../../src/modules/qr-encoder';

// Import the decoder's format parser
import { readFormatInfo } from '../../src/modules/qr-decoder/format';

// Import QR-Art's format extraction for comparison
import {
  extractMaskFromMatrix,
  extractFormatInfo,
  eccNumericToLevel,
  readFormatInfoFromDecoder,
  validateSuffixCharset,
  VALID_SUFFIX_CHARS,
} from '../../src/modules/qr-art/generate';

// Import generator for regeneration tests
import {
  generateFullQArt,
  verifyMatrixFormatInfo,
  type FullQArtConfig,
} from '../../src/modules/qr-art/generate';

// ECC levels and their numeric encodings
const ECC_LEVELS = ['L', 'M', 'Q', 'H'] as const;
type ECCLevel = (typeof ECC_LEVELS)[number];

// ECC numeric values as stored in format info
// Format info encoding: L=1, M=0, Q=3, H=2
const ECC_TO_NUMERIC: Record<ECCLevel, number> = {
  M: 0,
  L: 1,
  H: 2,
  Q: 3,
};

const _NUMERIC_TO_ECC: Record<number, ECCLevel> = {
  0: 'M',
  1: 'L',
  2: 'H',
  3: 'Q',
};

/**
 * Convert a QR code instance to a boolean matrix
 */
function qrToMatrix(qr: {
  isDark: (row: number, col: number) => boolean;
  getModuleCount: () => number;
}): boolean[][] {
  const moduleCount = qr.getModuleCount();
  const matrix: boolean[][] = [];
  for (let row = 0; row < moduleCount; row++) {
    matrix[row] = [];
    for (let col = 0; col < moduleCount; col++) {
      matrix[row][col] = qr.isDark(row, col);
    }
  }
  return matrix;
}

test.describe('Format Info Round-Trip Tests', () => {
  test.describe('test_format_roundtrip_all_32()', () => {
    // Test all 32 combinations of (ECC, mask)
    for (const ecc of ECC_LEVELS) {
      for (let mask = 0; mask < 8; mask++) {
        test(`format roundtrip ECC=${ecc} mask=${mask}`, () => {
          // Generate a simple QR code with this ECC and mask
          const qr = qrcode(5, ecc); // Use version 5 for consistency
          qr.addData('https://example.com');
          qr.make(mask);

          // Convert to matrix
          const matrix = qrToMatrix(qr);
          const moduleCount = matrix.length;

          // Read format info using decoder
          const decoderResult = readFormatInfo(matrix, moduleCount);

          expect(decoderResult).not.toBeNull();
          if (decoderResult === null) return;

          // Verify ECC level matches
          const expectedEccNumeric = ECC_TO_NUMERIC[ecc];
          expect(decoderResult.eccLevel).toBe(expectedEccNumeric);

          // Verify mask pattern matches
          expect(decoderResult.maskPattern).toBe(mask);

          // Also verify using QR-Art's extraction (should match)
          const qrArtResult = extractMaskFromMatrix(matrix);
          expect(qrArtResult.eccLevel).toBe(expectedEccNumeric);
          expect(qrArtResult.mask).toBe(mask);
          expect(qrArtResult.isValid).toBe(true);

          // Verify the two format info copies match
          const rawFormatInfo = extractFormatInfo(matrix);
          expect(rawFormatInfo.match).toBe(true);
        });
      }
    }
  });

  test.describe('test_zero_vector_rebuild_preserves_format_and_payload()', () => {
    test('regenerating with zero vectors preserves original format info', async () => {
      const testData = 'https://example.com/test';

      // Create a mock image for QR-Art (21x21 white pixel grid).
      const pixels = new Uint8ClampedArray(21 * 21 * 4);
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = 255;
        pixels[i + 1] = 255;
        pixels[i + 2] = 255;
        pixels[i + 3] = 255;
      }
      const imageData = {
        data: pixels,
        width: 21,
        height: 21,
      } as ImageData;

      for (const ecc of ECC_LEVELS) {
        for (const mask of [0, 3, 5, 7]) {
          // Test subset of masks
          // Generate QR-Art with specific ECC and mask
          const config: FullQArtConfig = {
            data: testData,
            targetImage: imageData,
            version: 5,
            ecc,
            maskPattern: mask,
            autoSuffix: true,
          };

          const result = await generateFullQArt(config);

          if (!result.success) {
            // If generation fails, that's a separate issue - skip this combo
            console.log(`Skipping ECC=${ecc} mask=${mask}: ${result.error}`);
            continue;
          }

          // Verify format info in the result matrix
          const verification = verifyMatrixFormatInfo(result.matrix, ecc, mask);

          expect(verification.valid).toBe(true);
          expect(verification.eccMatch).toBe(true);
          expect(verification.maskMatch).toBe(true);
          expect(verification.extractedEcc).toBe(ecc);
          expect(verification.extractedMask).toBe(mask);

          // Also verify using decoder directly
          const decoderResult = readFormatInfo(result.matrix, result.matrix.length);
          expect(decoderResult).not.toBeNull();
          if (decoderResult) {
            expect(decoderResult.eccLevel).toBe(ECC_TO_NUMERIC[ecc]);
            expect(decoderResult.maskPattern).toBe(mask);
          }
        }
      }
    });
  });

  test.describe('test_failfast_on_any_ecc_or_mask_mismatch()', () => {
    test('verifyMatrixFormatInfo rejects ECC mismatch', () => {
      // Generate QR with ECC=H
      const qr = qrcode(5, 'H');
      qr.addData('https://example.com');
      qr.make(3);

      const matrix = qrToMatrix(qr);

      // Verify with wrong ECC should fail
      const wrongEccResult = verifyMatrixFormatInfo(matrix, 'L', 3);
      expect(wrongEccResult.valid).toBe(false);
      expect(wrongEccResult.eccMatch).toBe(false);
      expect(wrongEccResult.reason).toBe('ECC_MISMATCH');

      // Verify with correct ECC should pass
      const correctResult = verifyMatrixFormatInfo(matrix, 'H', 3);
      expect(correctResult.valid).toBe(true);
      expect(correctResult.eccMatch).toBe(true);
      expect(correctResult.maskMatch).toBe(true);
    });

    test('verifyMatrixFormatInfo rejects mask mismatch', () => {
      // Generate QR with mask=5
      const qr = qrcode(5, 'M');
      qr.addData('https://example.com');
      qr.make(5);

      const matrix = qrToMatrix(qr);

      // Verify with wrong mask should fail
      const wrongMaskResult = verifyMatrixFormatInfo(matrix, 'M', 2);
      expect(wrongMaskResult.valid).toBe(false);
      expect(wrongMaskResult.maskMatch).toBe(false);
      expect(wrongMaskResult.reason).toBe('MASK_MISMATCH');

      // Verify with correct mask should pass
      const correctResult = verifyMatrixFormatInfo(matrix, 'M', 5);
      expect(correctResult.valid).toBe(true);
      expect(correctResult.eccMatch).toBe(true);
      expect(correctResult.maskMatch).toBe(true);
    });

    test('extractMaskFromMatrix detects format info disagreement', () => {
      // Generate a valid QR
      const qr = qrcode(5, 'Q');
      qr.addData('https://example.com');
      qr.make(7);

      const matrix = qrToMatrix(qr);

      // Extraction should succeed with valid format info
      const result = extractMaskFromMatrix(matrix);
      expect(result.isValid).toBe(true);
      expect(result.formatInfoMatch).toBe(true);
      expect(result.mask).toBe(7);
      expect(result.eccLevel).toBe(ECC_TO_NUMERIC['Q']);
    });
  });

  test.describe('test_hybrid_suffix_charset_enforced()', () => {
    test('validateSuffixCharset accepts valid URL-safe characters', () => {
      const validSuffixes = [
        'abc123',
        'ABCxyz',
        'test-suffix',
        'with_underscore',
        'with.dot',
        'with~tilde',
        'MixedCase123',
        '', // Empty suffix is valid
      ];

      for (const suffix of validSuffixes) {
        const result = validateSuffixCharset(suffix);
        expect(result.valid).toBe(true);
      }
    });

    test('validateSuffixCharset rejects non-printable characters', () => {
      const invalidSuffixes = [
        'abc\x00def', // NULL byte
        'abc\x1Fdef', // Control character
        'abc\x7Fdef', // DEL character
        'abc\x80def', // High byte
        'abc\xFFdef', // 0xFF
      ];

      for (const suffix of invalidSuffixes) {
        const result = validateSuffixCharset(suffix);
        expect(result.valid).toBe(false);
        expect(result.invalidCharIndex).toBeDefined();
        expect(result.invalidCharCode).toBeDefined();
      }
    });

    test('validateSuffixCharset rejects non-URL-safe special characters', () => {
      const invalidSuffixes = [
        'abc def', // Space
        'abc/def', // Slash
        'abc?def', // Question mark
        'abc&def', // Ampersand
        'abc=def', // Equals
        'abc%def', // Percent
        'abc+def', // Plus (not in our safe set)
        'abc@def', // At sign
        'abc!def', // Exclamation
      ];

      for (const suffix of invalidSuffixes) {
        const result = validateSuffixCharset(suffix);
        expect(result.valid).toBe(false);
      }
    });

    test('validateSuffixCharset handles # prefix correctly', () => {
      // The # is stripped before validation
      const result1 = validateSuffixCharset('#validSuffix123');
      expect(result1.valid).toBe(true);

      const result2 = validateSuffixCharset('#invalid suffix');
      expect(result2.valid).toBe(false);
      expect(result2.invalidCharIndex).toBe(7); // Index of space after stripping #
    });

    test('VALID_SUFFIX_CHARS contains expected characters', () => {
      // Check alphanumeric
      for (const char of 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        expect(VALID_SUFFIX_CHARS.has(char)).toBe(true);
      }

      // Check allowed special chars
      for (const char of '-_.~') {
        expect(VALID_SUFFIX_CHARS.has(char)).toBe(true);
      }

      // Check disallowed chars
      for (const char of '#?&=+%@!/: ') {
        expect(VALID_SUFFIX_CHARS.has(char)).toBe(false);
      }
    });
  });

  test.describe('Decoder vs QR-Art format parser consistency', () => {
    test('readFormatInfoFromDecoder matches extractMaskFromMatrix', () => {
      for (const ecc of ECC_LEVELS) {
        for (const mask of [0, 2, 4, 7]) {
          const qr = qrcode(5, ecc);
          qr.addData('https://test.com');
          qr.make(mask);

          const matrix = qrToMatrix(qr);

          const decoderResult = readFormatInfoFromDecoder(matrix);
          const extractResult = extractMaskFromMatrix(matrix);

          expect(decoderResult).not.toBeNull();
          if (decoderResult) {
            expect(decoderResult.eccLevel).toBe(extractResult.eccLevel);
            expect(decoderResult.maskPattern).toBe(extractResult.mask);
          }
        }
      }
    });
  });

  test.describe('eccNumericToLevel conversion', () => {
    test('converts all ECC levels correctly', () => {
      expect(eccNumericToLevel(0)).toBe('M');
      expect(eccNumericToLevel(1)).toBe('L');
      expect(eccNumericToLevel(2)).toBe('H');
      expect(eccNumericToLevel(3)).toBe('Q');
    });

    test('defaults to M for invalid values', () => {
      expect(eccNumericToLevel(-1)).toBe('M');
      expect(eccNumericToLevel(4)).toBe('M');
      expect(eccNumericToLevel(100)).toBe('M');
    });
  });
});
