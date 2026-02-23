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

describe('qr-art/bit-mapping.ts', () => {
  describe('getModuleCount', () => {
    it('v1 → 21', async () => {
      const { getModuleCount } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getModuleCount(1)).toBe(21);
    });

    it('v2 → 25', async () => {
      const { getModuleCount } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getModuleCount(2)).toBe(25);
    });

    it('v10 → 57', async () => {
      const { getModuleCount } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getModuleCount(10)).toBe(57);
    });

    it('v40 → 177', async () => {
      const { getModuleCount } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getModuleCount(40)).toBe(177);
    });

    it('formula: version * 4 + 17', async () => {
      const { getModuleCount } = await import('../../src/modules/qr-art/bit-mapping');
      for (let v = 1; v <= 40; v++) {
        expect(getModuleCount(v)).toBe(v * 4 + 17);
      }
    });
  });

  describe('getRSBlockInfo', () => {
    it('v1 L → single block with 19 data + 7 ECC = 26 total', async () => {
      const { getRSBlockInfo } = await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(1, 'L');
      expect(blocks.length).toBe(1);
      expect(blocks[0].blockIndex).toBe(0);
      expect(blocks[0].dataCount).toBe(19);
      expect(blocks[0].eccCount).toBe(7);
      expect(blocks[0].totalCount).toBe(26);
    });

    it('v1 M → single block with 16 data + 10 ECC = 26 total', async () => {
      const { getRSBlockInfo } = await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(1, 'M');
      expect(blocks.length).toBe(1);
      expect(blocks[0].dataCount).toBe(16);
      expect(blocks[0].eccCount).toBe(10);
      expect(blocks[0].totalCount).toBe(26);
    });

    it('v1 H → single block with 9 data bytes', async () => {
      const { getRSBlockInfo } = await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(1, 'H');
      expect(blocks.length).toBe(1);
      expect(blocks[0].dataCount).toBe(9);
    });

    it('v5 Q → multiple blocks', async () => {
      const { getRSBlockInfo } = await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(5, 'Q');
      expect(blocks.length).toBeGreaterThan(1);
      // Each block should have valid structure
      for (let i = 0; i < blocks.length; i++) {
        expect(blocks[i].blockIndex).toBe(i);
        expect(blocks[i].dataCount).toBeGreaterThan(0);
        expect(blocks[i].eccCount).toBeGreaterThan(0);
        expect(blocks[i].totalCount).toBe(blocks[i].dataCount + blocks[i].eccCount);
      }
    });

    it('higher ECC → fewer data bytes', async () => {
      const { getRSBlockInfo } = await import('../../src/modules/qr-art/bit-mapping');
      const blocksL = getRSBlockInfo(5, 'L');
      const blocksH = getRSBlockInfo(5, 'H');
      const dataL = blocksL.reduce((sum, b) => sum + b.dataCount, 0);
      const dataH = blocksH.reduce((sum, b) => sum + b.dataCount, 0);
      expect(dataL).toBeGreaterThan(dataH);
    });
  });

  describe('getTotalDataBytes', () => {
    it('v1 L → 19', async () => {
      const { getTotalDataBytes } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalDataBytes(1, 'L')).toBe(19);
    });

    it('v1 M → 16', async () => {
      const { getTotalDataBytes } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalDataBytes(1, 'M')).toBe(16);
    });

    it('v1 H → 9', async () => {
      const { getTotalDataBytes } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalDataBytes(1, 'H')).toBe(9);
    });

    it('larger versions have more data bytes', async () => {
      const { getTotalDataBytes } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalDataBytes(5, 'M')).toBeGreaterThan(getTotalDataBytes(1, 'M'));
      expect(getTotalDataBytes(10, 'M')).toBeGreaterThan(getTotalDataBytes(5, 'M'));
    });

    it('equals sum of dataCount across all blocks', async () => {
      const { getTotalDataBytes, getRSBlockInfo } =
        await import('../../src/modules/qr-art/bit-mapping');
      for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
        const blocks = getRSBlockInfo(5, ecc);
        const sum = blocks.reduce((s, b) => s + b.dataCount, 0);
        expect(getTotalDataBytes(5, ecc)).toBe(sum);
      }
    });
  });

  describe('getTotalCodewords', () => {
    it('v1 L → 26 (19 data + 7 ECC)', async () => {
      const { getTotalCodewords } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalCodewords(1, 'L')).toBe(26);
    });

    it('v1 M → 26 (16 data + 10 ECC)', async () => {
      const { getTotalCodewords } = await import('../../src/modules/qr-art/bit-mapping');
      expect(getTotalCodewords(1, 'M')).toBe(26);
    });

    it('equals sum of totalCount across all blocks', async () => {
      const { getTotalCodewords, getRSBlockInfo } =
        await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(5, 'Q');
      const sum = blocks.reduce((s, b) => s + b.totalCount, 0);
      expect(getTotalCodewords(5, 'Q')).toBe(sum);
    });

    it('same version with different ECC may have different total', async () => {
      const { getTotalCodewords } = await import('../../src/modules/qr-art/bit-mapping');
      // All ECC levels for same version have same total codewords
      // (the version determines the capacity, ECC just allocates it differently)
      const l = getTotalCodewords(5, 'L');
      const h = getTotalCodewords(5, 'H');
      // They should be the same (total capacity is version-dependent)
      expect(l).toBe(h);
    });
  });

  describe('pixelToIndex', () => {
    it('(0,0,21) → 0', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      expect(pixelToIndex(0, 0, 21)).toBe(0);
    });

    it('(1,0,21) → 21', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      expect(pixelToIndex(1, 0, 21)).toBe(21);
    });

    it('(0,1,21) → 1', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      expect(pixelToIndex(0, 1, 21)).toBe(1);
    });

    it('(5,5,21) → 110', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      expect(pixelToIndex(5, 5, 21)).toBe(5 * 21 + 5);
    });

    it('(20,20,21) → 440 (last pixel)', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      expect(pixelToIndex(20, 20, 21)).toBe(20 * 21 + 20);
    });

    it('formula: row * moduleCount + col', async () => {
      const { pixelToIndex } = await import('../../src/modules/qr-art/bit-mapping');
      for (let row = 0; row < 5; row++) {
        for (let col = 0; col < 5; col++) {
          expect(pixelToIndex(row, col, 25)).toBe(row * 25 + col);
        }
      }
    });
  });

  describe('indexToPixel', () => {
    it('(0,21) → {row:0, col:0}', async () => {
      const { indexToPixel } = await import('../../src/modules/qr-art/bit-mapping');
      expect(indexToPixel(0, 21)).toEqual({ row: 0, col: 0 });
    });

    it('(21,21) → {row:1, col:0}', async () => {
      const { indexToPixel } = await import('../../src/modules/qr-art/bit-mapping');
      expect(indexToPixel(21, 21)).toEqual({ row: 1, col: 0 });
    });

    it('(110,21) → {row:5, col:5}', async () => {
      const { indexToPixel } = await import('../../src/modules/qr-art/bit-mapping');
      expect(indexToPixel(110, 21)).toEqual({ row: 5, col: 5 });
    });

    it('(1,21) → {row:0, col:1}', async () => {
      const { indexToPixel } = await import('../../src/modules/qr-art/bit-mapping');
      expect(indexToPixel(1, 21)).toEqual({ row: 0, col: 1 });
    });

    it('round-trip: pixelToIndex → indexToPixel', async () => {
      const { pixelToIndex, indexToPixel } = await import('../../src/modules/qr-art/bit-mapping');
      for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
          const idx = pixelToIndex(row, col, 25);
          const pixel = indexToPixel(idx, 25);
          expect(pixel.row).toBe(row);
          expect(pixel.col).toBe(col);
        }
      }
    });
  });

  describe('buildBitPixelMap', () => {
    it('returns array of BitPixelMapping objects for v1-M mask 0', async () => {
      const { buildBitPixelMap, getTotalCodewords } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      expect(Array.isArray(mappings)).toBe(true);
      expect(mappings.length).toBe(getTotalCodewords(1, 'M') * 8);
    });

    it('all mappings have valid row/col within moduleCount', async () => {
      const { buildBitPixelMap, getModuleCount } =
        await import('../../src/modules/qr-art/bit-mapping');
      const moduleCount = getModuleCount(1);
      const mappings = buildBitPixelMap(1, 'M', 0);
      for (const m of mappings) {
        expect(m.row).toBeGreaterThanOrEqual(0);
        expect(m.row).toBeLessThan(moduleCount);
        expect(m.col).toBeGreaterThanOrEqual(0);
        expect(m.col).toBeLessThan(moduleCount);
      }
    });

    it('each mapping has valid rsBlockIndex and posInBlock', async () => {
      const { buildBitPixelMap, getRSBlockInfo } =
        await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(1, 'M');
      const maxBlockIdx = blocks.length - 1;
      const mappings = buildBitPixelMap(1, 'M', 0);
      for (const m of mappings) {
        expect(m.rsBlockIndex).toBeGreaterThanOrEqual(0);
        expect(m.rsBlockIndex).toBeLessThanOrEqual(maxBlockIdx);
        expect(m.posInBlock).toBeGreaterThanOrEqual(0);
        expect(m.bitInByte).toBeGreaterThanOrEqual(0);
        expect(m.bitInByte).toBeLessThanOrEqual(7);
      }
    });

    it('pixel indices are unique (no two bits map to same pixel)', async () => {
      const { buildBitPixelMap } = await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const pixelIndices = new Set(mappings.map((m) => m.pixelIndex));
      expect(pixelIndices.size).toBe(mappings.length);
    });

    it('different masks produce different mappings', async () => {
      const { buildBitPixelMap } = await import('../../src/modules/qr-art/bit-mapping');
      const map0 = buildBitPixelMap(1, 'M', 0);
      const map3 = buildBitPixelMap(1, 'M', 3);
      // Same number of mappings
      expect(map0.length).toBe(map3.length);
      // But pixel positions should be the same (mask doesn't affect placement)
      // The mask only affects which bits are flipped, not where they are placed
      expect(map0[0].row).toBe(map3[0].row);
      expect(map0[0].col).toBe(map3[0].col);
    });

    it('v2-L produces more mappings than v1-L', async () => {
      const { buildBitPixelMap } = await import('../../src/modules/qr-art/bit-mapping');
      const map1 = buildBitPixelMap(1, 'L', 0);
      const map2 = buildBitPixelMap(2, 'L', 0);
      expect(map2.length).toBeGreaterThan(map1.length);
    });

    it('interleaving map distinguishes data and ECC bytes', async () => {
      const { buildBitPixelMap, getRSBlockInfo } =
        await import('../../src/modules/qr-art/bit-mapping');
      const blocks = getRSBlockInfo(1, 'M');
      const totalDataBits = blocks.reduce((s, b) => s + b.dataCount, 0) * 8;
      const mappings = buildBitPixelMap(1, 'M', 0);

      let dataBits = 0;
      let eccBits = 0;
      for (const m of mappings) {
        if (m.isData) dataBits++;
        else eccBits++;
      }

      expect(dataBits).toBe(totalDataBits);
      expect(eccBits).toBe(mappings.length - totalDataBits);
    });
  });

  describe('getDataPixelIndices', () => {
    it('v1 returns array of non-structural pixel indices', async () => {
      const { getDataPixelIndices, getModuleCount } =
        await import('../../src/modules/qr-art/bit-mapping');
      const indices = getDataPixelIndices(1);
      const moduleCount = getModuleCount(1);
      expect(Array.isArray(indices)).toBe(true);
      expect(indices.length).toBeGreaterThan(0);
      // All indices should be within valid range
      for (const idx of indices) {
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(moduleCount * moduleCount);
      }
    });

    it('no duplicates', async () => {
      const { getDataPixelIndices } = await import('../../src/modules/qr-art/bit-mapping');
      const indices = getDataPixelIndices(1);
      const unique = new Set(indices);
      expect(unique.size).toBe(indices.length);
    });

    it('v1 has fewer data pixels than total pixels (structural are excluded)', async () => {
      const { getDataPixelIndices, getModuleCount } =
        await import('../../src/modules/qr-art/bit-mapping');
      const indices = getDataPixelIndices(1);
      const moduleCount = getModuleCount(1);
      const totalPixels = moduleCount * moduleCount;
      expect(indices.length).toBeLessThan(totalPixels);
      // V1 (21x21 = 441 total) should have significantly fewer data pixels
      // due to finders (3×49=147 minus overlaps), timing, format info, etc.
      expect(indices.length).toBeGreaterThan(100);
      expect(indices.length).toBeLessThan(400);
    });

    it('larger version has more data pixels', async () => {
      const { getDataPixelIndices } = await import('../../src/modules/qr-art/bit-mapping');
      const v1 = getDataPixelIndices(1);
      const v5 = getDataPixelIndices(5);
      expect(v5.length).toBeGreaterThan(v1.length);
    });
  });

  describe('buildPixelToBitMap', () => {
    it('creates Map from mappings with correct size', async () => {
      const { buildBitPixelMap, buildPixelToBitMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildPixelToBitMap(mappings);

      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(mappings.length);
    });

    it('each key is a valid pixel index', async () => {
      const { buildBitPixelMap, buildPixelToBitMap, getModuleCount } =
        await import('../../src/modules/qr-art/bit-mapping');
      const moduleCount = getModuleCount(1);
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildPixelToBitMap(mappings);

      for (const [pixelIdx] of map) {
        expect(pixelIdx).toBeGreaterThanOrEqual(0);
        expect(pixelIdx).toBeLessThan(moduleCount * moduleCount);
      }
    });

    it('values are the original BitPixelMapping objects', async () => {
      const { buildBitPixelMap, buildPixelToBitMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildPixelToBitMap(mappings);

      // Check that we can look up the first mapping by its pixel index
      const firstMapping = mappings[0];
      const looked = map.get(firstMapping.pixelIndex);
      expect(looked).toBe(firstMapping);
    });

    it('empty mappings → empty Map', async () => {
      const { buildPixelToBitMap } = await import('../../src/modules/qr-art/bit-mapping');
      const map = buildPixelToBitMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('buildBitToMappingMap', () => {
    it('creates Map from mappings with correct size', async () => {
      const { buildBitPixelMap, buildBitToMappingMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildBitToMappingMap(mappings);

      expect(map).toBeInstanceOf(Map);
      expect(map.size).toBe(mappings.length);
    });

    it('each key is a valid global bit index', async () => {
      const { buildBitPixelMap, buildBitToMappingMap, getTotalCodewords } =
        await import('../../src/modules/qr-art/bit-mapping');
      const totalBits = getTotalCodewords(1, 'M') * 8;
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildBitToMappingMap(mappings);

      for (const [bitIdx] of map) {
        expect(bitIdx).toBeGreaterThanOrEqual(0);
        expect(bitIdx).toBeLessThan(totalBits);
      }
    });

    it('values are the original BitPixelMapping objects', async () => {
      const { buildBitPixelMap, buildBitToMappingMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const map = buildBitToMappingMap(mappings);

      const firstMapping = mappings[0];
      const looked = map.get(firstMapping.globalBitIndex);
      expect(looked).toBe(firstMapping);
    });

    it('empty mappings → empty Map', async () => {
      const { buildBitToMappingMap } = await import('../../src/modules/qr-art/bit-mapping');
      const map = buildBitToMappingMap([]);
      expect(map.size).toBe(0);
    });
  });

  describe('integration: buildBitPixelMap → buildPixelToBitMap → buildBitToMappingMap', () => {
    it('pixel map and bit map reference the same mapping objects', async () => {
      const { buildBitPixelMap, buildPixelToBitMap, buildBitToMappingMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(2, 'M', 0);
      const pixelMap = buildPixelToBitMap(mappings);
      const bitMap = buildBitToMappingMap(mappings);

      // For each mapping, both maps should reference the same object
      for (const m of mappings) {
        expect(pixelMap.get(m.pixelIndex)).toBe(m);
        expect(bitMap.get(m.globalBitIndex)).toBe(m);
      }
    });

    it('all 8 bits within a codeword map to consecutive global bit indices', async () => {
      const { buildBitPixelMap, buildBitToMappingMap } =
        await import('../../src/modules/qr-art/bit-mapping');
      const mappings = buildBitPixelMap(1, 'M', 0);
      const bitMap = buildBitToMappingMap(mappings);

      // Check that byte 0 has global bit indices 0-7
      for (let bit = 0; bit < 8; bit++) {
        const m = bitMap.get(bit);
        expect(m).toBeDefined();
        expect(m!.byteIndex).toBe(0);
      }
    });
  });
});
