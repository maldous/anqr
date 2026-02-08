import { describe, expect, it, vi } from 'vitest';

import type { BitPixelMapping } from '../../src/modules/qr-art/bit-mapping';
import {
  applyAllSelectedVectors,
  applySelectedVectorsToBlock,
  countMatchingPixels,
  gaussJordanEliminate,
  rankPixelsByImportance,
  selectBasisVectorsForTarget,
  type EliminationResult,
} from '../../src/modules/qr-art/elimination';
import {
  analyzeUrlEfficiency,
  buildRSBasis,
  canUseFragmentSearch,
  gaussJordanEliminate as gaussJordanEliminatePlaceholder,
  generateQArt,
  generateQArtUrl,
  getBaseUrl,
  getModuleCount,
  gfAdd,
  gfInv,
  gfMul,
  isAlignmentPattern,
  isFinderPattern,
  isTimingPattern,
  mapImageToTargets,
  searchBestFragment,
  evaluateQRMatch,
} from '../../src/modules/qr-art/index';
import type { RSBasisVector } from '../../src/modules/qr-art/rs-basis';
import {
  applySubsetAndRegenerate,
  binarySearchMaxVectors,
  flattenAndOrderSelections,
  flattenAndOrderSelectionsLimited,
  unflattenSelections,
} from '../../src/modules/qr-art/scan-fallback';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

class MockImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string;
  constructor(data: Uint8ClampedArray, width: number, height: number) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.colorSpace = 'srgb';
  }
}

if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as unknown as { ImageData: typeof MockImageData }).ImageData = MockImageData;
}

function makeVector(
  rsBlockIndex: number,
  blockBits: number[],
  pivotPixel: number = -1
): RSBasisVector {
  return {
    dataBitIndex: 0,
    rsBlockIndex,
    posInBlock: 0,
    bitInByte: 7,
    blockBits: new Uint8Array(blockBits),
    affectedPixels: [],
    pivotPixel,
  };
}

describe('qr-art regression coverage', () => {
  describe('index.ts helpers', () => {
    it('covers GF ops and geometry helpers', () => {
      expect(gfMul(2, 3)).toBeGreaterThan(0);
      expect(gfMul(0, 9)).toBe(0);
      expect(gfAdd(0b1010, 0b0110)).toBe(0b1100);
      expect(() => gfInv(0)).toThrow('Cannot invert 0 in GF');
      expect(gfInv(2)).toBeGreaterThan(0);

      expect(getModuleCount(5)).toBe(37);
      expect(isFinderPattern(0, 0, 21)).toBe(true);
      expect(isFinderPattern(10, 10, 21)).toBe(false);
      expect(isTimingPattern(6, 2)).toBe(true);
      expect(isTimingPattern(4, 5)).toBe(false);
      expect(isAlignmentPattern(18, 18, [6, 18])).toBe(true);
      expect(isAlignmentPattern(3, 3, [6, 18])).toBe(false);
    });

    it('covers image mapping, URL generation and placeholder APIs', () => {
      const pixels = new Uint8ClampedArray([
        0, 0, 0, 255, 255, 255, 255, 255,
        120, 120, 120, 255, 200, 200, 200, 255,
      ]);
      const image = new ImageData(pixels, 2, 2);
      const mapped = mapImageToTargets(image, 2, 128);
      expect(mapped.targets[0][0]).toBe(true);
      expect(mapped.targets[0][1]).toBe(false);
      expect(mapped.importance[0][0]).toBeGreaterThan(0);

      const seededA = generateQArtUrl('https://example.com', 8, 123);
      const seededB = generateQArtUrl('https://example.com', 8, 123);
      expect(seededA).toBe(seededB);
      expect(seededA).toMatch(/^https:\/\/example\.com#\d{8}$/);

      const mixed = analyzeUrlEfficiency('https://example.com#123456');
      expect(mixed.savings).toBeGreaterThan(0);
      const plain = analyzeUrlEfficiency('https://example.com#abc');
      expect(plain.savings).toBe(0);

      expect(buildRSBasis(1, 'L')).toEqual([]);
      expect(gaussJordanEliminatePlaceholder([], [])).toEqual([]);
      expect(generateQArt({} as never).success).toBe(false);

      expect(canUseFragmentSearch('https://example.com/a')).toBe(true);
      expect(canUseFragmentSearch('mailto:test@example.com')).toBe(false);
      expect(canUseFragmentSearch('https://%zz')).toBe(false);
      expect(getBaseUrl('https://example.com#123')).toBe('https://example.com');
    });

    it('evaluates QR matching and runs fragment search batches', async () => {
      const moduleCount = 21;
      const targets = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(false));
      const importance = Array.from({ length: moduleCount }, () => Array(moduleCount).fill(0.5));
      const matched = evaluateQRMatch(
        (row, col) => (row + col) % 2 === 0,
        moduleCount,
        1,
        targets,
        importance
      );
      expect(matched.totalControllable).toBeGreaterThan(0);
      expect(matched.score).toBeGreaterThanOrEqual(0);

      vi.resetModules();
      const qrcode = vi.fn(() => {
        let current = '';
        return {
          addData: (data: string) => {
            current = data;
          },
          make: vi.fn(),
          getModuleCount: () => 21,
          isDark: (r: number, c: number) => {
            const d = Number(current[current.length - 1] || '0') % 2 === 0;
            return d ? (r + c) % 2 === 0 : (r + c) % 3 === 0;
          },
        };
      });
      vi.doMock('../../src/modules/qr-encoder', () => ({ qrcode }));
      const { searchBestFragment: runSearch } = await import('../../src/modules/qr-art/index');

      const image = new ImageData(new Uint8ClampedArray(21 * 21 * 4), 21, 21);
      const progress: number[] = [];
      const out = await runSearch({
        baseUrl: 'https://example.com',
        targetImage: image,
        iterations: 3,
        fragmentLength: 4,
        seed: 7,
        version: 1,
        ecc: 'L',
        maskPattern: 0,
        onProgress: (pct) => progress.push(pct),
      });
      expect(out.url.startsWith('https://example.com#')).toBe(true);
      expect(out.fragment).toHaveLength(4);
      expect(progress.at(-1)).toBe(100);
      expect(qrcode).toHaveBeenCalled();
    });
  });

  describe('elimination.ts helpers', () => {
    it('ranks pixels and performs per-block elimination', () => {
      const moduleCount = 2;
      const dataPixels = new Set([0, 1, 2, 3]);
      const order = rankPixelsByImportance(
        [
          [false, false],
          [false, false],
        ],
        [
          [0.1, 0.9],
          [0.3, 0.2],
        ],
        moduleCount,
        dataPixels
      );
      expect(order).toEqual([1, 2, 3, 0]);

      const mappings: BitPixelMapping[] = [
        {
          globalBitIndex: 0,
          byteIndex: 0,
          bitInByte: 7,
          row: 0,
          col: 0,
          isData: true,
          rsBlockIndex: 0,
          posInBlock: 0,
          pixelIndex: 0,
        },
        {
          globalBitIndex: 1,
          byteIndex: 0,
          bitInByte: 6,
          row: 0,
          col: 1,
          isData: true,
          rsBlockIndex: 0,
          posInBlock: 0,
          pixelIndex: 1,
        },
      ];
      const vectors = [makeVector(0, [0b10000000]), makeVector(0, [0b11000000])];
      const eliminated = gaussJordanEliminate(vectors, mappings, 2, 0, [1, 0]);
      expect(eliminated.blockResults).toHaveLength(1);
      expect(eliminated.controllablePixels).toBeGreaterThan(0);
      expect(eliminated.blockResults[0].vectors[0].nonZeroByteIndices).toBeDefined();
    });

    it('selects and applies vectors including sparse + dense paths', () => {
      const eliminationResult: EliminationResult = {
        blockResults: [
          {
            blockIndex: 0,
            vectors: [makeVector(0, [0b10000000], 0), makeVector(0, [0b01000000], 3)],
            pixelToVectorIndex: new Map([
              [0, 0],
              [3, 1],
            ]),
            controllablePixels: 2,
            controlledPixels: [0, 3],
          },
        ],
        vectors: [],
        pixelToVector: new Map(),
        controllablePixels: 2,
        controlledPixels: [0, 3],
      };

      const targets = [
        [true, false],
        [false, true],
      ];
      const base = [
        [false, false],
        [false, false],
      ];

      const selected = selectBasisVectorsForTarget(eliminationResult, targets, base, 2);
      expect(selected[0].selectedVectorIndices).toEqual([0, 1]);

      const selectedViaDiff = selectBasisVectorsForTarget(
        eliminationResult,
        targets,
        base,
        2,
        new Uint8Array([1, 0, 0, 1])
      );
      expect(selectedViaDiff[0].selectedVectorIndices).toEqual([0, 1]);

      const data = new Uint8Array([0xff, 0x00]);
      const ecc = new Uint8Array([0xf0]);
      const sparse = makeVector(0, [0, 0, 0], 0);
      sparse.nonZeroByteIndices = new Uint16Array([0, 2]);
      sparse.nonZeroByteValues = new Uint8Array([0x0f, 0x0a]);
      const dense = makeVector(0, [0x01, 0x02, 0x04], 1);
      applySelectedVectorsToBlock(data, ecc, [sparse, dense], [0, 1], 2);
      expect(data[0]).toBe(0xf1);
      expect(data[1]).toBe(0x02);
      expect(ecc[0]).toBe(0xfe);

      const allData = [new Uint8Array([0x00])];
      const allEcc = [new Uint8Array([0x00])];
      const allResult: EliminationResult = {
        ...eliminationResult,
        blockResults: [
          {
            blockIndex: 0,
            vectors: [makeVector(0, [0x80, 0x40], 0)],
            pixelToVectorIndex: new Map([[0, 0]]),
            controllablePixels: 1,
            controlledPixels: [0],
          },
        ],
      };
      applyAllSelectedVectors(
        allData,
        allEcc,
        allResult,
        [
          { blockIndex: 0, selectedVectorIndices: [0] },
          { blockIndex: 1, selectedVectorIndices: [0] },
        ],
        [1]
      );
      expect(allData[0][0]).toBe(0x80);
      expect(allEcc[0][0]).toBe(0x40);
    });

    it('counts matching pixels after vector flips', () => {
      const eliminationResult: EliminationResult = {
        blockResults: [
          {
            blockIndex: 0,
            vectors: [makeVector(0, [0b10000000], 0)],
            pixelToVectorIndex: new Map([[0, 0]]),
            controllablePixels: 1,
            controlledPixels: [0],
          },
        ],
        vectors: [],
        pixelToVector: new Map(),
        controllablePixels: 1,
        controlledPixels: [0],
      };
      const mappings: BitPixelMapping[] = [
        {
          globalBitIndex: 0,
          byteIndex: 0,
          bitInByte: 7,
          row: 0,
          col: 0,
          isData: true,
          rsBlockIndex: 0,
          posInBlock: 0,
          pixelIndex: 0,
        },
      ];
      const out = countMatchingPixels(
        [[false]],
        eliminationResult,
        [{ blockIndex: 0, selectedVectorIndices: [0] }],
        [[true]],
        1,
        new Set([0]),
        mappings
      );
      expect(out).toEqual({ matching: 1, total: 1 });
    });
  });

  describe('scan-fallback.ts helpers', () => {
    const eliminationResult: EliminationResult = {
      blockResults: [
        {
          blockIndex: 0,
          vectors: [makeVector(0, [0x80], 3)],
          pixelToVectorIndex: new Map([[3, 0]]),
          controllablePixels: 1,
          controlledPixels: [3],
        },
      ],
      vectors: [],
      pixelToVector: new Map(),
      controllablePixels: 1,
      controlledPixels: [3],
    };

    it('flattens, limits and unflattens selections', () => {
      const blockSelections = [{ blockIndex: 0, selectedVectorIndices: [0, 99] }];
      const importance = [
        [0, 0],
        [0, 0.9],
      ];
      const flattened = flattenAndOrderSelections(blockSelections, eliminationResult, importance, 2);
      expect(flattened).toHaveLength(1);
      expect(flattened[0].importance).toBe(0.9);

      const passthrough = flattenAndOrderSelectionsLimited(
        blockSelections,
        eliminationResult,
        importance,
        2,
        0
      );
      expect(passthrough).toHaveLength(1);

      const limited = flattenAndOrderSelectionsLimited(
        [
          { blockIndex: 0, selectedVectorIndices: [0] },
          { blockIndex: 1, selectedVectorIndices: [0] },
        ],
        {
          ...eliminationResult,
          blockResults: [
            ...eliminationResult.blockResults,
            {
              blockIndex: 1,
              vectors: [makeVector(1, [0x80], 0)],
              pixelToVectorIndex: new Map([[0, 0]]),
              controllablePixels: 1,
              controlledPixels: [0],
            },
          ],
        },
        [
          [0.1, 0.2],
          [0.3, 0.4],
        ],
        2,
        1
      );
      expect(limited).toHaveLength(1);
      expect(limited[0].importance).toBe(0.4);

      const unflattened = unflattenSelections(
        [
          { blockIndex: 1, vectorIndex: 2, importance: 1, vector: makeVector(1, [1], 0) },
          { blockIndex: 0, vectorIndex: 0, importance: 0.5, vector: makeVector(0, [1], 0) },
        ],
        2
      );
      expect(unflattened.map((s) => s.blockIndex)).toEqual([0, 1]);
    });

    it('applies subset/regenerate and handles binary-search edge paths', () => {
      const regen = vi.fn(() => [[true]]);
      const subset = applySubsetAndRegenerate(
        [{ blockIndex: 0, vectorIndex: 0, importance: 0.8, vector: makeVector(0, [0x80], 0) }],
        1,
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        {
          ...eliminationResult,
          blockResults: [
            {
              blockIndex: 0,
              vectors: [makeVector(0, [0x80, 0x40], 0)],
              pixelToVectorIndex: new Map([[0, 0]]),
              controllablePixels: 1,
              controlledPixels: [0],
            },
          ],
        },
        regen
      );
      expect(subset.matrix).toEqual([[true]]);
      expect(subset.modifiedBlockData[0][0]).toBe(0x80);
      expect(subset.modifiedBlockEcc[0][0]).toBe(0x40);

      const zeroVectors = binarySearchMaxVectors(
        [],
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        { ...eliminationResult, blockResults: [] },
        () => [[false]],
        () => ({ success: true, data: 'abc' }),
        'abc'
      );
      expect(zeroVectors.maxCount).toBe(0);
      expect(zeroVectors.iterations).toBe(0);

      const baseScanFail = binarySearchMaxVectors(
        [{ blockIndex: 0, vectorIndex: 0, importance: 1, vector: makeVector(0, [0x80], 0) }],
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        eliminationResult,
        () => [[false]],
        () => ({ success: false }),
        'abc'
      );
      expect(baseScanFail.maxCount).toBe(0);
      expect(baseScanFail.iterations).toBe(1);
    });

    it('runs binary search valid path, strict suffix rejection, and format verification path', () => {
      const flattened = [{ blockIndex: 0, vectorIndex: 0, importance: 1, vector: makeVector(0, [0x80], 0) }];
      const fullResult: EliminationResult = {
        ...eliminationResult,
        blockResults: [
          {
            blockIndex: 0,
            vectors: [makeVector(0, [0x80, 0x40], 0)],
            pixelToVectorIndex: new Map([[0, 0]]),
            controllablePixels: 1,
            controlledPixels: [0],
          },
        ],
      };
      const regen = (blockData: Uint8Array[]) => [[(blockData[0][0] & 0x80) !== 0]];
      const scan = (matrix: boolean[][]) =>
        matrix[0][0] ? { success: true, data: 'abcZ' } : { success: true, data: 'abc' };

      const ok = binarySearchMaxVectors(
        flattened,
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        fullResult,
        regen as never,
        scan,
        'abc'
      );
      expect(ok.maxCount).toBe(1);
      expect(ok.iterations).toBeGreaterThan(0);

      const strictReject = binarySearchMaxVectors(
        flattened,
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        fullResult,
        regen as never,
        () => ({ success: true, data: 'abc\u0001' }),
        'abc',
        undefined,
        undefined,
        true
      );
      expect(strictReject.maxCount).toBe(0);

      const withFormat = binarySearchMaxVectors(
        flattened,
        [new Uint8Array([0x00])],
        [new Uint8Array([0x00])],
        [1],
        [1],
        fullResult,
        regen as never,
        () => ({ success: true, data: 'abc' }),
        'abc',
        'M',
        0
      );
      expect(withFormat.maxCount).toBeGreaterThanOrEqual(0);
    });
  });
});
