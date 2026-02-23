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

/**
 * Pack a series of (value, numBits) pairs into a byte array.
 * This is used to construct QR data codeword sequences for testing decode functions.
 */
function packBits(...segments: [number, number][]): number[] {
  const allBits: number[] = [];
  for (const [value, numBits] of segments) {
    for (let i = numBits - 1; i >= 0; i--) {
      allBits.push((value >> i) & 1);
    }
  }
  const bytes: number[] = [];
  for (let i = 0; i < allBits.length; i += 8) {
    let byte = 0;
    const remaining = Math.min(8, allBits.length - i);
    for (let j = 0; j < remaining; j++) {
      byte = (byte << 1) | allBits[i + j];
    }
    if (remaining < 8) {
      byte <<= 8 - remaining;
    }
    bytes.push(byte);
  }
  return bytes;
}

// QR mode indicators
const MODE_NUMERIC = 0x1;
const MODE_ALPHANUMERIC = 0x2;
const MODE_BYTE = 0x4;
const MODE_KANJI = 0x8;
const MODE_TERMINATOR = 0x0;

describe('qr-decoder decode.ts', () => {
  describe('RS_BLOCKS', () => {
    it('exports RS block configurations for all ECC levels', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      expect(RS_BLOCKS).toHaveProperty('L');
      expect(RS_BLOCKS).toHaveProperty('M');
      expect(RS_BLOCKS).toHaveProperty('Q');
      expect(RS_BLOCKS).toHaveProperty('H');
      // Each should have 40 versions
      expect(RS_BLOCKS.L).toHaveLength(40);
      expect(RS_BLOCKS.M).toHaveLength(40);
      expect(RS_BLOCKS.Q).toHaveLength(40);
      expect(RS_BLOCKS.H).toHaveLength(40);
    });

    it('RS_BLOCKS v1 L has single block [1, 26, 19]', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      expect(RS_BLOCKS.L[0]).toEqual([[1, 26, 19]]);
    });

    it('RS_BLOCKS v10 M has multi-block configuration', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      // Version 10 M: [[4, 69, 43], [1, 70, 44]]
      expect(RS_BLOCKS.M[9]).toEqual([
        [4, 69, 43],
        [1, 70, 44],
      ]);
    });
  });

  describe('readCodewords', () => {
    it('reads codewords from a v1 (21x21) boolean matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Create a 21x21 matrix with alternating dark/light
      const size = 21;
      const matrix: boolean[][] = [];
      for (let r = 0; r < size; r++) {
        const row: boolean[] = [];
        for (let c = 0; c < size; c++) {
          row.push((r + c) % 2 === 0);
        }
        matrix.push(row);
      }
      const codewords = readCodewords(matrix, size);
      // V1 should produce 26 total codewords (19 data + 7 EC for L)
      expect(codewords.length).toBeGreaterThan(0);
      expect(codewords.length).toBeLessThanOrEqual(26);
      // Each codeword is a byte
      for (const cw of codewords) {
        expect(cw).toBeGreaterThanOrEqual(0);
        expect(cw).toBeLessThanOrEqual(255);
      }
    });

    it('reads codewords from an all-dark matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const size = 21;
      const matrix: boolean[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => true)
      );
      const codewords = readCodewords(matrix, size);
      expect(codewords.length).toBeGreaterThan(0);
      // All data modules are dark → all bits are 1 → codewords should be 0xFF
      for (const cw of codewords) {
        expect(cw).toBe(0xff);
      }
    });

    it('reads codewords from an all-light matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const size = 21;
      const matrix: boolean[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => false)
      );
      const codewords = readCodewords(matrix, size);
      expect(codewords.length).toBeGreaterThan(0);
      // All data modules are light → all bits are 0 → codewords should be 0x00
      for (const cw of codewords) {
        expect(cw).toBe(0x00);
      }
    });

    it('handles larger version (v5, 37x37) matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const size = 37; // v5
      const matrix: boolean[][] = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => true)
      );
      const codewords = readCodewords(matrix, size);
      expect(codewords.length).toBeGreaterThan(26); // More than v1
    });

    it('handles sparse (partially undefined) matrix rows', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const size = 21;
      // matrix[row]?.[col] handles undefined safely
      const matrix: boolean[][] = [];
      for (let r = 0; r < size; r++) {
        matrix.push([]);
      }
      const codewords = readCodewords(matrix, size);
      // Should not crash; undefined cells read as false (0 bit)
      expect(codewords.length).toBeGreaterThan(0);
    });
  });

  describe('separateCodewords', () => {
    it('separates v1 L (single block, eccLevel=1)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // V1 L: 1 block, 26 total, 19 data → 7 EC
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 1); // eccLevel 1 = 'L'
      expect(result.dataCodewords).toHaveLength(19);
      expect(result.ecCodewords).toHaveLength(7);
    });

    it('separates v1 M (single block, eccLevel=0)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // V1 M: 1 block, 26 total, 16 data
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 0); // eccLevel 0 = 'M'
      expect(result.dataCodewords).toHaveLength(16);
      expect(result.ecCodewords).toHaveLength(10);
    });

    it('separates v1 H (single block, eccLevel=2)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // V1 H: 1 block, 26 total, 9 data
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 2); // eccLevel 2 = 'H'
      expect(result.dataCodewords).toHaveLength(9);
      expect(result.ecCodewords).toHaveLength(17);
    });

    it('separates v1 Q (single block, eccLevel=3)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // V1 Q: 1 block, 26 total, 13 data
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 3); // eccLevel 3 = 'Q'
      expect(result.dataCodewords).toHaveLength(13);
      expect(result.ecCodewords).toHaveLength(13);
    });

    it('handles multi-block de-interleaving (v10 M)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // V10 M: [[4, 69, 43], [1, 70, 44]]
      // 4 blocks of 43 data + 1 block of 44 data = 216 data codewords
      // Total = 4*69 + 1*70 = 346
      const totalCodewords = 346;
      const codewords = Array.from({ length: totalCodewords }, (_, i) => i % 256);
      const result = separateCodewords(codewords, 10, 0); // M level
      // 4*43 + 1*44 = 216 data codewords
      expect(result.dataCodewords).toHaveLength(216);
      expect(result.ecCodewords).toHaveLength(346 - 216);
    });

    it('returns all as data when version/ECC has no RS blocks', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Version 0 or 41 doesn't exist in RS_BLOCKS
      const codewords = [1, 2, 3, 4, 5];
      const result = separateCodewords(codewords, 0, 0);
      expect(result.dataCodewords).toEqual(codewords);
      expect(result.ecCodewords).toEqual([]);
    });

    it('returns all as data for invalid ECC level', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      const codewords = [10, 20, 30];
      const result = separateCodewords(codewords, 1, 99); // invalid eccLevel
      expect(result.dataCodewords).toEqual(codewords);
      expect(result.ecCodewords).toEqual([]);
    });
  });

  describe('decodeDataCodewordsDetailed', () => {
    it('decodes numeric mode "123"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Numeric mode, count=3, value=123, terminator
      const data = packBits(
        [MODE_NUMERIC, 4],
        [3, 10], // count = 3
        [123, 10], // 3-digit group
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('123');
      expect(result.encodingMode).toBe('numeric');
      expect(result.valid).toBe(true);
      expect(result.structurallyValid).toBe(true);
    });

    it('decodes numeric with 2-digit remainder "12345"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // 123 (10 bits) + 45 (7 bits) + terminator
      const data = packBits(
        [MODE_NUMERIC, 4],
        [5, 10], // count = 5
        [123, 10], // first 3 digits: "123"
        [45, 7], // remaining 2 digits: "45"
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('12345');
      expect(result.valid).toBe(true);
    });

    it('decodes numeric with 1-digit remainder "1234"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const data = packBits(
        [MODE_NUMERIC, 4],
        [4, 10], // count = 4
        [123, 10], // first 3 digits: "123"
        [4, 4], // remaining 1 digit: "4"
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('1234');
      expect(result.valid).toBe(true);
    });

    it('handles invalid 3-digit numeric value (>999)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // 3-digit group with value 1023 (max 10-bit value) > 999
      const data = packBits(
        [MODE_NUMERIC, 4],
        [3, 10], // count = 3
        [1023, 10], // invalid: > 999
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      // Should produce '???' for invalid 3-digit value
      expect(result.text).toBe('???');
      // But text length 3 === count 3, so technically still "valid" segment-wise
    });

    it('handles invalid 2-digit numeric value (>99)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // count=2, 7-bit value > 99
      const data = packBits(
        [MODE_NUMERIC, 4],
        [2, 10], // count = 2
        [127, 7], // invalid: > 99
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('??');
    });

    it('handles invalid 1-digit numeric value (>9)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // count=1, 4-bit value > 9
      const data = packBits(
        [MODE_NUMERIC, 4],
        [1, 10], // count = 1
        [15, 4], // invalid: > 9
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('?');
    });

    it('decodes alphanumeric mode "AB"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // A=10, B=11, pair=10*45+11=461
      const data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [2, 9], // count = 2 (9 bits for v1)
        [461, 11], // pair AB
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('AB');
      expect(result.encodingMode).toBe('alphanumeric');
      expect(result.valid).toBe(true);
    });

    it('decodes alphanumeric with odd count "ABC"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // AB pair = 461, C=12 single
      const data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [3, 9], // count = 3
        [461, 11], // pair AB
        [12, 6], // single C
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('ABC');
    });

    it('handles invalid alphanumeric pair index', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Max 11-bit value = 2047; floor(2047/45)=45 which is >= ALPHANUMERIC_CHARS.length (45)
      // So c1=45 is out of bounds
      const data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [2, 9],
        [2047, 11], // invalid pair
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toContain('?');
    });

    it('handles invalid alphanumeric single char index', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Max 6-bit value = 63, >= 45
      const data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [1, 9], // count = 1
        [63, 6], // invalid single
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toContain('?');
    });

    it('decodes byte mode "Hi"', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const data = packBits(
        [MODE_BYTE, 4],
        [2, 8], // count = 2 (8 bits for v1)
        [0x48, 8], // 'H'
        [0x69, 8], // 'i'
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('Hi');
      expect(result.encodingMode).toBe('byte');
      expect(result.valid).toBe(true);
      expect(result.bytes).toEqual(new Uint8Array([0x48, 0x69]));
    });

    it('byte mode falls back to latin1 for invalid UTF-8', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Use bytes that produce replacement character in UTF-8
      // 0xFF is invalid start byte in UTF-8
      const data = packBits([MODE_BYTE, 4], [2, 8], [0xff, 8], [0xfe, 8], [MODE_TERMINATOR, 4]);
      const result = decodeDataCodewordsDetailed(data, 1);
      // Should fall back to latin1 if UTF-8 produces replacement chars
      expect(result.text.length).toBe(2);
      expect(result.valid).toBe(true);
    });

    it('decodes kanji mode', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Kanji: 13 bits per character
      // Character 友 (U+53CB): Shift-JIS 0x9746
      // Encode: 0x9746 - 0x8140 = 0x1606
      // byte1 = 0x16, byte2 = 0x06
      // value = 0x16 * 0xC0 + 0x06 = 22 * 192 + 6 = 4230
      const data = packBits(
        [MODE_KANJI, 4],
        [1, 8], // count = 1 (8 bits for v1)
        [4230, 13], // kanji value
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.encodingMode).toBe('kanji');
      // The bytes should be present (2 bytes per kanji)
      expect(result.bytes.length).toBe(2);
    });

    it('handles terminator-only (empty data)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const data = packBits([MODE_TERMINATOR, 4]);
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('');
      expect(result.segmentCount).toBe(1);
      expect(result.valid).toBe(true);
      expect(result.encodingMode).toBe('unknown'); // no data modes seen
    });

    it('handles unknown mode indicator', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Mode 0x3 is not defined as any QR mode
      const data = packBits(
        [0x3, 4], // unknown mode
        [5, 8], // some count (getCharCountBits returns 8 for unknown)
        [0, 40] // some data
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.valid).toBe(false);
      expect(result.segments.some((s) => s.modeName === 'unknown')).toBe(true);
    });

    it('handles not enough bits for char count', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Numeric mode needs 10 count bits for v1, but we only provide 4 more bits
      const data = [0x10]; // 0001 0000 → mode=numeric, only 4 bits left
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.valid).toBe(false);
      expect(result.segments[0].charCount).toBe(-1); // couldn't read count
    });

    it('handles unreasonable charCount (>7000)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // For version 10, byte mode has 16-bit count → can encode up to 65535
      // Set count = 8000 > 7000
      const data = packBits(
        [MODE_BYTE, 4],
        [8000, 16] // count = 8000
      );
      const result = decodeDataCodewordsDetailed(data, 10);
      expect(result.valid).toBe(false);
      // Should abort with "unreasonable char count"
      expect(result.segments[0].valid).toBe(false);
    });

    it('detects truncated numeric segment (incomplete data)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Numeric mode, count=3, but no data bits
      const data = packBits(
        [MODE_NUMERIC, 4],
        [3, 10] // count = 3
        // No data bits → truncated
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      // text is empty because no data could be read
      // segment is invalid because decodedText.length !== charCount
      expect(result.valid).toBe(false);
    });

    it('detects truncated byte segment', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Byte mode, count=5, but only 1 byte of data
      const data = packBits(
        [MODE_BYTE, 4],
        [5, 8], // count = 5
        [0x41, 8] // only 1 byte
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.valid).toBe(false);
    });

    it('detects truncated alphanumeric segment', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Alphanumeric, count=4, but only 1 pair (11 bits)
      const data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [4, 9], // count = 4
        [461, 11] // only 1 pair (2 chars), then runs out of bits
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      // Only decoded 2 chars but expected 4 → invalid
      expect(result.valid).toBe(false);
    });

    it('detects truncated kanji segment', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Kanji, count=3, but only 1 kanji (13 bits)
      const data = packBits(
        [MODE_KANJI, 4],
        [3, 8], // count = 3
        [4230, 13] // only 1 kanji value
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      // Decoded 1 kanji (2 bytes) but expected 3*2=6 → invalid
      expect(result.valid).toBe(false);
    });

    it('decodes mixed mode (byte + numeric) → encodingMode = mixed', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Byte "A" then numeric "1"
      const data = packBits(
        [MODE_BYTE, 4],
        [1, 8], // count = 1
        [0x41, 8], // 'A'
        [MODE_NUMERIC, 4],
        [1, 10], // count = 1
        [1, 4], // value = 1
        [MODE_TERMINATOR, 4]
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('A1');
      expect(result.encodingMode).toBe('mixed');
      expect(result.valid).toBe(true);
      expect(result.segmentCount).toBe(3); // byte + numeric + terminator
    });

    it('structurallyValid is false when extra segments exist after primary', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Valid byte segment, then an invalid unknown mode segment
      const data = packBits(
        [MODE_BYTE, 4],
        [1, 8],
        [0x41, 8], // valid 'A'
        [0x3, 4], // unknown mode
        [10, 8] // some count
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      // First segment is valid (primarySegmentEnded=true)
      // Second segment has unknown mode → invalid → hasExtraSegmentsAfterPrimary=true
      expect(result.structurallyValid).toBe(false);
    });

    it('handles empty byte array', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const result = decodeDataCodewordsDetailed([], 1);
      // Less than 4 bits available → exits while loop immediately
      expect(result.text).toBe('');
      expect(result.encodingMode).toBe('unknown');
      expect(result.valid).toBe(true);
    });

    it('handles data ending without terminator (valid)', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Byte "A" followed by padding (not enough bits for another mode)
      const data = packBits(
        [MODE_BYTE, 4],
        [1, 8],
        [0x41, 8]
        // No terminator, but no more bits for another mode indicator
      );
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.text).toBe('A');
      expect(result.valid).toBe(true);
    });

    it('uses correct char count bits for version ranges', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');

      // Version 1 (<=9): numeric=10, alphanumeric=9, byte=8, kanji=8
      const v1data = packBits([MODE_BYTE, 4], [1, 8], [0x41, 8], [MODE_TERMINATOR, 4]);
      const v1result = decodeDataCodewordsDetailed(v1data, 1);
      expect(v1result.text).toBe('A');

      // Version 10 (10-26): numeric=12, alphanumeric=11, byte=16, kanji=10
      const v10data = packBits([MODE_BYTE, 4], [1, 16], [0x41, 8], [MODE_TERMINATOR, 4]);
      const v10result = decodeDataCodewordsDetailed(v10data, 10);
      expect(v10result.text).toBe('A');

      // Version 27 (27-40): numeric=14, alphanumeric=13, byte=16, kanji=12
      const v27data = packBits([MODE_BYTE, 4], [1, 16], [0x41, 8], [MODE_TERMINATOR, 4]);
      const v27result = decodeDataCodewordsDetailed(v27data, 27);
      expect(v27result.text).toBe('A');
    });

    it('uses correct char count bits for numeric across version ranges', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');

      // Version 10: numeric count = 12 bits
      const v10data = packBits(
        [MODE_NUMERIC, 4],
        [3, 12], // 12-bit count for v10
        [123, 10],
        [MODE_TERMINATOR, 4]
      );
      const v10result = decodeDataCodewordsDetailed(v10data, 10);
      expect(v10result.text).toBe('123');

      // Version 27: numeric count = 14 bits
      const v27data = packBits(
        [MODE_NUMERIC, 4],
        [3, 14], // 14-bit count for v27
        [123, 10],
        [MODE_TERMINATOR, 4]
      );
      const v27result = decodeDataCodewordsDetailed(v27data, 27);
      expect(v27result.text).toBe('123');
    });

    it('uses correct char count bits for kanji across version ranges', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');

      // Version 10: kanji count = 10 bits
      const v10data = packBits(
        [MODE_KANJI, 4],
        [1, 10], // 10-bit count for v10
        [4230, 13],
        [MODE_TERMINATOR, 4]
      );
      const v10result = decodeDataCodewordsDetailed(v10data, 10);
      expect(v10result.encodingMode).toBe('kanji');

      // Version 27: kanji count = 12 bits
      const v27data = packBits(
        [MODE_KANJI, 4],
        [1, 12], // 12-bit count for v27
        [4230, 13],
        [MODE_TERMINATOR, 4]
      );
      const v27result = decodeDataCodewordsDetailed(v27data, 27);
      expect(v27result.encodingMode).toBe('kanji');
    });

    it('uses correct char count bits for alphanumeric across version ranges', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');

      // Version 10: alphanumeric count = 11 bits
      const v10data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [2, 11], // 11-bit count for v10
        [461, 11], // AB
        [MODE_TERMINATOR, 4]
      );
      const v10result = decodeDataCodewordsDetailed(v10data, 10);
      expect(v10result.text).toBe('AB');

      // Version 27: alphanumeric count = 13 bits
      const v27data = packBits(
        [MODE_ALPHANUMERIC, 4],
        [2, 13], // 13-bit count for v27
        [461, 11], // AB
        [MODE_TERMINATOR, 4]
      );
      const v27result = decodeDataCodewordsDetailed(v27data, 27);
      expect(v27result.text).toBe('AB');
    });

    it('segments array includes all decoded segments with proper metadata', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const data = packBits([MODE_BYTE, 4], [2, 8], [0x48, 8], [0x69, 8], [MODE_TERMINATOR, 4]);
      const result = decodeDataCodewordsDetailed(data, 1);
      expect(result.segments).toHaveLength(2); // byte + terminator
      expect(result.segments[0].mode).toBe(MODE_BYTE);
      expect(result.segments[0].modeName).toBe('byte');
      expect(result.segments[0].charCount).toBe(2);
      expect(result.segments[0].decodedLength).toBe(2);
      expect(result.segments[0].valid).toBe(true);
      expect(result.segments[0].index).toBe(0);
      expect(typeof result.segments[0].bitOffset).toBe('number');
      expect(result.segments[1].modeName).toBe('terminator');
    });
  });

  describe('decodeDataCodewords', () => {
    it('returns just the text string', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      const data = packBits(
        [MODE_BYTE, 4],
        [5, 8],
        [0x48, 8], // H
        [0x65, 8], // e
        [0x6c, 8], // l
        [0x6c, 8], // l
        [0x6f, 8], // o
        [MODE_TERMINATOR, 4]
      );
      const text = decodeDataCodewords(data, 1);
      expect(text).toBe('Hello');
    });
  });
});
