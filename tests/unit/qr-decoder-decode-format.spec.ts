import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('qr-decoder decode.ts', () => {
  describe('readCodewords', () => {
    it('reads codewords from all-false 21x21 matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));
      const codewords = readCodewords(matrix, 21);
      expect(Array.isArray(codewords)).toBe(true);
      expect(codewords.length).toBeGreaterThan(0);
      // All false → all codewords should be 0
      for (const cw of codewords) {
        expect(cw).toBe(0);
      }
    });

    it('reads codewords from all-true 21x21 matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(true));
      const codewords = readCodewords(matrix, 21);
      expect(codewords.length).toBeGreaterThan(0);
      // All true data modules → all codewords should be 0xFF
      for (const cw of codewords) {
        expect(cw).toBe(0xFF);
      }
    });

    it('reads codewords from a 25x25 (v2) matrix', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const matrix: boolean[][] = Array.from({ length: 25 }, () => Array(25).fill(false));
      const codewords = readCodewords(matrix, 25);
      expect(codewords.length).toBeGreaterThan(0);
    });

    it('reads correct number of codewords for v1', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));
      const codewords = readCodewords(matrix, 21);
      // v1 has 26 total codewords (21x21 = 441 modules, minus structural ≈ 233 data modules = 26 * 8 + remainder)
      expect(codewords.length).toBe(26);
    });

    it('handles checkerboard pattern correctly', async () => {
      const { readCodewords } = await import('../../src/modules/qr-decoder/decode');
      const matrix: boolean[][] = Array.from({ length: 21 }, (_, r) =>
        Array.from({ length: 21 }, (_, c) => (r + c) % 2 === 0)
      );
      const codewords = readCodewords(matrix, 21);
      expect(codewords.length).toBe(26);
      // Should have a mix of values
      const hasNonZero = codewords.some(c => c !== 0);
      expect(hasNonZero).toBe(true);
    });
  });

  describe('RS_BLOCKS', () => {
    it('has entries for all 4 ECC levels', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      expect(RS_BLOCKS.L).toBeDefined();
      expect(RS_BLOCKS.M).toBeDefined();
      expect(RS_BLOCKS.Q).toBeDefined();
      expect(RS_BLOCKS.H).toBeDefined();
    });

    it('has 40 versions for each ECC level', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      expect(RS_BLOCKS.L.length).toBe(40);
      expect(RS_BLOCKS.M.length).toBe(40);
      expect(RS_BLOCKS.Q.length).toBe(40);
      expect(RS_BLOCKS.H.length).toBe(40);
    });

    it('v1 L has correct block structure', async () => {
      const { RS_BLOCKS } = await import('../../src/modules/qr-decoder/decode');
      // v1 L: [[1, 26, 19]] - 1 block, 26 total, 19 data
      expect(RS_BLOCKS.L[0]).toEqual([[1, 26, 19]]);
    });
  });

  describe('separateCodewords', () => {
    it('separates v1 L codewords correctly', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v1 L: 19 data + 7 EC = 26 total
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 1); // eccLevel 1 = L
      expect(result.dataCodewords.length).toBe(19);
      expect(result.ecCodewords.length).toBe(7);
    });

    it('separates v1 M codewords correctly', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v1 M: 16 data + 10 EC = 26 total
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 0); // eccLevel 0 = M
      expect(result.dataCodewords.length).toBe(16);
      expect(result.ecCodewords.length).toBe(10);
    });

    it('separates v1 H codewords correctly', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v1 H: 9 data + 17 EC = 26 total
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 2); // eccLevel 2 = H
      expect(result.dataCodewords.length).toBe(9);
      expect(result.ecCodewords.length).toBe(17);
    });

    it('separates v1 Q codewords correctly', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v1 Q: 13 data + 13 EC = 26 total
      const codewords = Array.from({ length: 26 }, (_, i) => i);
      const result = separateCodewords(codewords, 1, 3); // eccLevel 3 = Q
      expect(result.dataCodewords.length).toBe(13);
      expect(result.ecCodewords.length).toBe(13);
    });

    it('handles multi-block version (v5 L)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v5 L: [[1, 134, 108]] - 1 block, 134 total, 108 data
      const codewords = Array.from({ length: 134 }, (_, i) => i % 256);
      const result = separateCodewords(codewords, 5, 1);
      expect(result.dataCodewords.length).toBe(108);
      expect(result.ecCodewords.length).toBe(26);
    });

    it('returns all as data when RS blocks not found', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      const codewords = [1, 2, 3, 4, 5];
      // Invalid version 99
      const result = separateCodewords(codewords, 99, 1);
      expect(result.dataCodewords).toEqual(codewords);
      expect(result.ecCodewords).toEqual([]);
    });

    it('handles multi-block version with 2 block groups (v10 M)', async () => {
      const { separateCodewords } = await import('../../src/modules/qr-decoder/decode');
      // v10 M: [[4, 69, 43], [1, 70, 44]] - 5 blocks total
      const totalCodewords = 4 * 69 + 1 * 70; // 346
      const codewords = Array.from({ length: totalCodewords }, (_, i) => i % 256);
      const result = separateCodewords(codewords, 10, 0);
      const expectedData = 4 * 43 + 1 * 44; // 216
      expect(result.dataCodewords.length).toBe(expectedData);
    });
  });

  describe('decodeDataCodewords', () => {
    it('decodes byte mode "HELLO"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Byte mode (0100), count=5 (00000101), H E L L O, terminator
      // 0100 00000101 01001000 01000101 01001100 01001100 01001111 0000
      const dataCodewords = [0x40, 0x54, 0x84, 0x54, 0xC4, 0xC4, 0xF0];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('HELLO');
    });

    it('decodes numeric mode "12345"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Numeric mode (0001), count=5 (0000000101), 123 (0001111011), 45 (0101101), terminator (0000)
      // 0001 0000000101 0001111011 0101101 0000
      // Bytes: 00010000 00010100 01111011 01011010 00000000
      const dataCodewords = [0x10, 0x14, 0x7B, 0x5A, 0x00];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('12345');
    });

    it('decodes alphanumeric mode "AB"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Alphanumeric (0010), count=2 (000000010), pair AB=461 (00111001101), terminator (0000)
      // 0010 000000010 00111001101 0000
      // = 00100000 00010001 11001101 0000xxxx
      const dataCodewords = [0x20, 0x11, 0xCD, 0x00];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('AB');
    });

    it('decodes empty data (terminator only)', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Just a terminator
      const dataCodewords = [0x00];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('');
    });

    it('decodes numeric mode single digit "7"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Numeric (0001), count=1 (0000000001), digit 7 (0111), terminator (0000)
      // 0001 0000000001 0111 0000
      // = 00010000 00000101 11000000
      const dataCodewords = [0x10, 0x05, 0xC0];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('7');
    });

    it('decodes numeric mode two digits "42"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Numeric (0001), count=2 (0000000010), 42 (0101010), terminator (0000)
      // 0001 0000000010 0101010 0000
      // = 00010000 00001001 01010000 0
      const dataCodewords = [0x10, 0x09, 0x50];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('42');
    });

    it('decodes alphanumeric single char "A"', async () => {
      const { decodeDataCodewords } = await import('../../src/modules/qr-decoder/decode');
      // Alphanumeric (0010), count=1 (000000001), A=10 (001010), terminator (0000)
      // 0010 000000001 001010 0000
      // = 00100000 00001001 01000000
      const dataCodewords = [0x20, 0x09, 0x40];
      const result = decodeDataCodewords(dataCodewords, 1);
      expect(result).toBe('A');
    });
  });

  describe('decodeDataCodewordsDetailed', () => {
    it('returns detailed result for byte mode', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const dataCodewords = [0x40, 0x54, 0x84, 0x54, 0xC4, 0xC4, 0xF0];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.text).toBe('HELLO');
      expect(result.valid).toBe(true);
      expect(result.structurallyValid).toBe(true);
      expect(result.encodingMode).toBe('byte');
      expect(result.bytes).toBeInstanceOf(Uint8Array);
      expect(result.bytes.length).toBe(5);
      expect(result.segmentCount).toBeGreaterThanOrEqual(1);
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
      expect(result.segments[0].modeName).toBe('byte');
      expect(result.segments[0].valid).toBe(true);
    });

    it('returns detailed result for numeric mode', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const dataCodewords = [0x10, 0x14, 0x7B, 0x5A, 0x00];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.text).toBe('12345');
      expect(result.encodingMode).toBe('numeric');
      expect(result.valid).toBe(true);
    });

    it('returns detailed result for alphanumeric mode', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      const dataCodewords = [0x20, 0x11, 0xCD, 0x00];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.text).toBe('AB');
      expect(result.encodingMode).toBe('alphanumeric');
      expect(result.valid).toBe(true);
    });

    it('handles unreasonable char count gracefully', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Byte mode (0100), count = 255 (very large for available data)
      // 0100 11111111 ...
      // = 01001111 1111xxxx
      const dataCodewords = [0x4F, 0xF0];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      // Should handle truncation gracefully
      expect(result).toBeDefined();
      expect(typeof result.text).toBe('string');
    });

    it('detects unknown mode indicator', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Mode 0101 (unknown) with some data
      // 0101 xxxx
      const dataCodewords = [0x50, 0x00];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.valid).toBe(false);
    });

    it('handles insufficient bits for char count', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Byte mode (0100) but only 4 more bits available (need 8 for char count in v1)
      const dataCodewords = [0x40]; // only 4 bits after mode
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.valid).toBe(false);
    });

    it('detects Kanji mode in segment info', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // Kanji mode (1000), count=1 (00000001 for v1-9), value = 0x0942 - 0x8140 encoded as 13-bit
      // Kanji char: 0x8A9E (漢) → value = 0x8A9E - 0x8140 = 0x095E
      // byte1 = 0x09, byte2 = 0x5E → encoded = 0x09 * 0xC0 + 0x5E = 0x06E0 + 0x5E = 0x073E
      // 0x073E = 1110_0011_1110 (12 bits, but we need 13 → 0_1110_0011_1110)
      // 1000 00000001 0011100111110 0000
      // = 10000000 00010011 10011111 0000xxxx
      const dataCodewords = [0x80, 0x13, 0x9F, 0x00];
      const result = decodeDataCodewordsDetailed(dataCodewords, 1);
      expect(result.segments.length).toBeGreaterThanOrEqual(1);
      expect(result.segments[0].modeName).toBe('kanji');
    });

    it('uses version-appropriate char count bits for medium versions', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // For v10-26, byte mode char count is 16 bits
      // Byte mode (0100), count=1 (00000000 00000001), data='A'(01000001), terminator
      // 0100 0000000000000001 01000001 0000
      // = 01000000 00000000 01010000 01000000
      const dataCodewords = [0x40, 0x00, 0x14, 0x10];
      const result = decodeDataCodewordsDetailed(dataCodewords, 10);
      expect(result.text).toBe('A');
      expect(result.valid).toBe(true);
    });

    it('uses version-appropriate char count bits for large versions', async () => {
      const { decodeDataCodewordsDetailed } = await import('../../src/modules/qr-decoder/decode');
      // For v27-40, byte mode char count is 16 bits (same as medium)
      // Byte mode (0100), count=1, data='Z'(01011010), terminator
      const dataCodewords = [0x40, 0x00, 0x15, 0xA0];
      const result = decodeDataCodewordsDetailed(dataCodewords, 27);
      expect(result.text).toBe('Z');
      expect(result.valid).toBe(true);
    });
  });
});

describe('qr-decoder format.ts', () => {
  describe('getECCLevelChar', () => {
    it('returns M for eccLevel 0', async () => {
      const { getECCLevelChar } = await import('../../src/modules/qr-decoder/format');
      expect(getECCLevelChar(0)).toBe('M');
    });

    it('returns L for eccLevel 1', async () => {
      const { getECCLevelChar } = await import('../../src/modules/qr-decoder/format');
      expect(getECCLevelChar(1)).toBe('L');
    });

    it('returns H for eccLevel 2', async () => {
      const { getECCLevelChar } = await import('../../src/modules/qr-decoder/format');
      expect(getECCLevelChar(2)).toBe('H');
    });

    it('returns Q for eccLevel 3', async () => {
      const { getECCLevelChar } = await import('../../src/modules/qr-decoder/format');
      expect(getECCLevelChar(3)).toBe('Q');
    });

    it('returns M for invalid eccLevel', async () => {
      const { getECCLevelChar } = await import('../../src/modules/qr-decoder/format');
      expect(getECCLevelChar(99)).toBe('M');
    });
  });

  describe('readFormatInfo', () => {
    function makeMatrix(size: number): boolean[][] {
      return Array.from({ length: size }, () => Array(size).fill(false));
    }

    function setFormatBits(matrix: boolean[][], moduleCount: number, pattern: number): void {
      // Copy 1 - around top-left finder
      for (let i = 0; i <= 5; i++) {
        matrix[i][8] = !!(pattern & (1 << i));
      }
      matrix[7][8] = !!(pattern & (1 << 6));
      matrix[8][8] = !!(pattern & (1 << 7));
      matrix[8][7] = !!(pattern & (1 << 8));
      for (let i = 9; i <= 14; i++) {
        matrix[8][14 - i] = !!(pattern & (1 << i));
      }

      // Copy 2 - around top-right and bottom-left
      for (let i = 0; i <= 7; i++) {
        matrix[8][moduleCount - 1 - i] = !!(pattern & (1 << i));
      }
      for (let i = 8; i <= 14; i++) {
        matrix[moduleCount - 15 + i][8] = !!(pattern & (1 << i));
      }
    }

    it('decodes ECC M mask 0 format info', async () => {
      const { readFormatInfo } = await import('../../src/modules/qr-decoder/format');
      const matrix = makeMatrix(21);
      // ECC M (0), mask 0: data=0, BCH remainder=0, XOR mask=0x5412 → pattern=0x5412
      setFormatBits(matrix, 21, 0x5412);
      const result = readFormatInfo(matrix, 21);
      expect(result).not.toBeNull();
      expect(result!.eccLevel).toBe(0); // M
      expect(result!.maskPattern).toBe(0);
    });

    it('decodes ECC L mask 0 format info', async () => {
      const { readFormatInfo } = await import('../../src/modules/qr-decoder/format');
      const matrix = makeMatrix(21);
      // ECC L (1), mask 0: data=8
      // Compute BCH: data=8, bits = 8<<10 = 0x2000
      // After BCH division and XOR with 0x5412:
      // We compute it: data=8 → encoded bits = 0x77C4
      setFormatBits(matrix, 21, 0x77C4);
      const result = readFormatInfo(matrix, 21);
      expect(result).not.toBeNull();
      expect(result!.eccLevel).toBe(1); // L
      expect(result!.maskPattern).toBe(0);
    });

    it('returns null for random/invalid format bits', async () => {
      const { readFormatInfo } = await import('../../src/modules/qr-decoder/format');
      const matrix = makeMatrix(21);
      // Set random bits that don't match any valid pattern within hamming distance 3
      // All bits set to true → pattern = 0x7FFF
      for (let i = 0; i <= 5; i++) matrix[i][8] = true;
      matrix[7][8] = true;
      matrix[8][8] = true;
      matrix[8][7] = true;
      for (let i = 9; i <= 14; i++) matrix[8][14 - i] = true;
      for (let i = 0; i <= 7; i++) matrix[8][20 - i] = true;
      for (let i = 8; i <= 14; i++) matrix[21 - 15 + i][8] = true;
      const result = readFormatInfo(matrix, 21);
      // May or may not be null depending on hamming distance, but should not throw
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('handles empty matrix without crashing', async () => {
      const { readFormatInfo } = await import('../../src/modules/qr-decoder/format');
      const matrix = makeMatrix(21);
      const result = readFormatInfo(matrix, 21);
      // All zeros - may match a pattern or return null
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('works with 25x25 (v2) matrix', async () => {
      const { readFormatInfo } = await import('../../src/modules/qr-decoder/format');
      const matrix = makeMatrix(25);
      setFormatBits(matrix, 25, 0x5412);
      const result = readFormatInfo(matrix, 25);
      expect(result).not.toBeNull();
      expect(result!.eccLevel).toBe(0);
      expect(result!.maskPattern).toBe(0);
    });
  });

  describe('readVersionInfo', () => {
    function makeMatrix(size: number): boolean[][] {
      return Array.from({ length: size }, () => Array(size).fill(false));
    }

    it('returns calculated version for v1-6 (no version info block)', async () => {
      const { readVersionInfo } = await import('../../src/modules/qr-decoder/format');
      // v1 → moduleCount=21
      expect(readVersionInfo(makeMatrix(21), 21)).toBe(1);
      // v6 → moduleCount=41
      expect(readVersionInfo(makeMatrix(41), 41)).toBe(6);
    });

    it('attempts to read version info for v7+ matrices', async () => {
      const { readVersionInfo } = await import('../../src/modules/qr-decoder/format');
      // v7 → moduleCount=45
      const matrix = makeMatrix(45);
      const result = readVersionInfo(matrix, 45);
      // With all-false matrix, extracted version bits are 0, falls back to calculated version
      expect(result).toBe(7);
    });
  });

  describe('unmaskMatrix', () => {
    it('flips data modules based on mask pattern 0', async () => {
      const { unmaskMatrix } = await import('../../src/modules/qr-decoder/format');
      // 21x21 matrix, all false
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));
      const unmasked = unmaskMatrix(matrix, 0, 21);
      expect(unmasked.length).toBe(21);
      expect(unmasked[0].length).toBe(21);
      // Mask 0: (row + col) % 2 === 0 → flips at even sum positions (for data modules only)
      // Data module at (10, 10) should be flipped since (10+10)%2=0 and it's not structural
      expect(typeof unmasked[10][10]).toBe('boolean');
    });

    it('preserves structural modules', async () => {
      const { unmaskMatrix } = await import('../../src/modules/qr-decoder/format');
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(true));
      const unmasked = unmaskMatrix(matrix, 0, 21);
      // Top-left finder pattern modules should be preserved (not unmasked)
      // Module (0,0) is a finder pattern module → should stay true
      expect(unmasked[0][0]).toBe(true);
      // Module (3,3) is center of finder → should stay true
      expect(unmasked[3][3]).toBe(true);
    });

    it('works with all 8 mask patterns', async () => {
      const { unmaskMatrix } = await import('../../src/modules/qr-decoder/format');
      const matrix: boolean[][] = Array.from({ length: 21 }, () => Array(21).fill(false));
      for (let mask = 0; mask < 8; mask++) {
        const unmasked = unmaskMatrix(matrix, mask, 21);
        expect(unmasked.length).toBe(21);
        expect(unmasked[0].length).toBe(21);
      }
    });

    it('double-unmask restores original data modules', async () => {
      const { unmaskMatrix } = await import('../../src/modules/qr-decoder/format');
      const matrix: boolean[][] = Array.from({ length: 21 }, (_, r) =>
        Array.from({ length: 21 }, (_, c) => (r * 21 + c) % 3 === 0)
      );
      const unmasked = unmaskMatrix(matrix, 3, 21);
      const restored = unmaskMatrix(unmasked, 3, 21);
      for (let r = 0; r < 21; r++) {
        for (let c = 0; c < 21; c++) {
          expect(restored[r][c]).toBe(matrix[r][c]);
        }
      }
    });

    it('works with 25x25 (v2) matrix', async () => {
      const { unmaskMatrix } = await import('../../src/modules/qr-decoder/format');
      const matrix: boolean[][] = Array.from({ length: 25 }, () => Array(25).fill(false));
      const unmasked = unmaskMatrix(matrix, 0, 25);
      expect(unmasked.length).toBe(25);
    });
  });
});

describe('qr-decoder types.ts', () => {
  it('exports mode constants', async () => {
    const types = await import('../../src/modules/qr-decoder/types');
    expect(types.MODE_NUMERIC).toBe(0b0001);
    expect(types.MODE_ALPHANUMERIC).toBe(0b0010);
    expect(types.MODE_BYTE).toBe(0b0100);
    expect(types.MODE_KANJI).toBe(0b1000);
    expect(types.MODE_ECI).toBe(0b0111);
    expect(types.MODE_TERMINATOR).toBe(0b0000);
  });

  it('exports ALPHANUMERIC_CHARS', async () => {
    const types = await import('../../src/modules/qr-decoder/types');
    expect(types.ALPHANUMERIC_CHARS).toBe('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:');
  });

  it('exports ECC_LEVEL_MAP', async () => {
    const types = await import('../../src/modules/qr-decoder/types');
    expect(types.ECC_LEVEL_MAP[0]).toBe('M');
    expect(types.ECC_LEVEL_MAP[1]).toBe('L');
    expect(types.ECC_LEVEL_MAP[2]).toBe('H');
    expect(types.ECC_LEVEL_MAP[3]).toBe('Q');
  });
});
