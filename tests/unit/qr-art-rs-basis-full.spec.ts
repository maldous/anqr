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

describe('qr-art/rs-basis.ts', () => {
  describe('computeECC', () => {
    it('produces correct number of ECC bytes for v1-L (7 ECC)', async () => {
      const { computeECC } = await import('../../src/modules/qr-art/rs-basis');
      const data = new Uint8Array(19); // v1-L: 19 data bytes
      const ecc = computeECC(data, 7);
      expect(ecc).toBeInstanceOf(Uint8Array);
      expect(ecc.length).toBe(7);
    });

    it('produces correct number of ECC bytes for v1-M (10 ECC)', async () => {
      const { computeECC } = await import('../../src/modules/qr-art/rs-basis');
      const data = new Uint8Array(16); // v1-M: 16 data bytes
      const ecc = computeECC(data, 10);
      expect(ecc.length).toBe(10);
    });

    it('ECC is deterministic (same input → same output)', async () => {
      const { computeECC } = await import('../../src/modules/qr-art/rs-basis');
      const data = new Uint8Array([0x40, 0x56, 0x86, 0x56, 0xc6, 0xc6, 0xf0, 0xec, 0x11]);
      const ecc1 = computeECC(data, 7);
      const ecc2 = computeECC(data, 7);
      expect(Array.from(ecc1)).toEqual(Array.from(ecc2));
    });

    it('different data produces different ECC', async () => {
      const { computeECC } = await import('../../src/modules/qr-art/rs-basis');
      const data1 = new Uint8Array(19).fill(0);
      const data2 = new Uint8Array(19).fill(1);
      const ecc1 = computeECC(data1, 7);
      const ecc2 = computeECC(data2, 7);
      expect(Array.from(ecc1)).not.toEqual(Array.from(ecc2));
    });

    it('RS linearity: ECC(a XOR b) = ECC(a) XOR ECC(b)', async () => {
      const { computeECC } = await import('../../src/modules/qr-art/rs-basis');
      const a = new Uint8Array([1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const b = new Uint8Array([0, 0, 0, 0, 0, 6, 7, 8, 9, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
      const ab = new Uint8Array(19);
      for (let i = 0; i < 19; i++) ab[i] = a[i] ^ b[i];

      const eccA = computeECC(a, 7);
      const eccB = computeECC(b, 7);
      const eccAB = computeECC(ab, 7);

      const xorEcc = new Uint8Array(7);
      for (let i = 0; i < 7; i++) xorEcc[i] = eccA[i] ^ eccB[i];

      expect(Array.from(xorEcc)).toEqual(Array.from(eccAB));
    });
  });

  describe('getHeaderBitCount', () => {
    it('v1 byte mode: 4 + 8 = 12', async () => {
      const { getHeaderBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getHeaderBitCount(1)).toBe(12);
    });

    it('v9 byte mode: 4 + 8 = 12 (versions 1-9 use 8-bit char count)', async () => {
      const { getHeaderBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getHeaderBitCount(9)).toBe(12);
    });

    it('v10 byte mode: 4 + 16 = 20 (versions 10-26 use 16-bit char count)', async () => {
      const { getHeaderBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getHeaderBitCount(10)).toBe(20);
    });

    it('v27 byte mode: 4 + 16 = 20 (versions 27-40 use 16-bit char count)', async () => {
      const { getHeaderBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getHeaderBitCount(27)).toBe(20);
    });
  });

  describe('getContentBitCount', () => {
    it('v1 with 5 chars: header(12) + data(40) + terminator(4) = 56', async () => {
      const { getContentBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getContentBitCount(1, 5)).toBe(56);
    });

    it('v1 with 0 chars: header(12) + data(0) + terminator(4) = 16', async () => {
      const { getContentBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getContentBitCount(1, 0)).toBe(16);
    });

    it('v10 with 10 chars: header(20) + data(80) + terminator(4) = 104', async () => {
      const { getContentBitCount } = await import('../../src/modules/qr-art/rs-basis');
      expect(getContentBitCount(10, 10)).toBe(104);
    });
  });

  describe('hashStringToSeed', () => {
    it('returns the same hash for the same string', async () => {
      const { hashStringToSeed } = await import('../../src/modules/qr-art/rs-basis');
      expect(hashStringToSeed('hello')).toBe(hashStringToSeed('hello'));
    });

    it('returns different hashes for different strings', async () => {
      const { hashStringToSeed } = await import('../../src/modules/qr-art/rs-basis');
      expect(hashStringToSeed('hello')).not.toBe(hashStringToSeed('world'));
    });

    it('returns unsigned 32-bit value (>= 0)', async () => {
      const { hashStringToSeed } = await import('../../src/modules/qr-art/rs-basis');
      expect(hashStringToSeed('test')).toBeGreaterThanOrEqual(0);
      expect(hashStringToSeed('test')).toBeLessThanOrEqual(0xffffffff);
    });

    it('handles empty string', async () => {
      const { hashStringToSeed } = await import('../../src/modules/qr-art/rs-basis');
      const hash = hashStringToSeed('');
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe('mulberry32', () => {
    it('produces deterministic sequence from same seed', async () => {
      const { mulberry32 } = await import('../../src/modules/qr-art/rs-basis');
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(42);
      for (let i = 0; i < 10; i++) {
        expect(rng1()).toBe(rng2());
      }
    });

    it('produces different sequences from different seeds', async () => {
      const { mulberry32 } = await import('../../src/modules/qr-art/rs-basis');
      const rng1 = mulberry32(42);
      const rng2 = mulberry32(99);
      const vals1 = Array.from({ length: 5 }, () => rng1());
      const vals2 = Array.from({ length: 5 }, () => rng2());
      expect(vals1).not.toEqual(vals2);
    });

    it('all values are in [0, 1)', async () => {
      const { mulberry32 } = await import('../../src/modules/qr-art/rs-basis');
      const rng = mulberry32(123);
      for (let i = 0; i < 100; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });

  describe('generateDeterministicSuffix', () => {
    it('produces correct length', async () => {
      const { generateDeterministicSuffix } = await import('../../src/modules/qr-art/rs-basis');
      expect(generateDeterministicSuffix(10, 42).length).toBe(10);
      expect(generateDeterministicSuffix(0, 42).length).toBe(0);
      expect(generateDeterministicSuffix(100, 42).length).toBe(100);
    });

    it('is deterministic (same seed → same suffix)', async () => {
      const { generateDeterministicSuffix } = await import('../../src/modules/qr-art/rs-basis');
      expect(generateDeterministicSuffix(20, 42)).toBe(generateDeterministicSuffix(20, 42));
    });

    it('uses only alphanumeric characters', async () => {
      const { generateDeterministicSuffix } = await import('../../src/modules/qr-art/rs-basis');
      const suffix = generateDeterministicSuffix(200, 12345);
      expect(suffix).toMatch(/^[A-Za-z0-9]*$/);
    });

    it('different seeds produce different suffixes', async () => {
      const { generateDeterministicSuffix } = await import('../../src/modules/qr-art/rs-basis');
      expect(generateDeterministicSuffix(20, 1)).not.toBe(generateDeterministicSuffix(20, 2));
    });
  });

  describe('generateDeterministicNumericSuffix', () => {
    it('produces correct length', async () => {
      const { generateDeterministicNumericSuffix } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      expect(generateDeterministicNumericSuffix(10, 42).length).toBe(10);
    });

    it('uses only digits', async () => {
      const { generateDeterministicNumericSuffix } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const suffix = generateDeterministicNumericSuffix(100, 999);
      expect(suffix).toMatch(/^[0-9]*$/);
    });

    it('is deterministic', async () => {
      const { generateDeterministicNumericSuffix } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      expect(generateDeterministicNumericSuffix(20, 42)).toBe(
        generateDeterministicNumericSuffix(20, 42)
      );
    });
  });

  describe('generateRandomSuffix', () => {
    it('produces correct length', async () => {
      const { generateRandomSuffix } = await import('../../src/modules/qr-art/rs-basis');
      expect(generateRandomSuffix(10).length).toBe(10);
      expect(generateRandomSuffix(0).length).toBe(0);
    });

    it('uses only alphanumeric characters', async () => {
      const { generateRandomSuffix } = await import('../../src/modules/qr-art/rs-basis');
      const suffix = generateRandomSuffix(200);
      expect(suffix).toMatch(/^[A-Za-z0-9]*$/);
    });
  });

  describe('calculateProtectedBitsPerBlock', () => {
    it('returns all zeros when protectedBitCount is 0', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blocks = [
        { blockIndex: 0, dataCount: 19, eccCount: 7, totalCount: 26 },
      ];
      const result = calculateProtectedBitsPerBlock(blocks, 0);
      expect(result).toEqual([0]);
    });

    it('returns all zeros when no blocks', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const result = calculateProtectedBitsPerBlock([], 100);
      expect(result).toEqual([]);
    });

    it('single block: protected bits equal ceil(protectedBitCount/8)*8', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blocks = [
        { blockIndex: 0, dataCount: 19, eccCount: 7, totalCount: 26 },
      ];
      // Protect 56 bits → 7 bytes → block 0 gets 7*8=56 protected bits
      const result = calculateProtectedBitsPerBlock(blocks, 56);
      expect(result[0]).toBe(56);
    });

    it('single block: non-byte-aligned rounds up', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blocks = [
        { blockIndex: 0, dataCount: 19, eccCount: 7, totalCount: 26 },
      ];
      // Protect 50 bits → ceil(50/8)=7 bytes → 56 protected bits
      const result = calculateProtectedBitsPerBlock(blocks, 50);
      expect(result[0]).toBe(56);
    });

    it('multi-block: protection distributes across blocks via interleaving', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      // 2 equal blocks of 10 data bytes each
      const blocks = [
        { blockIndex: 0, dataCount: 10, eccCount: 5, totalCount: 15 },
        { blockIndex: 1, dataCount: 10, eccCount: 5, totalCount: 15 },
      ];
      // Protect first 16 bits = 2 bytes in interleaved stream
      // Interleaved: block0[0], block1[0], block0[1], block1[1], ...
      // First 2 interleaved bytes = block0[0] and block1[0]
      // Both blocks get byte 0 protected → 8 bits each
      const result = calculateProtectedBitsPerBlock(blocks, 16);
      expect(result[0]).toBe(8);
      expect(result[1]).toBe(8);
    });

    it('multi-block: odd number of protected bytes', async () => {
      const { calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blocks = [
        { blockIndex: 0, dataCount: 10, eccCount: 5, totalCount: 15 },
        { blockIndex: 1, dataCount: 10, eccCount: 5, totalCount: 15 },
      ];
      // Protect 24 bits = 3 bytes in interleaved stream
      // Interleaved bytes: block0[0], block1[0], block0[1]
      // block0 protects bytes 0,1 → 16 bits
      // block1 protects byte 0 → 8 bits
      const result = calculateProtectedBitsPerBlock(blocks, 24);
      expect(result[0]).toBe(16);
      expect(result[1]).toBe(8);
    });
  });

  describe('analyzeQRArtCapacity', () => {
    it('returns valid capacity info for v1-M with short data', async () => {
      const { analyzeQRArtCapacity } = await import('../../src/modules/qr-art/rs-basis');
      const info = analyzeQRArtCapacity(1, 'M', 5);
      expect(info.version).toBe(1);
      expect(info.ecc).toBe('M');
      expect(info.totalDataBits).toBe(16 * 8); // v1-M: 16 data bytes
      expect(info.protectedBits).toBeGreaterThan(0);
      expect(info.controllableBits).toBeLessThanOrEqual(info.totalDataBits);
      expect(info.controlPercentage).toBeGreaterThanOrEqual(0);
      expect(info.controlPercentage).toBeLessThanOrEqual(100);
      expect(info.protectionMode).toBe('full-content');
    });

    it('longer data → less controllable bits', async () => {
      const { analyzeQRArtCapacity } = await import('../../src/modules/qr-art/rs-basis');
      const short = analyzeQRArtCapacity(5, 'M', 5);
      const long = analyzeQRArtCapacity(5, 'M', 30);
      expect(short.controllableBits).toBeGreaterThan(long.controllableBits);
    });

    it('higher ECC → fewer total data bits', async () => {
      const { analyzeQRArtCapacity } = await import('../../src/modules/qr-art/rs-basis');
      const lowEcc = analyzeQRArtCapacity(5, 'L', 5);
      const highEcc = analyzeQRArtCapacity(5, 'H', 5);
      expect(lowEcc.totalDataBits).toBeGreaterThan(highEcc.totalDataBits);
    });
  });

  describe('buildBlockBasis', () => {
    it('without protection: creates vectors for all data bits', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      expect(vectors.length).toBe(5 * 8); // 5 data bytes × 8 bits each
    });

    it('with protection: only creates vectors for allowed bits', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 };
      // Allow only the last byte's bits (local bits 32-39)
      const allowed = new Set<number>();
      for (let i = 32; i < 40; i++) allowed.add(i);
      const vectors = buildBlockBasis(blockInfo, 0, 0, allowed);
      expect(vectors.length).toBe(8); // only 1 byte's worth
    });

    it('with empty allowed set: creates no vectors', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 };
      const vectors = buildBlockBasis(blockInfo, 0, 0, new Set<number>());
      expect(vectors.length).toBe(0);
    });

    it('each vector has blockBits of correct length (data + ECC)', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      for (const v of vectors) {
        expect(v.blockBits.length).toBe(8); // totalCount
      }
    });

    it('each vector has exactly one data bit set in its data portion', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);

      for (const v of vectors) {
        // Count set bits in data portion (first dataCount bytes)
        let setBits = 0;
        for (let i = 0; i < blockInfo.dataCount; i++) {
          for (let bit = 0; bit < 8; bit++) {
            if (v.blockBits[i] & (1 << bit)) setBits++;
          }
        }
        expect(setBits).toBe(1);
      }
    });

    it('vector rsBlockIndex and pivotPixel are set correctly', async () => {
      const { buildBlockBasis } = await import('../../src/modules/qr-art/rs-basis');
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const vectors = buildBlockBasis(blockInfo, 2, 100);
      for (const v of vectors) {
        expect(v.rsBlockIndex).toBe(2);
        expect(v.pivotPixel).toBe(-1);
        expect(v.affectedPixels).toEqual([]);
      }
    });
  });

  describe('buildFullBasis', () => {
    it('builds basis for v1-M without protection (legacy mode)', async () => {
      const { buildFullBasis, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const basis = buildFullBasis(1, 'M');
      expect(basis.version).toBe(1);
      expect(basis.ecc).toBe('M');
      expect(basis.totalDataBits).toBe(16 * 8);
      // All data bits should have vectors in legacy mode
      expect(basis.vectors.length).toBe(16 * 8);
    });

    it('builds basis with semantic range protection', async () => {
      const { buildFullBasis, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      // Protect first 32 bits, allow bits 32-127 (v1-M has 128 total data bits)
      const allowedRanges = [{ startBit: 32, endBit: 128 }];
      const basis = buildFullBasis(1, 'M', allowedRanges);
      // Should have fewer vectors than total data bits
      expect(basis.vectors.length).toBeLessThan(16 * 8);
      expect(basis.vectors.length).toBeGreaterThan(0);
    });

    it('caches results (second call returns same object)', async () => {
      const { buildFullBasis, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const b1 = buildFullBasis(2, 'L');
      const b2 = buildFullBasis(2, 'L');
      expect(b1).toBe(b2); // same reference
    });

    it('different ECC levels produce different bases', async () => {
      const { buildFullBasis, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const bL = buildFullBasis(1, 'L');
      const bH = buildFullBasis(1, 'H');
      expect(bL.totalDataBits).not.toBe(bH.totalDataBits);
    });
  });

  describe('clearBasisCache', () => {
    it('after clearing, buildFullBasis returns a new object', async () => {
      const { buildFullBasis, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const b1 = buildFullBasis(1, 'L');
      clearBasisCache();
      const b2 = buildFullBasis(1, 'L');
      expect(b1).not.toBe(b2); // different references
      // But same values
      expect(b1.totalDataBits).toBe(b2.totalDataBits);
      expect(b1.vectors.length).toBe(b2.vectors.length);
    });
  });

  describe('xorBasisVectors', () => {
    it('XOR of two vectors from the same block produces a valid combined vector', async () => {
      const { buildBlockBasis, xorBasisVectors } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blockInfo = { blockIndex: 0, dataCount: 5, eccCount: 3, totalCount: 8 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      const combined = xorBasisVectors(vectors[0], vectors[1]);

      expect(combined.rsBlockIndex).toBe(0);
      expect(combined.dataBitIndex).toBe(-1); // combined vector
      expect(combined.pivotPixel).toBe(-1);
      expect(combined.blockBits.length).toBe(8);

      // Verify XOR correctness
      for (let i = 0; i < 8; i++) {
        expect(combined.blockBits[i]).toBe(vectors[0].blockBits[i] ^ vectors[1].blockBits[i]);
      }
    });

    it('throws when XORing vectors from different blocks', async () => {
      const { buildBlockBasis, xorBasisVectors } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const v0 = buildBlockBasis(blockInfo, 0, 0);
      const v1 = buildBlockBasis(blockInfo, 1, 24);
      expect(() => xorBasisVectors(v0[0], v1[0])).toThrow('different RS blocks');
    });

    it('XOR with itself produces all-zero blockBits', async () => {
      const { buildBlockBasis, xorBasisVectors } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      const selfXor = xorBasisVectors(vectors[0], vectors[0]);
      for (let i = 0; i < selfXor.blockBits.length; i++) {
        expect(selfXor.blockBits[i]).toBe(0);
      }
    });
  });

  describe('basisToMatrix', () => {
    it('converts vectors to boolean matrix with correct dimensions', async () => {
      const { buildBlockBasis, basisToMatrix } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      const totalBits = 5 * 8;
      const matrix = basisToMatrix(vectors, totalBits);

      expect(matrix.length).toBe(vectors.length); // 24 rows (3 bytes × 8 bits)
      for (const row of matrix) {
        expect(row.length).toBe(totalBits); // 40 columns
      }
    });

    it('each row has at least one true bit', async () => {
      const { buildBlockBasis, basisToMatrix } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blockInfo = { blockIndex: 0, dataCount: 3, eccCount: 2, totalCount: 5 };
      const vectors = buildBlockBasis(blockInfo, 0, 0);
      const matrix = basisToMatrix(vectors, 5 * 8);

      for (const row of matrix) {
        expect(row.some((v) => v)).toBe(true);
      }
    });
  });

  describe('matrixRowToBytes', () => {
    it('converts boolean row back to bytes', async () => {
      const { matrixRowToBytes } = await import('../../src/modules/qr-art/rs-basis');
      // 10000001 01000010 → [0x81, 0x42]
      const row = [true, false, false, false, false, false, false, true, false, true, false, false, false, false, true, false];
      const bytes = matrixRowToBytes(row, 2);
      expect(bytes[0]).toBe(0x81);
      expect(bytes[1]).toBe(0x42);
    });

    it('handles all zeros', async () => {
      const { matrixRowToBytes } = await import('../../src/modules/qr-art/rs-basis');
      const row = new Array(16).fill(false);
      const bytes = matrixRowToBytes(row, 2);
      expect(bytes[0]).toBe(0);
      expect(bytes[1]).toBe(0);
    });

    it('handles all ones', async () => {
      const { matrixRowToBytes } = await import('../../src/modules/qr-art/rs-basis');
      const row = new Array(8).fill(true);
      const bytes = matrixRowToBytes(row, 1);
      expect(bytes[0]).toBe(0xff);
    });

    it('handles row shorter than byteCount * 8', async () => {
      const { matrixRowToBytes } = await import('../../src/modules/qr-art/rs-basis');
      const row = [true, false, true]; // 3 bits
      const bytes = matrixRowToBytes(row, 2);
      expect(bytes[0]).toBe(0xa0); // 10100000
      expect(bytes[1]).toBe(0x00);
    });
  });

  describe('calculateOptimalVersionAndSuffix', () => {
    it('byte mode: returns valid version and suffix for short URL', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const result = calculateOptimalVersionAndSuffix(0, 'M', 20, 50, 'byte');
      expect(result.version).toBeGreaterThanOrEqual(1);
      expect(result.suffixLength).toBeGreaterThan(0);
      expect(result.totalCapacity).toBeGreaterThan(0);
      expect(result.expectedControlPercent).toBeGreaterThanOrEqual(0);
      expect(result.originalVersion).toBeGreaterThanOrEqual(1);
    });

    it('numeric mode: returns valid results', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const result = calculateOptimalVersionAndSuffix(0, 'M', 20, 50, 'numeric');
      expect(result.version).toBeGreaterThanOrEqual(1);
      expect(result.suffixLength).toBeGreaterThan(0);
    });

    it('longer data requires larger version', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const short = calculateOptimalVersionAndSuffix(0, 'M', 5, 50, 'byte');
      const long = calculateOptimalVersionAndSuffix(0, 'M', 100, 50, 'byte');
      expect(long.originalVersion).toBeGreaterThanOrEqual(short.originalVersion);
    });

    it('version is upgraded when minControlPercent is not met', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      // Very long data in small version → must upgrade
      const result = calculateOptimalVersionAndSuffix(1, 'H', 5, 90, 'byte');
      // With ECC H and high control requirement, version likely upgraded
      expect(result.version).toBeGreaterThanOrEqual(result.originalVersion);
    });

    it('respects minVersion parameter', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const result = calculateOptimalVersionAndSuffix(5, 'M', 5, 30, 'byte');
      expect(result.version).toBeGreaterThanOrEqual(5);
    });

    it('paddingBytes + suffixBits + paddingBits are all >= 0', async () => {
      const { calculateOptimalVersionAndSuffix, clearBasisCache } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      clearBasisCache();
      const result = calculateOptimalVersionAndSuffix(0, 'L', 10, 50, 'byte');
      expect(result.paddingBytes).toBeGreaterThanOrEqual(0);
      expect(result.suffixBits).toBeGreaterThanOrEqual(0);
      expect(result.paddingBits).toBeGreaterThanOrEqual(0);
    });
  });

  describe('constants', () => {
    it('MIN_QART_VERSION is 1', async () => {
      const { MIN_QART_VERSION } = await import('../../src/modules/qr-art/rs-basis');
      expect(MIN_QART_VERSION).toBe(1);
    });

    it('MIN_ECC_HEADROOM_BYTES is 2', async () => {
      const { MIN_ECC_HEADROOM_BYTES } = await import('../../src/modules/qr-art/rs-basis');
      expect(MIN_ECC_HEADROOM_BYTES).toBe(2);
    });
  });

  describe('calculateHeaderBitsPerBlock (deprecated)', () => {
    it('is an alias for calculateProtectedBitsPerBlock', async () => {
      const { calculateHeaderBitsPerBlock, calculateProtectedBitsPerBlock } = await import(
        '../../src/modules/qr-art/rs-basis'
      );
      const blocks = [
        { blockIndex: 0, dataCount: 10, eccCount: 5, totalCount: 15 },
        { blockIndex: 1, dataCount: 10, eccCount: 5, totalCount: 15 },
      ];
      expect(calculateHeaderBitsPerBlock(blocks, 24)).toEqual(
        calculateProtectedBitsPerBlock(blocks, 24)
      );
    });
  });
});
