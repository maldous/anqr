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

describe('qr-art/semantic-layout.ts', () => {
  describe('getSemanticBitLayout', () => {
    it('v1-M with minimal data (1 char) → max padding', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      const layout = getSemanticBitLayout(1, 'M', 1);

      expect(layout.version).toBe(1);
      expect(layout.ecc).toBe('M');
      expect(layout.dataLength).toBe(1);
      expect(layout.totalDataBytes).toBe(16);
      expect(layout.totalDataBits).toBe(128);

      // Mode indicator: always 4 bits starting at 0
      expect(layout.modeIndicator.startBit).toBe(0);
      expect(layout.modeIndicator.endBit).toBe(4);

      // Character count: 8 bits for v1 byte mode
      expect(layout.characterCount.startBit).toBe(4);
      expect(layout.characterCount.endBit).toBe(12);

      // Data content: 1 char × 8 bits = 8 bits
      expect(layout.dataContent.startBit).toBe(12);
      expect(layout.dataContent.endBit).toBe(20);

      // Terminator: 4 bits
      expect(layout.terminator.startBit).toBe(20);
      expect(layout.terminator.endBit).toBe(24);

      // Pad-to-byte: 0 bits (24 is byte-aligned)
      expect(layout.padToByte.startBit).toBe(24);
      expect(layout.padToByte.endBit).toBe(24);

      // Pad codewords: remaining = 128 - 24 = 104 bits = 13 bytes
      expect(layout.padCodewords.startBit).toBe(24);
      expect(layout.padCodewords.endBit).toBe(128);
      expect(layout.padCodewords.byteCount).toBe(13);
    });

    it('v1-M with data that exactly fills capacity (14 chars) → 0 padding', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      // v1-M has 16 data bytes = 128 bits
      // mode(4) + charCount(8) + data(14*8=112) + terminator(min(4, 128-124)=4) = 128
      const layout = getSemanticBitLayout(1, 'M', 14);

      expect(layout.dataContent.endBit).toBe(12 + 14 * 8); // 124
      expect(layout.terminator.startBit).toBe(124);
      expect(layout.terminator.endBit).toBe(128); // 4 bits of terminator
      expect(layout.padToByte.startBit).toBe(128);
      expect(layout.padToByte.endBit).toBe(128);
      expect(layout.padCodewords.byteCount).toBe(0);
      expect(layout.padCodewords.startBit).toBe(128);
      expect(layout.padCodewords.endBit).toBe(128);
    });

    it('bit ranges are contiguous and non-overlapping', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      const layout = getSemanticBitLayout(3, 'L', 10);

      const ranges = [
        layout.modeIndicator,
        layout.characterCount,
        layout.dataContent,
        layout.terminator,
        layout.padToByte,
        layout.padCodewords,
      ];

      // Each range ends where the next begins
      for (let i = 0; i < ranges.length - 1; i++) {
        expect(ranges[i].endBit).toBe(ranges[i + 1].startBit);
      }

      // First starts at 0
      expect(ranges[0].startBit).toBe(0);

      // Last ends at totalDataBits
      expect(ranges[ranges.length - 1].endBit).toBe(layout.totalDataBits);
    });

    it('all range widths are non-negative', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');

      for (const version of [1, 5, 10, 20, 40]) {
        for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
          const layout = getSemanticBitLayout(version, ecc, 3);
          expect(layout.modeIndicator.endBit - layout.modeIndicator.startBit).toBe(4);
          expect(
            layout.characterCount.endBit - layout.characterCount.startBit
          ).toBeGreaterThanOrEqual(8);
          expect(
            layout.dataContent.endBit - layout.dataContent.startBit
          ).toBe(3 * 8);
          expect(
            layout.terminator.endBit - layout.terminator.startBit
          ).toBeGreaterThanOrEqual(0);
          expect(
            layout.padToByte.endBit - layout.padToByte.startBit
          ).toBeGreaterThanOrEqual(0);
          expect(
            layout.padCodewords.endBit - layout.padCodewords.startBit
          ).toBeGreaterThanOrEqual(0);
        }
      }
    });

    it('v10 byte mode uses 16-bit character count', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      const layout = getSemanticBitLayout(10, 'M', 5);

      expect(layout.characterCount.startBit).toBe(4);
      expect(layout.characterCount.endBit).toBe(20); // 4 + 16 = 20
    });

    it('padCodewords byteCount is consistent with bit range', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');

      for (const version of [1, 2, 5, 10]) {
        for (const ecc of ['L', 'M', 'Q', 'H'] as const) {
          const layout = getSemanticBitLayout(version, ecc, 3);
          const rangeBits = layout.padCodewords.endBit - layout.padCodewords.startBit;
          expect(layout.padCodewords.byteCount).toBe(rangeBits / 8);
        }
      }
    });

    it('data that needs pad-to-byte alignment', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      // v1-L has 19 data bytes = 152 bits
      // mode(4) + charCount(8) + data(17*8=136) = 148
      // terminator: min(4, 152-148)=4 → currentBit=152
      // Actually 148+4=152, that's byte aligned. Let me find a case that's NOT.
      //
      // v1-L, dataLength=16: mode(4) + charCount(8) + data(128) = 140
      // terminator: min(4, 12)=4 → 144
      // padToByte: (8 - 144%8)%8 = 0 → still aligned
      //
      // We need a total that's not byte-aligned before padToByte.
      // terminator can be < 4 bits only when there's very little room.
      // Let's use v1-L dataLength=18: mode(4)+charCount(8)+data(144)=156 > 152 won't fit
      // v1-L dataLength=17: mode(4)+charCount(8)+data(136)=148, term=min(4,4)=4 → 152 aligned
      //
      // The issue is terminator is always up to 4 bits, and we're always at byte boundary after
      // 4+8+n*8 = 12+n*8 which is 4 mod 8 for n=0, 4 mod 8 for n=1 etc.
      // After terminator: 12+n*8+4 = 16+n*8 = byte aligned!
      // So padToByte is always 0 for byte mode.
      //
      // This means padToByte range is always empty for byte mode. Let's verify that.
      const layout = getSemanticBitLayout(1, 'L', 5);
      const padBits = layout.padToByte.endBit - layout.padToByte.startBit;
      expect(padBits).toBe(0); // Byte mode always byte-aligns after terminator
    });

    it('zero-length data still has mode indicator and character count', async () => {
      const { getSemanticBitLayout } = await import('../../src/modules/qr-art/semantic-layout');
      const layout = getSemanticBitLayout(1, 'M', 0);

      expect(layout.modeIndicator.endBit - layout.modeIndicator.startBit).toBe(4);
      expect(layout.characterCount.endBit - layout.characterCount.startBit).toBe(8);
      expect(layout.dataContent.endBit - layout.dataContent.startBit).toBe(0);
      expect(layout.terminator.endBit - layout.terminator.startBit).toBe(4);
      // Total content = 16 bits = 2 bytes, rest is padding
      expect(layout.padCodewords.byteCount).toBe(14); // 16 - 2 = 14
    });
  });

  describe('calculateVersionForSlack', () => {
    it('finds smallest version with enough padding', async () => {
      const { calculateVersionForSlack } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const version = calculateVersionForSlack(5, 'M', 20);
      expect(version).toBeGreaterThanOrEqual(1);
      expect(version).toBeLessThanOrEqual(40);
    });

    it('higher minPadCodewords → larger version', async () => {
      const { calculateVersionForSlack } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const small = calculateVersionForSlack(5, 'M', 5);
      const large = calculateVersionForSlack(5, 'M', 50);
      expect(large).toBeGreaterThanOrEqual(small);
    });

    it('returns 40 when no version has enough slack', async () => {
      const { calculateVersionForSlack } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      // Very long data with enormous padding requirement
      const version = calculateVersionForSlack(2900, 'H', 999999);
      expect(version).toBe(40);
    });

    it('short data with default minPadCodewords returns small version', async () => {
      const { calculateVersionForSlack } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const version = calculateVersionForSlack(3, 'L');
      expect(version).toBeLessThanOrEqual(5);
    });

    it('higher ECC level needs larger version for same slack', async () => {
      const { calculateVersionForSlack } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const vL = calculateVersionForSlack(20, 'L', 30);
      const vH = calculateVersionForSlack(20, 'H', 30);
      expect(vH).toBeGreaterThanOrEqual(vL);
    });
  });

  describe('mapAllowedRangesToBlocks', () => {
    it('single block: maps linear ranges directly', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      // v1-M has 1 block of 16 data bytes
      const result = mapAllowedRangesToBlocks(
        [{ startBit: 0, endBit: 128 }],
        1,
        'M'
      );
      expect(result.size).toBe(1);
      expect(result.get(0)!.size).toBe(128); // all 128 bits allowed
    });

    it('single block with partial range', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      // v1-M: allow bits 64-128 (last 8 bytes)
      const result = mapAllowedRangesToBlocks(
        [{ startBit: 64, endBit: 128 }],
        1,
        'M'
      );
      expect(result.get(0)!.size).toBe(64);
    });

    it('empty range produces empty allowed sets', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const result = mapAllowedRangesToBlocks([], 1, 'M');
      expect(result.size).toBe(1);
      expect(result.get(0)!.size).toBe(0);
    });

    it('range beyond total buffer is clipped', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      // v1-M has 128 total data bits; range goes to 256
      const result = mapAllowedRangesToBlocks(
        [{ startBit: 0, endBit: 256 }],
        1,
        'M'
      );
      // Should only map 128 bits (clipped at total buffer)
      expect(result.get(0)!.size).toBe(128);
    });

    it('multi-block: ranges distributed correctly across blocks', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      // v5-Q has multiple blocks; use it to test multi-block distribution
      // Don't hardcode block structure; just verify total bits match range
      const range = { startBit: 0, endBit: 80 }; // first 80 bits = 10 bytes
      const result = mapAllowedRangesToBlocks([range], 5, 'Q');

      let totalAllowed = 0;
      for (const [, allowed] of result) {
        totalAllowed += allowed.size;
      }
      expect(totalAllowed).toBe(80);
    });

    it('multiple non-overlapping ranges', async () => {
      const { mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const ranges = [
        { startBit: 0, endBit: 16 },   // first 2 bytes
        { startBit: 64, endBit: 80 },  // bytes 8-9
      ];
      const result = mapAllowedRangesToBlocks(ranges, 1, 'M');

      // Total allowed should be 16 + 16 = 32 bits
      expect(result.get(0)!.size).toBe(32);
    });
  });

  describe('isBitAllowed', () => {
    it('returns true for allowed bits', async () => {
      const { isBitAllowed } = await import('../../src/modules/qr-art/semantic-layout');
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2, 10, 20]));
      blockMap.set(1, new Set([5, 15]));

      expect(isBitAllowed(blockMap, 0, 0)).toBe(true);
      expect(isBitAllowed(blockMap, 0, 10)).toBe(true);
      expect(isBitAllowed(blockMap, 1, 5)).toBe(true);
    });

    it('returns false for non-allowed bits', async () => {
      const { isBitAllowed } = await import('../../src/modules/qr-art/semantic-layout');
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2]));

      expect(isBitAllowed(blockMap, 0, 3)).toBe(false);
      expect(isBitAllowed(blockMap, 0, 100)).toBe(false);
    });

    it('returns false for unknown block index', async () => {
      const { isBitAllowed } = await import('../../src/modules/qr-art/semantic-layout');
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2]));

      expect(isBitAllowed(blockMap, 5, 0)).toBe(false);
    });

    it('returns false for empty map', async () => {
      const { isBitAllowed } = await import('../../src/modules/qr-art/semantic-layout');
      const blockMap = new Map<number, Set<number>>();

      expect(isBitAllowed(blockMap, 0, 0)).toBe(false);
    });
  });

  describe('validateVectorSelection', () => {
    it('valid selection with all bits allowed → valid: true', async () => {
      const { validateVectorSelection } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2, 3, 4, 5, 6, 7]));

      const result = validateVectorSelection(
        [{ blockIndex: 0, affectedLocalBits: [0, 1, 2] }],
        blockMap
      );
      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('selection with violations → valid: false', async () => {
      const { validateVectorSelection } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2]));

      const result = validateVectorSelection(
        [{ blockIndex: 0, affectedLocalBits: [0, 5, 10] }],
        blockMap
      );
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBe(2); // bits 5 and 10 not allowed
      expect(result.violations).toContainEqual({ blockIndex: 0, bit: 5 });
      expect(result.violations).toContainEqual({ blockIndex: 0, bit: 10 });
    });

    it('selection referencing unknown block → all bits are violations', async () => {
      const { validateVectorSelection } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1]));

      const result = validateVectorSelection(
        [{ blockIndex: 5, affectedLocalBits: [0, 1] }],
        blockMap
      );
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBe(2);
    });

    it('empty selection → valid: true', async () => {
      const { validateVectorSelection } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const blockMap = new Map<number, Set<number>>();

      const result = validateVectorSelection([], blockMap);
      expect(result.valid).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('multiple vectors with mixed validity', async () => {
      const { validateVectorSelection } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const blockMap = new Map<number, Set<number>>();
      blockMap.set(0, new Set([0, 1, 2, 3]));
      blockMap.set(1, new Set([10, 11]));

      const result = validateVectorSelection(
        [
          { blockIndex: 0, affectedLocalBits: [0, 1] },    // valid
          { blockIndex: 0, affectedLocalBits: [2, 99] },   // 99 is invalid
          { blockIndex: 1, affectedLocalBits: [10, 20] },  // 20 is invalid
        ],
        blockMap
      );
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBe(2);
    });
  });

  describe('integration: getSemanticBitLayout + mapAllowedRangesToBlocks', () => {
    it('padding codewords range maps correctly to block allowed bits', async () => {
      const { getSemanticBitLayout, mapAllowedRangesToBlocks } = await import(
        '../../src/modules/qr-art/semantic-layout'
      );
      const layout = getSemanticBitLayout(3, 'M', 10);

      // Use padding codewords as the allowed range (Strategy 2)
      const allowedRanges = [
        { startBit: layout.padCodewords.startBit, endBit: layout.padCodewords.endBit },
      ];
      const result = mapAllowedRangesToBlocks(allowedRanges, 3, 'M');

      let totalAllowed = 0;
      for (const [, allowed] of result) {
        totalAllowed += allowed.size;
      }

      // Total allowed bits should equal padding bits
      const paddingBits = layout.padCodewords.endBit - layout.padCodewords.startBit;
      expect(totalAllowed).toBe(paddingBits);
    });
  });
});
