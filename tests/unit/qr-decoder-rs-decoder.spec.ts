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

describe('RS Decoder', () => {
  async function getRSDecoder() {
    return await import('../../src/modules/qr-decoder/rs-decoder');
  }

  describe('correctRSBlock', () => {
    it('returns data as-is when no errors (all zeros)', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 6;
      const codeword = new Array(dataCount + eccCount).fill(0);
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(dataCount);
      expect(result!.every((b) => b === 0)).toBe(true);
    });

    it('corrects a single error in data region', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10; // Can correct up to 5 errors
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Introduce 1 error: set position 3 to 42
      codeword[3] = 42;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(dataCount);
      // The corrected data should be all zeros
      expect(result![3]).toBe(0);
    });

    it('corrects a single error in ECC region', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10;
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Introduce error in ECC region
      codeword[dataCount + 2] = 100;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(dataCount);
      expect(result!.every((b) => b === 0)).toBe(true);
    });

    it('corrects multiple errors within capacity', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10; // Can correct up to 5 errors
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Introduce 2 errors (well within capacity of 5)
      codeword[0] = 1;
      codeword[5] = 255;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result!.length).toBe(dataCount);
      expect(result![0]).toBe(0);
      expect(result![5]).toBe(0);
    });

    it('returns null when too many errors', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 4; // Can correct at most 2 errors
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Introduce 5 errors (more than capacity of 2)
      codeword[0] = 1;
      codeword[1] = 2;
      codeword[2] = 3;
      codeword[3] = 4;
      codeword[4] = 5;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).toBeNull();
    });

    it('returns null for length mismatch', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const codeword = [0, 0, 0, 0, 0];
      const result = correctRSBlock(codeword, 10, 6); // expects 16 but got 5
      expect(result).toBeNull();
    });

    it('handles error magnitude correctly (non-trivial values)', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10;
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Single error with specific magnitude
      codeword[7] = 200;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result![7]).toBe(0);
    });

    it('handles small ECC count', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 2; // Can correct at most 1 error
      const codeword = new Array(dataCount + eccCount).fill(0);
      // Introduce exactly 1 error
      codeword[5] = 128;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result![5]).toBe(0);
    });

    it('handles error at first position', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10;
      const codeword = new Array(dataCount + eccCount).fill(0);
      codeword[0] = 77;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result![0]).toBe(0);
    });

    it('handles error at last data position', async () => {
      const { correctRSBlock } = await getRSDecoder();
      const dataCount = 10;
      const eccCount = 10;
      const codeword = new Array(dataCount + eccCount).fill(0);
      codeword[dataCount - 1] = 33;
      const result = correctRSBlock(codeword, dataCount, eccCount);
      expect(result).not.toBeNull();
      expect(result![dataCount - 1]).toBe(0);
    });
  });

  describe('correctRSCodewords', () => {
    it('decodes single block with no errors', async () => {
      const { correctRSCodewords } = await getRSDecoder();
      const dataCount = 5;
      const eccCount = 4;
      const totalCount = dataCount + eccCount;
      const codewords = new Array(totalCount).fill(0);
      const rsBlocks = [[1, totalCount, dataCount]];

      const result = correctRSCodewords(codewords, rsBlocks);
      expect(result).not.toBeNull();
      expect(result!.dataCodewords.length).toBe(dataCount);
      expect(result!.correctionsMade).toBe(0);
    });

    it('decodes single block with correctable error', async () => {
      const { correctRSCodewords } = await getRSDecoder();
      const dataCount = 5;
      const eccCount = 6;
      const totalCount = dataCount + eccCount;
      const codewords = new Array(totalCount).fill(0);
      codewords[2] = 50; // Error in data
      const rsBlocks = [[1, totalCount, dataCount]];

      const result = correctRSCodewords(codewords, rsBlocks);
      expect(result).not.toBeNull();
      expect(result!.dataCodewords[2]).toBe(0);
      expect(result!.correctionsMade).toBe(1);
    });

    it('returns null for uncorrectable block', async () => {
      const { correctRSCodewords } = await getRSDecoder();
      const dataCount = 5;
      const eccCount = 2; // Can correct at most 1 error
      const totalCount = dataCount + eccCount;
      const codewords = new Array(totalCount).fill(0);
      // Introduce 3 errors
      codewords[0] = 1;
      codewords[1] = 2;
      codewords[2] = 3;
      const rsBlocks = [[1, totalCount, dataCount]];

      const result = correctRSCodewords(codewords, rsBlocks);
      expect(result).toBeNull();
    });

    it('handles multiple block groups', async () => {
      const { correctRSCodewords } = await getRSDecoder();
      // 2 blocks, each with 5 data + 4 ecc = 9 total
      const dataCount = 5;
      const eccCount = 4;
      const totalCount = dataCount + eccCount;

      // Interleaved format: data bytes interleaved, then ecc bytes interleaved
      // Block 0 data: [0,0,0,0,0], Block 1 data: [0,0,0,0,0]
      // Interleaved data: [b0d0, b1d0, b0d1, b1d1, b0d2, b1d2, b0d3, b1d3, b0d4, b1d4]
      // Interleaved ecc: [b0e0, b1e0, b0e1, b1e1, b0e2, b1e2, b0e3, b1e3]
      const codewords = new Array(2 * totalCount).fill(0);
      const rsBlocks = [[2, totalCount, dataCount]];

      const result = correctRSCodewords(codewords, rsBlocks);
      expect(result).not.toBeNull();
      expect(result!.dataCodewords.length).toBe(dataCount * 2);
      expect(result!.correctionsMade).toBe(0);
    });

    it('handles mixed block sizes', async () => {
      const { correctRSCodewords } = await getRSDecoder();
      // Group 1: 1 block with 5 data + 4 ecc
      // Group 2: 1 block with 6 data + 4 ecc
      // Total: 5 + 6 = 11 data, 4 + 4 = 8 ecc
      // 19 total codewords

      // Interleaved data: max data count is 6
      // pos 0-1: [b0d0, b1d0] (both blocks have d0)
      // pos 2-3: [b0d1, b1d1]
      // ... pos 8-9: [b0d4, b1d4]
      // pos 10: [b1d5] (only block 1 has 6 data bytes)
      // Interleaved ecc: max ecc count is 4
      // pos 11-12: [b0e0, b1e0]
      // ...
      const codewords = new Array(19).fill(0);
      const rsBlocks = [
        [1, 9, 5],
        [1, 10, 6],
      ];

      const result = correctRSCodewords(codewords, rsBlocks);
      expect(result).not.toBeNull();
      expect(result!.dataCodewords.length).toBe(11);
    });
  });
});
