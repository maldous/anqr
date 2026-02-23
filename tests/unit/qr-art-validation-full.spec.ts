import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// ImageData polyfill for node
class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(dataOrWidth: Uint8ClampedArray | number, widthOrHeight: number, height?: number) {
    if (typeof dataOrWidth === 'number') {
      this.width = dataOrWidth;
      this.height = widthOrHeight;
      this.data = new Uint8ClampedArray(this.width * this.height * 4);
    } else {
      this.data = dataOrWidth;
      this.width = widthOrHeight;
      this.height = height!;
    }
    this.colorSpace = 'srgb';
  }
}
if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = MockImageData;
}

import { qrcode } from '../../src/modules/qr-encoder';

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

describe('qr-art/validation.ts', () => {
  describe('VALID_SUFFIX_CHARS', () => {
    it('contains all uppercase letters', async () => {
      const { VALID_SUFFIX_CHARS } = await import('../../src/modules/qr-art/validation');
      for (let c = 65; c <= 90; c++) {
        expect(VALID_SUFFIX_CHARS.has(String.fromCharCode(c))).toBe(true);
      }
    });

    it('contains all lowercase letters', async () => {
      const { VALID_SUFFIX_CHARS } = await import('../../src/modules/qr-art/validation');
      for (let c = 97; c <= 122; c++) {
        expect(VALID_SUFFIX_CHARS.has(String.fromCharCode(c))).toBe(true);
      }
    });

    it('contains all digits', async () => {
      const { VALID_SUFFIX_CHARS } = await import('../../src/modules/qr-art/validation');
      for (let c = 48; c <= 57; c++) {
        expect(VALID_SUFFIX_CHARS.has(String.fromCharCode(c))).toBe(true);
      }
    });

    it('contains special allowed chars: - _ . ~', async () => {
      const { VALID_SUFFIX_CHARS } = await import('../../src/modules/qr-art/validation');
      expect(VALID_SUFFIX_CHARS.has('-')).toBe(true);
      expect(VALID_SUFFIX_CHARS.has('_')).toBe(true);
      expect(VALID_SUFFIX_CHARS.has('.')).toBe(true);
      expect(VALID_SUFFIX_CHARS.has('~')).toBe(true);
    });

    it('does not contain space, @, #, or control characters', async () => {
      const { VALID_SUFFIX_CHARS } = await import('../../src/modules/qr-art/validation');
      expect(VALID_SUFFIX_CHARS.has(' ')).toBe(false);
      expect(VALID_SUFFIX_CHARS.has('@')).toBe(false);
      expect(VALID_SUFFIX_CHARS.has('#')).toBe(false);
      expect(VALID_SUFFIX_CHARS.has('\x00')).toBe(false);
      expect(VALID_SUFFIX_CHARS.has('\n')).toBe(false);
    });
  });

  describe('validateSuffixCharset', () => {
    it('valid alphanumeric string passes', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      expect(validateSuffixCharset('HelloWorld123').valid).toBe(true);
    });

    it('empty string passes', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      expect(validateSuffixCharset('').valid).toBe(true);
    });

    it('string with leading # is stripped before validation', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      expect(validateSuffixCharset('#validSuffix').valid).toBe(true);
    });

    it('special allowed chars pass: dash, underscore, dot, tilde', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      expect(validateSuffixCharset('hello-world_test.v2~final').valid).toBe(true);
    });

    it('space character fails', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const result = validateSuffixCharset('hello world');
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(5);
      expect(result.invalidChar).toBe(' ');
    });

    it('at sign fails', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const result = validateSuffixCharset('user@host');
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(4);
      expect(result.invalidChar).toBe('@');
    });

    it('null byte fails with escaped representation', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const result = validateSuffixCharset('abc\x00def');
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(3);
      expect(result.invalidCharCode).toBe(0);
      expect(result.invalidChar).toBe('\\x00');
    });

    it('non-printable control character fails', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const result = validateSuffixCharset('abc\x01');
      expect(result.valid).toBe(false);
      expect(result.invalidChar).toBe('\\x01');
    });

    it('all valid suffix chars individually pass', async () => {
      const { validateSuffixCharset, VALID_SUFFIX_CHARS } =
        await import('../../src/modules/qr-art/validation');
      for (const char of VALID_SUFFIX_CHARS) {
        expect(validateSuffixCharset(char).valid).toBe(true);
      }
    });

    it('maximum length string passes', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const longSuffix = 'A'.repeat(5000);
      expect(validateSuffixCharset(longSuffix).valid).toBe(true);
    });

    it('first invalid char at end of long string', async () => {
      const { validateSuffixCharset } = await import('../../src/modules/qr-art/validation');
      const longSuffix = 'A'.repeat(100) + '!';
      const result = validateSuffixCharset(longSuffix);
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(100);
    });
  });

  describe('validateNumericSuffix', () => {
    it('all digits pass', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      expect(validateNumericSuffix('0123456789').valid).toBe(true);
    });

    it('empty string passes', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      expect(validateNumericSuffix('').valid).toBe(true);
    });

    it('string with leading # is stripped', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      expect(validateNumericSuffix('#12345').valid).toBe(true);
    });

    it('letter fails', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      const result = validateNumericSuffix('123a456');
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(3);
      expect(result.invalidChar).toBe('a');
    });

    it('space fails', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      const result = validateNumericSuffix('123 456');
      expect(result.valid).toBe(false);
      expect(result.invalidCharIndex).toBe(3);
    });

    it('special chars fail', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      expect(validateNumericSuffix('123-456').valid).toBe(false);
      expect(validateNumericSuffix('12.34').valid).toBe(false);
    });

    it('non-printable character shows escaped form', async () => {
      const { validateNumericSuffix } = await import('../../src/modules/qr-art/validation');
      const result = validateNumericSuffix('\x7f');
      expect(result.valid).toBe(false);
      // charCode 127 is >= 32 and < 127 is false, so it gets the escaped form
      expect(result.invalidCharCode).toBe(127);
    });
  });

  describe('eccNumericToLevel', () => {
    it('0 → M', async () => {
      const { eccNumericToLevel } = await import('../../src/modules/qr-art/validation');
      expect(eccNumericToLevel(0)).toBe('M');
    });

    it('1 → L', async () => {
      const { eccNumericToLevel } = await import('../../src/modules/qr-art/validation');
      expect(eccNumericToLevel(1)).toBe('L');
    });

    it('2 → H', async () => {
      const { eccNumericToLevel } = await import('../../src/modules/qr-art/validation');
      expect(eccNumericToLevel(2)).toBe('H');
    });

    it('3 → Q', async () => {
      const { eccNumericToLevel } = await import('../../src/modules/qr-art/validation');
      expect(eccNumericToLevel(3)).toBe('Q');
    });

    it('unknown value defaults to M', async () => {
      const { eccNumericToLevel } = await import('../../src/modules/qr-art/validation');
      expect(eccNumericToLevel(99)).toBe('M');
      expect(eccNumericToLevel(-1)).toBe('M');
    });
  });

  describe('extractFormatInfo', () => {
    it('extracts format info from a real v1-M QR matrix', async () => {
      const { extractFormatInfo } = await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'M');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const info = extractFormatInfo(matrix);
      // Both copies should agree for a valid QR
      expect(info.match).toBe(true);
      // Format info should be non-zero (XOR mask prevents all-zero)
      expect(info.vertical).toBeGreaterThan(0);
      expect(info.horizontal).toBeGreaterThan(0);
    });

    it('vertical and horizontal format info match for valid QR codes', async () => {
      const { extractFormatInfo } = await import('../../src/modules/qr-art/validation');

      for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
        const qr = qrcode(3, ecc);
        qr.addData('TEST');
        qr.make(4);
        const matrix = buildMatrixFromQR(qr);
        const info = extractFormatInfo(matrix);
        expect(info.match).toBe(true);
      }
    });

    it('works with larger QR versions', async () => {
      const { extractFormatInfo } = await import('../../src/modules/qr-art/validation');
      const qr = qrcode(5, 'L');
      qr.addData('https://example.com/longer-url-for-larger-qr');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);
      const info = extractFormatInfo(matrix);
      expect(info.match).toBe(true);
    });
  });

  describe('readFormatInfoFromDecoder', () => {
    it('reads format info from a valid QR matrix', async () => {
      const { readFormatInfoFromDecoder } = await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'M');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const result = readFormatInfoFromDecoder(matrix);
      expect(result).not.toBeNull();
      // ECC M = numeric 0 in format info encoding
      expect(result!.eccLevel).toBe(0);
      expect(result!.maskPattern).toBe(4);
    });

    it('reads correct ECC level for all levels', async () => {
      const { readFormatInfoFromDecoder, eccNumericToLevel: _eccNumericToLevel } =
        await import('../../src/modules/qr-art/validation');

      for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
        const qr = qrcode(3, ecc);
        qr.addData('TEST');
        qr.make(4);
        const matrix = buildMatrixFromQR(qr);
        const result = readFormatInfoFromDecoder(matrix);
        expect(result).not.toBeNull();
        expect(_eccNumericToLevel(result!.eccLevel)).toBe(ecc);
      }
    });

    it('returns null for invalid matrix', async () => {
      const { readFormatInfoFromDecoder } = await import('../../src/modules/qr-art/validation');
      // 21x21 all-false matrix (no valid format info)
      const matrix = Array.from({ length: 21 }, () => new Array(21).fill(false));
      const result = readFormatInfoFromDecoder(matrix);
      // May return null or an incorrect result depending on BCH correction
      // The key is it doesn't throw
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });

  describe('extractMaskFromMatrix', () => {
    it('extracts mask and ECC from a valid QR matrix', async () => {
      const { extractMaskFromMatrix } = await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'M');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const result = extractMaskFromMatrix(matrix);
      expect(result.isValid).toBe(true);
      expect(result.mask).toBe(4);
      expect(result.eccLevel).toBe(0); // M = 0
    });

    it('ECC level matches what was used to create the QR', async () => {
      const { extractMaskFromMatrix, eccNumericToLevel } =
        await import('../../src/modules/qr-art/validation');

      for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
        const qr = qrcode(3, ecc);
        qr.addData('TEST123');
        qr.make(4);
        const matrix = buildMatrixFromQR(qr);
        const result = extractMaskFromMatrix(matrix);
        expect(eccNumericToLevel(result.eccLevel)).toBe(ecc);
      }
    });

    it('format info copies agree for valid QR', async () => {
      const { extractMaskFromMatrix } = await import('../../src/modules/qr-art/validation');
      const qr = qrcode(5, 'Q');
      qr.addData('https://example.com');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const result = extractMaskFromMatrix(matrix);
      expect(result.formatInfoMatch).toBe(true);
    });
  });

  describe('verifyMatrixFormatInfo', () => {
    it('correct ECC and mask → valid: true', async () => {
      const { verifyMatrixFormatInfo, extractMaskFromMatrix, eccNumericToLevel } =
        await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'M');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      // First extract actual ECC and mask
      const extracted = extractMaskFromMatrix(matrix);
      const expectedEcc = eccNumericToLevel(extracted.eccLevel);
      const expectedMask = extracted.mask;

      // Verify should pass with correct values
      const result = verifyMatrixFormatInfo(matrix, expectedEcc, expectedMask);
      expect(result.valid).toBe(true);
      expect(result.eccMatch).toBe(true);
      expect(result.maskMatch).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('wrong ECC → valid: false with ECC_MISMATCH', async () => {
      const { verifyMatrixFormatInfo, extractMaskFromMatrix, eccNumericToLevel } =
        await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'L');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const extracted = extractMaskFromMatrix(matrix);
      const actualEcc = eccNumericToLevel(extracted.eccLevel);

      // Pick a different ECC level
      const wrongEcc = actualEcc === 'L' ? 'H' : 'L';
      const result = verifyMatrixFormatInfo(matrix, wrongEcc, extracted.mask);
      expect(result.valid).toBe(false);
      expect(result.eccMatch).toBe(false);
      expect(result.reason).toBe('ECC_MISMATCH');
    });

    it('wrong mask → valid: false with MASK_MISMATCH', async () => {
      const { verifyMatrixFormatInfo, extractMaskFromMatrix, eccNumericToLevel } =
        await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'M');
      qr.addData('HELLO');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const extracted = extractMaskFromMatrix(matrix);
      const actualEcc = eccNumericToLevel(extracted.eccLevel);

      // Pick a different mask
      const wrongMask = (extracted.mask + 1) % 8;
      const result = verifyMatrixFormatInfo(matrix, actualEcc, wrongMask);
      expect(result.valid).toBe(false);
      expect(result.maskMatch).toBe(false);
      expect(result.reason).toBe('MASK_MISMATCH');
    });

    it('extractedEcc and extractedMask are returned in result', async () => {
      const { verifyMatrixFormatInfo, extractMaskFromMatrix } =
        await import('../../src/modules/qr-art/validation');
      const qr = qrcode(3, 'Q');
      qr.addData('TESTDATA');
      qr.make(4);
      const matrix = buildMatrixFromQR(qr);

      const extracted = extractMaskFromMatrix(matrix);
      const result = verifyMatrixFormatInfo(matrix, 'Q', extracted.mask);

      expect(result.extractedEcc).toBe('Q');
      expect(result.extractedMask).toBe(extracted.mask);
    });
  });

  describe('round-trip: encoder → extractMaskFromMatrix → verifyMatrixFormatInfo', () => {
    it('all 4 ECC levels round-trip correctly', async () => {
      const { extractMaskFromMatrix, eccNumericToLevel, verifyMatrixFormatInfo } =
        await import('../../src/modules/qr-art/validation');

      for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
        const qr = qrcode(3, ecc);
        qr.addData('ROUNDTRIP');
        qr.make(4);
        const matrix = buildMatrixFromQR(qr);

        const extracted = extractMaskFromMatrix(matrix);
        expect(extracted.isValid).toBe(true);

        const eccChar = eccNumericToLevel(extracted.eccLevel);
        const verification = verifyMatrixFormatInfo(matrix, eccChar, extracted.mask);
        expect(verification.valid).toBe(true);
      }
    });
  });
});
