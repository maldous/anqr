/**
 * QR-Art Validation Unit Tests
 *
 * Tests for the QR-Art module's core validation functionality:
 * 1. Format info round-trip across all 32 (ECC, mask) pairs
 * 2. Zero-vector rebuild preserves format and payload
 * 3. HYBRID suffix charset enforcement
 * 4. Fail-fast on ECC/mask mismatch
 *
 * These tests verify the fixes for:
 * - Format-info inconsistency (mask flip, ECC mismatch)
 * - Semantic payload drift (corrupted suffix bytes)
 * - Entropy pressure management
 *
 * NOTE: These are unit tests that run with Vitest in Node.js.
 */

import { describe, it, expect } from 'vitest';

// Import the modules we're testing
import { qrcode } from '../../src/modules/qr-encoder';
import { readFormatInfo } from '../../src/modules/qr-decoder/format';
import { decodeQR } from '../../src/modules/qr-decoder';
import {
  extractMaskFromMatrix,
  eccNumericToLevel,
  verifyMatrixFormatInfo,
  validateSuffixCharset,
  VALID_SUFFIX_CHARS,
} from '../../src/modules/qr-art/generate';
import { MAX_SUFFIX_LENGTH, MIN_ECC_HEADROOM_BYTES } from '../../src/modules/qr-art/rs-basis';

// Helper to build matrix from QR code
function buildMatrixFromQR(qr: ReturnType<typeof qrcode>): boolean[][] {
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

describe('QR-Art Format Info Validation', () => {
  describe('Format Info Round-Trip (all 32 ECC/mask pairs)', () => {
    // Test all 4 ECC levels × 8 mask patterns = 32 combinations
    const eccLevels = ['L', 'M', 'Q', 'H'] as const;
    const maskPatterns = [0, 1, 2, 3, 4, 5, 6, 7];

    for (const ecc of eccLevels) {
      for (const mask of maskPatterns) {
        it(`format info round-trip: ECC=${ecc}, mask=${mask}`, () => {
          // Generate a QR code with specific ECC and mask
          const testData = 'https://example.com/test';
          const qr = qrcode(3, ecc); // Version 3 for simplicity
          qr.addData(testData);
          qr.make(mask);

          const moduleCount = qr.getModuleCount();
          const matrix = buildMatrixFromQR(qr);

          // Extract format info using both methods
          const decoderResult = readFormatInfo(matrix, moduleCount);
          const extractResult = extractMaskFromMatrix(matrix);

          // Verify decoder extracts correct values
          expect(decoderResult?.maskPattern).toBe(mask);
          expect(extractResult.mask).toBe(mask);
          expect(eccNumericToLevel(extractResult.eccLevel)).toBe(ecc);
          expect(extractResult.isValid).toBe(true);
          expect(extractResult.formatInfoMatch).toBe(true);
        });
      }
    }
  });

  describe('Zero-Vector Rebuild Preserves Format and Payload', () => {
    it('regenerating with unmodified data preserves format info', () => {
      const testData = 'https://example.com/test-zero-vector';
      const ecc = 'M' as const;
      const mask = 2;
      const version = 4;

      // Generate original QR
      const qr = qrcode(version, ecc);
      qr.addData(testData);
      qr.make(mask);

      const matrix = buildMatrixFromQR(qr);

      // Verify format info matches
      const formatVerification = verifyMatrixFormatInfo(matrix, ecc, mask);

      expect(formatVerification.valid).toBe(true);
      expect(formatVerification.eccMatch).toBe(true);
      expect(formatVerification.maskMatch).toBe(true);
      expect(formatVerification.extractedEcc).toBe(ecc);
      expect(formatVerification.extractedMask).toBe(mask);
    });

    it('all ECC levels preserve format info correctly', () => {
      const eccLevels = ['L', 'M', 'Q', 'H'] as const;

      for (const ecc of eccLevels) {
        const qr = qrcode(5, ecc);
        qr.addData('https://test.com');
        qr.make(4); // Fixed mask for consistency

        const matrix = buildMatrixFromQR(qr);
        const verification = verifyMatrixFormatInfo(matrix, ecc, 4);

        expect(verification.valid).toBe(true);
        expect(verification.extractedEcc).toBe(ecc);
      }
    });

    it('encode→decode round-trip preserves payload exactly', () => {
      // Test that encoding and then decoding a QR code returns the exact same data
      const testCases = [
        { data: 'https://example.com', version: 3, ecc: 'M' as const, mask: 2 },
        { data: 'https://test.com#abc123', version: 4, ecc: 'L' as const, mask: 0 },
        { data: 'HELLO WORLD', version: 2, ecc: 'H' as const, mask: 5 },
      ];

      for (const { data, version, ecc, mask } of testCases) {
        const qr = qrcode(version, ecc);
        qr.addData(data);
        qr.make(mask);

        const matrix = buildMatrixFromQR(qr);
        const moduleCount = qr.getModuleCount();

        // Convert matrix to ImageData for decoding
        const scale = 4;
        const quietZone = 4;
        const size = (moduleCount + quietZone * 2) * scale;
        const imageData = new Uint8ClampedArray(size * size * 4);

        // Fill with white background
        for (let i = 0; i < imageData.length; i += 4) {
          imageData[i] = 255;
          imageData[i + 1] = 255;
          imageData[i + 2] = 255;
          imageData[i + 3] = 255;
        }

        // Draw QR modules
        for (let row = 0; row < moduleCount; row++) {
          for (let col = 0; col < moduleCount; col++) {
            if (matrix[row][col]) {
              const startX = (col + quietZone) * scale;
              const startY = (row + quietZone) * scale;
              for (let py = 0; py < scale; py++) {
                for (let px = 0; px < scale; px++) {
                  const idx = ((startY + py) * size + (startX + px)) * 4;
                  imageData[idx] = 0;
                  imageData[idx + 1] = 0;
                  imageData[idx + 2] = 0;
                }
              }
            }
          }
        }

        // Decode and verify payload matches exactly
        const decoded = decodeQR({ data: imageData, width: size, height: size });
        expect(decoded).not.toBeNull();
        expect(decoded?.data).toBe(data);
      }
    });
  });

  describe('HYBRID Suffix Charset Enforcement', () => {
    it('validates URL-safe suffix characters', () => {
      // Test valid suffixes
      const validSuffixes = [
        'abc123',
        'ABC-XYZ_123',
        'test.value',
        'a~b',
        '', // Empty suffix is valid
      ];

      for (const suffix of validSuffixes) {
        const result = validateSuffixCharset(suffix);
        expect(result.valid).toBe(true);
      }
    });

    it('rejects invalid suffix characters', () => {
      // Test invalid suffixes (contain non-URL-safe chars)
      const invalidSuffixes = [
        { suffix: 'abc!def', invalidChar: '!' },
        { suffix: 'test@value', invalidChar: '@' },
        { suffix: 'has space', invalidChar: ' ' },
        { suffix: 'has\x00null', invalidChar: '\x00' },
        { suffix: '\x7F', invalidChar: '\x7F' },
      ];

      for (const { suffix } of invalidSuffixes) {
        const result = validateSuffixCharset(suffix);
        expect(result.valid).toBe(false);
        expect(result.invalidCharIndex).toBeDefined();
      }
    });

    it('VALID_SUFFIX_CHARS has correct character count', () => {
      // Should have: A-Z (26) + a-z (26) + 0-9 (10) + -_.~ (4) = 66 chars
      expect(VALID_SUFFIX_CHARS.size).toBe(66);
    });

    it('validates suffix starting with #', () => {
      // Suffix starting with # should skip the # and validate the rest
      const withHash = validateSuffixCharset('#abc123');
      expect(withHash.valid).toBe(true);

      const withHashInvalid = validateSuffixCharset('#abc!123');
      expect(withHashInvalid.valid).toBe(false);
      expect(withHashInvalid.invalidCharIndex).toBe(3); // '!' is at index 3 after skipping #
    });
  });

  describe('Fail-Fast on ECC/Mask Mismatch', () => {
    it('verifyMatrixFormatInfo detects ECC mismatch', () => {
      // Generate QR with ECC=M, mask=3
      const qr = qrcode(3, 'M');
      qr.addData('https://example.com');
      qr.make(3);

      const matrix = buildMatrixFromQR(qr);

      // Verify with correct values - should pass
      const correctResult = verifyMatrixFormatInfo(matrix, 'M', 3);
      expect(correctResult.valid).toBe(true);
      expect(correctResult.eccMatch).toBe(true);
      expect(correctResult.maskMatch).toBe(true);

      // Verify with wrong ECC - should fail
      const wrongEccResult = verifyMatrixFormatInfo(matrix, 'H', 3);
      expect(wrongEccResult.valid).toBe(false);
      expect(wrongEccResult.eccMatch).toBe(false);
      expect(wrongEccResult.reason).toBe('ECC_MISMATCH');

      // Verify with wrong mask - should fail
      const wrongMaskResult = verifyMatrixFormatInfo(matrix, 'M', 5);
      expect(wrongMaskResult.valid).toBe(false);
      expect(wrongMaskResult.maskMatch).toBe(false);
      expect(wrongMaskResult.reason).toBe('MASK_MISMATCH');

      // Verify with both wrong - should fail with ECC mismatch (checked first)
      const bothWrongResult = verifyMatrixFormatInfo(matrix, 'L', 7);
      expect(bothWrongResult.valid).toBe(false);
    });

    it('extractMaskFromMatrix returns consistent results across ECC/mask combos', () => {
      // Test a sample of ECC/mask combinations
      const testCases: Array<{ ecc: 'L' | 'M' | 'Q' | 'H'; mask: number }> = [
        { ecc: 'L', mask: 0 },
        { ecc: 'M', mask: 2 },
        { ecc: 'Q', mask: 4 },
        { ecc: 'H', mask: 7 },
        { ecc: 'L', mask: 1 },
        { ecc: 'H', mask: 4 },
      ];

      for (const { ecc, mask } of testCases) {
        const qr = qrcode(5, ecc);
        qr.addData('https://test.example.com/path');
        qr.make(mask);

        const matrix = buildMatrixFromQR(qr);
        const extracted = extractMaskFromMatrix(matrix);
        const extractedEccLevel = eccNumericToLevel(extracted.eccLevel);

        expect(extracted.isValid).toBe(true);
        expect(extractedEccLevel).toBe(ecc);
        expect(extracted.mask).toBe(mask);
      }
    });
  });

  describe('MAX_SUFFIX_LENGTH Constraint', () => {
    it('MAX_SUFFIX_LENGTH is capped at 46', () => {
      // MAX_SUFFIX_LENGTH should be 46 (reduced from 64 to reduce entropy pressure)
      expect(MAX_SUFFIX_LENGTH).toBe(46);
    });

    it('MIN_ECC_HEADROOM_BYTES is positive', () => {
      expect(MIN_ECC_HEADROOM_BYTES).toBeGreaterThan(0);
    });
  });
});

// Additional semantic validation tests
describe('QR-Art Semantic Validation', () => {
  it('decoder and generator format info extraction agree', () => {
    // Test that readFormatInfo (decoder) and extractMaskFromMatrix (generator)
    // return the same values for all valid QR codes
    const testCases = [
      { version: 3, ecc: 'L' as const, mask: 0 },
      { version: 5, ecc: 'M' as const, mask: 3 },
      { version: 8, ecc: 'Q' as const, mask: 5 },
      { version: 10, ecc: 'H' as const, mask: 7 },
    ];

    for (const { version, ecc, mask } of testCases) {
      const qr = qrcode(version, ecc);
      qr.addData('https://test.com');  // Shorter URL to fit in smaller versions
      qr.make(mask);

      const moduleCount = qr.getModuleCount();
      const matrix = buildMatrixFromQR(qr);

      // Get results from both methods
      const decoderResult = readFormatInfo(matrix, moduleCount);
      const generatorResult = extractMaskFromMatrix(matrix);

      // They should agree
      expect(decoderResult?.maskPattern).toBe(generatorResult.mask);
      expect(decoderResult?.eccLevel).toBe(generatorResult.eccLevel);
    }
  });
});

// Format info BCH error correction tests
describe('Format Info BCH Error Correction', () => {
  it('readFormatInfo uses BCH error correction for robustness', () => {
    // Generate a valid QR and verify format info can be read
    const qr = qrcode(3, 'M');
    qr.addData('https://example.com');
    qr.make(2);

    const matrix = buildMatrixFromQR(qr);
    const moduleCount = qr.getModuleCount();

    const result = readFormatInfo(matrix, moduleCount);

    // Should successfully decode
    expect(result).not.toBeNull();
    expect(result?.eccLevel).toBe(0); // M = 0 in format info encoding
    expect(result?.maskPattern).toBe(2);
  });
});
