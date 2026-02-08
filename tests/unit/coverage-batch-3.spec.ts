/**
 * Coverage Batch 3 — tests targeting low-coverage qr-decoder source files.
 *
 * Environment: happy-dom (provides document, Image, canvas, etc.)
 *
 * Strategy: We split into sub-describe blocks. For modules that we test directly
 * (extract, reader, image-utils, bit-matrix, exceptions, qr-data-decoder),
 * we import them directly since they are NOT mocked. For decode-qr.ts we mock
 * its heavy dependencies (locate, format, decode, rs-decoder, etc.).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// Module-level mocks (hoisted by vitest)
// ============================================================================

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
  enableLogBuffer: vi.fn(),
  disableLogBuffer: vi.fn(),
  flushLogBuffer: vi.fn(() => ''),
}));

// --- decode-qr.ts dependency mocks (at module level) ---
const mockFindFinderPatterns = vi.fn();
const mockSelectFinderPatterns = vi.fn();
vi.mock('../../src/modules/qr-decoder/locate', () => ({
  findFinderPatterns: (...args: unknown[]) => mockFindFinderPatterns(...args),
  selectFinderPatterns: (...args: unknown[]) => mockSelectFinderPatterns(...args),
}));

const mockCalculateLocation = vi.fn();
const mockExtractModuleMatrix = vi.fn();
vi.mock('../../src/modules/qr-decoder/extract', () => ({
  calculateLocation: (...args: unknown[]) => mockCalculateLocation(...args),
  extractModuleMatrix: (...args: unknown[]) => mockExtractModuleMatrix(...args),
  getModuleCountFromVersion: (v: number) => v * 4 + 17,
  getVersionFromModuleCount: (mc: number) => (mc - 17) / 4,
}));

const mockReadFormatInfo = vi.fn();
const mockUnmaskMatrix = vi.fn();
const mockGetECCLevelChar = vi.fn();
vi.mock('../../src/modules/qr-decoder/format', () => ({
  readFormatInfo: (...args: unknown[]) => mockReadFormatInfo(...args),
  unmaskMatrix: (...args: unknown[]) => mockUnmaskMatrix(...args),
  getECCLevelChar: (...args: unknown[]) => mockGetECCLevelChar(...args),
}));

const mockReadCodewords = vi.fn();
const mockDecodeDataCodewordsDetailed = vi.fn();
vi.mock('../../src/modules/qr-decoder/decode', () => ({
  readCodewords: (...args: unknown[]) => mockReadCodewords(...args),
  decodeDataCodewordsDetailed: (...args: unknown[]) => mockDecodeDataCodewordsDetailed(...args),
  RS_BLOCKS: {
    L: [[[1, 26, 19]]],
    M: [[[1, 26, 16]]],
    Q: [[[1, 26, 13]]],
    H: [[[1, 26, 9]]],
  },
}));

const mockCorrectRSCodewords = vi.fn();
vi.mock('../../src/modules/qr-decoder/rs-decoder', () => ({
  correctRSCodewords: (...args: unknown[]) => mockCorrectRSCodewords(...args),
}));

const mockRsRootabilityFor = vi.fn();
vi.mock('../../src/modules/qr-decoder/rs-rootability', () => ({
  rsRootabilityFor: (...args: unknown[]) => mockRsRootabilityFor(...args),
}));

vi.mock('../../src/modules/qr-spec', () => ({
  getAlignmentPatternCenters: () => [],
  getModuleCountForVersion: (v: number) => v * 4 + 17,
  getVersionFromModuleCount: (mc: number) => (mc - 17) / 4,
}));

// ============================================================================
// ImageData polyfill for happy-dom
// ============================================================================

if (typeof globalThis.ImageData === 'undefined') {
  (globalThis as Record<string, unknown>).ImageData = class MockImageData {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    colorSpace = 'srgb';
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
    }
  };
}

// ============================================================================
// Reset mocks between tests
// ============================================================================

beforeEach(() => {
  vi.clearAllMocks();
});

// ############################################################################
// 1) extract.ts — calculateLocation & extractModuleMatrix
//    These are tested via importActual since extract is mocked for decode-qr
// ############################################################################

describe('extract.ts — calculateLocation', () => {
  it('returns correct v1 QR (21 modules)', async () => {
    const { calculateLocation } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/extract')
    >('../../src/modules/qr-decoder/extract');

    const topLeft = { center: { x: 35, y: 35 }, moduleSize: 10, count: 1 };
    const topRight = { center: { x: 175, y: 35 }, moduleSize: 10, count: 1 };
    const bottomLeft = { center: { x: 35, y: 175 }, moduleSize: 10, count: 1 };

    const location = calculateLocation(topLeft, topRight, bottomLeft);

    expect(location.moduleCount).toBe(21);
    expect(location.moduleSize).toBe(10);
    expect(location.topLeft).toEqual({ x: 35, y: 35 });
    expect(location.topRight).toEqual({ x: 175, y: 35 });
    expect(location.bottomLeft).toEqual({ x: 35, y: 175 });
    expect(location.bottomRight.x).toBeCloseTo(175);
    expect(location.bottomRight.y).toBeCloseTo(175);
  });

  it('returns correct v2 QR (25 modules)', async () => {
    const { calculateLocation } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/extract')
    >('../../src/modules/qr-decoder/extract');

    // v2: distance = (25-7)*10 = 180
    const topLeft = { center: { x: 35, y: 35 }, moduleSize: 10, count: 1 };
    const topRight = { center: { x: 215, y: 35 }, moduleSize: 10, count: 1 };
    const bottomLeft = { center: { x: 35, y: 215 }, moduleSize: 10, count: 1 };

    const location = calculateLocation(topLeft, topRight, bottomLeft);
    expect(location.moduleCount).toBe(25);
  });

  it('clamps to valid version range (min version 1)', async () => {
    const { calculateLocation } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/extract')
    >('../../src/modules/qr-decoder/extract');

    // Very small distance → version < 1 → should clamp to 21
    const topLeft = { center: { x: 10, y: 10 }, moduleSize: 10, count: 1 };
    const topRight = { center: { x: 20, y: 10 }, moduleSize: 10, count: 1 };
    const bottomLeft = { center: { x: 10, y: 20 }, moduleSize: 10, count: 1 };

    const location = calculateLocation(topLeft, topRight, bottomLeft);
    expect(location.moduleCount).toBeGreaterThanOrEqual(21);
  });
});

describe('extract.ts — extractModuleMatrix', () => {
  it('returns boolean[][] with correct dimensions', async () => {
    const { extractModuleMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/extract')
    >('../../src/modules/qr-decoder/extract');

    const size = 210;
    const data = new Uint8ClampedArray(size * size * 4);
    // Fill white
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
    }
    // Dark block (top-left 70x70)
    for (let y = 0; y < 70; y++) {
      for (let x = 0; x < 70; x++) {
        const idx = (y * size + x) * 4;
        data[idx] = 0; data[idx + 1] = 0; data[idx + 2] = 0;
      }
    }

    const imageData = new ImageData(data, size, size);
    const location = {
      topLeft: { x: 35, y: 35 }, topRight: { x: 175, y: 35 },
      bottomLeft: { x: 35, y: 175 }, bottomRight: { x: 175, y: 175 },
      moduleSize: 10, moduleCount: 21,
    };

    const matrix = extractModuleMatrix(imageData, location, 128);
    expect(matrix).toHaveLength(21);
    expect(matrix[0]).toHaveLength(21);
    expect(matrix[0][0]).toBe(true);  // dark region
    expect(matrix[20][20]).toBe(false); // white region
  });

  it('handles transparent pixels as white', async () => {
    const { extractModuleMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/extract')
    >('../../src/modules/qr-decoder/extract');

    const size = 210;
    const data = new Uint8ClampedArray(size * size * 4); // all zeros (transparent)
    const imageData = new ImageData(data, size, size);
    const location = {
      topLeft: { x: 35, y: 35 }, topRight: { x: 175, y: 35 },
      bottomLeft: { x: 35, y: 175 }, bottomRight: { x: 175, y: 175 },
      moduleSize: 10, moduleCount: 21,
    };

    const matrix = extractModuleMatrix(imageData, location, 128);
    expect(matrix[0][0]).toBe(false);
    expect(matrix[10][10]).toBe(false);
  });
});

// ############################################################################
// 2) qr-data-decoder.ts — BitMatrixParser
// ############################################################################

describe('qr-data-decoder.ts — BitMatrixParser', () => {
  it('throws FormatException for dimension < 21', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');
    const { BitMatrixParser } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/qr-data-decoder')
    >('../../src/modules/qr-decoder/qr-data-decoder');

    const smallMatrix = new BitMatrix(20, 20);
    expect(() => new BitMatrixParser(smallMatrix)).toThrow();
  });

  it('throws FormatException for dimension with wrong mod 4 (22)', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');
    const { BitMatrixParser } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/qr-data-decoder')
    >('../../src/modules/qr-decoder/qr-data-decoder');

    const badMatrix = new BitMatrix(22, 22);
    expect(() => new BitMatrixParser(badMatrix)).toThrow();
  });

  it('throws FormatException for dimension 23', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');
    const { BitMatrixParser } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/qr-data-decoder')
    >('../../src/modules/qr-decoder/qr-data-decoder');

    const badMatrix = new BitMatrix(23, 23);
    expect(() => new BitMatrixParser(badMatrix)).toThrow();
  });

  it('does not throw for valid 21x21 BitMatrix', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');
    const { BitMatrixParser } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/qr-data-decoder')
    >('../../src/modules/qr-decoder/qr-data-decoder');

    const validMatrix = new BitMatrix(21, 21);
    expect(() => new BitMatrixParser(validMatrix)).not.toThrow();
  });

  it('does not throw for valid 25x25 BitMatrix', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');
    const { BitMatrixParser } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/qr-data-decoder')
    >('../../src/modules/qr-decoder/qr-data-decoder');

    const validMatrix = new BitMatrix(25, 25);
    expect(() => new BitMatrixParser(validMatrix)).not.toThrow();
  });
});

// ############################################################################
// 3) reader.ts — QRCodeDecoderMetaData & Reader.reset()
// ############################################################################

describe('reader.ts — QRCodeDecoderMetaData', () => {
  it('isMirrored returns true when constructed with true', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(true);
    expect(meta.isMirrored()).toBe(true);
  });

  it('isMirrored returns false when constructed with false', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(false);
    expect(meta.isMirrored()).toBe(false);
  });

  it('applyMirroredCorrection swaps points[0] and points[2] when mirrored', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(true);
    const a = { getX: () => 1, getY: () => 2 };
    const b = { getX: () => 3, getY: () => 4 };
    const c = { getX: () => 5, getY: () => 6 };
    const pts = [a, b, c] as any[];
    meta.applyMirroredCorrection(pts);
    expect(pts[0]).toBe(c);
    expect(pts[1]).toBe(b);
    expect(pts[2]).toBe(a);
  });

  it('applyMirroredCorrection does nothing when mirrored=false', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(false);
    const a = {}, b = {}, c = {};
    const pts = [a, b, c] as any[];
    meta.applyMirroredCorrection(pts);
    expect(pts[0]).toBe(a);
    expect(pts[2]).toBe(c);
  });

  it('applyMirroredCorrection does nothing when points.length < 3', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(true);
    const a = {}, b = {};
    const pts = [a, b] as any[];
    meta.applyMirroredCorrection(pts);
    expect(pts[0]).toBe(a);
    expect(pts[1]).toBe(b);
  });

  it('applyMirroredCorrection does nothing with empty array', async () => {
    const { QRCodeDecoderMetaData } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const meta = new QRCodeDecoderMetaData(true);
    const pts: any[] = [];
    meta.applyMirroredCorrection(pts);
    expect(pts).toHaveLength(0);
  });
});

describe('reader.ts — Reader.reset()', () => {
  it('reset does not throw', async () => {
    const { Reader } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/reader')
    >('../../src/modules/qr-decoder/reader');
    const reader = new Reader();
    expect(() => reader.reset()).not.toThrow();
  });
});

// ############################################################################
// 4) decode-qr.ts — decodeQR (all dependencies mocked)
// ############################################################################

describe('decode-qr.ts — decodeQR', () => {
  function makeImageData(w = 200, h = 200): ImageData {
    return new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
  }

  const pat = { center: { x: 50, y: 50 }, moduleSize: 10, count: 1 };

  function setupSuccess() {
    mockFindFinderPatterns.mockReturnValue({
      patterns: [pat, pat, pat], threshold: 128,
    });
    mockSelectFinderPatterns.mockReturnValue([pat, pat, pat]);
    mockCalculateLocation.mockReturnValue({
      moduleCount: 21, bottomRight: { x: 200, y: 200 }, moduleSize: 10,
    });
    mockExtractModuleMatrix.mockReturnValue(
      Array.from({ length: 21 }, () => Array(21).fill(false))
    );
    mockReadFormatInfo.mockReturnValue({ eccLevel: 1, maskPattern: 0 });
    mockGetECCLevelChar.mockReturnValue('L');
    mockUnmaskMatrix.mockReturnValue(
      Array.from({ length: 21 }, () => Array(21).fill(false))
    );
    mockReadCodewords.mockReturnValue(new Uint8Array(26));
    mockRsRootabilityFor.mockReturnValue([
      { blockIndex: 0, syndromeNonZeroCount: 0, bmDegree: 0, chienRootsFound: 0 },
    ]);
    mockCorrectRSCodewords.mockReturnValue({
      dataCodewords: new Uint8Array([64, 84, 134, 86, 198, 16, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236]),
      correctionsMade: 0,
    });
    mockDecodeDataCodewordsDetailed.mockReturnValue({
      text: 'HELLO', bytes: new Uint8Array([72, 69, 76, 76, 79]),
      encodingMode: 'alphanumeric', valid: true, structurallyValid: true,
      segmentCount: 1, segments: [{ modeName: 'alphanumeric', valid: true, charCount: 5 }],
    });
  }

  it('returns null when < 3 finder patterns', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [pat, pat], threshold: 128 });
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns null when selectFinderPatterns returns null', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [pat, pat, pat], threshold: 128 });
    mockSelectFinderPatterns.mockReturnValue(null);
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns null when readFormatInfo returns null', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [pat, pat, pat], threshold: 128 });
    mockSelectFinderPatterns.mockReturnValue([pat, pat, pat]);
    mockCalculateLocation.mockReturnValue({ moduleCount: 21, bottomRight: { x: 200, y: 200 }, moduleSize: 10 });
    mockExtractModuleMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadFormatInfo.mockReturnValue(null);
    mockGetECCLevelChar.mockReturnValue('L');
    mockUnmaskMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadCodewords.mockReturnValue(new Uint8Array(26));
    mockRsRootabilityFor.mockReturnValue([{ blockIndex: 0, syndromeNonZeroCount: 0, bmDegree: 0, chienRootsFound: 0 }]);
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns null when RS correction fails for all masks', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [pat, pat, pat], threshold: 128 });
    mockSelectFinderPatterns.mockReturnValue([pat, pat, pat]);
    mockCalculateLocation.mockReturnValue({ moduleCount: 21, bottomRight: { x: 200, y: 200 }, moduleSize: 10 });
    mockExtractModuleMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadFormatInfo.mockReturnValue({ eccLevel: 1, maskPattern: 0 });
    mockGetECCLevelChar.mockReturnValue('L');
    mockUnmaskMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadCodewords.mockReturnValue(new Uint8Array(26));
    mockRsRootabilityFor.mockReturnValue([{ blockIndex: 0, syndromeNonZeroCount: 2, bmDegree: 2, chienRootsFound: 0 }]);
    mockCorrectRSCodewords.mockReturnValue(null);
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns success on the happy path', async () => {
    setupSuccess();
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeImageData());
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
    expect(result!.data).toBe('HELLO');
    expect(result!.version).toBe(1);
    expect(result!.eccLevel).toBe('L');
  });

  it('inversionAttempts=dontInvert only tries normal', async () => {
    setupSuccess();
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeImageData(), { inversionAttempts: 'dontInvert' });
    expect(result).not.toBeNull();
    expect(result!.data).toBe('HELLO');
  });

  it('inversionAttempts=onlyInvert only tries inverted', async () => {
    setupSuccess();
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeImageData(), { inversionAttempts: 'onlyInvert' });
    expect(result).not.toBeNull();
    expect(result!.data).toBe('HELLO');
  });

  it('inversionAttempts=dontInvert returns null when normal fails', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [], threshold: 128 });
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData(), { inversionAttempts: 'dontInvert' })).toBeNull();
  });

  it('RS mask fallback — first mask fails, next succeeds', async () => {
    mockFindFinderPatterns.mockReturnValue({ patterns: [pat, pat, pat], threshold: 128 });
    mockSelectFinderPatterns.mockReturnValue([pat, pat, pat]);
    mockCalculateLocation.mockReturnValue({ moduleCount: 21, bottomRight: { x: 200, y: 200 }, moduleSize: 10 });
    mockExtractModuleMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadFormatInfo.mockReturnValue({ eccLevel: 1, maskPattern: 0 });
    mockGetECCLevelChar.mockReturnValue('L');
    mockUnmaskMatrix.mockReturnValue(Array.from({ length: 21 }, () => Array(21).fill(false)));
    mockReadCodewords.mockReturnValue(new Uint8Array(26));
    mockRsRootabilityFor.mockReturnValue([{ blockIndex: 0, syndromeNonZeroCount: 0, bmDegree: 0, chienRootsFound: 0 }]);

    let callCount = 0;
    mockCorrectRSCodewords.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return null;
      return {
        dataCodewords: new Uint8Array([64, 84, 134, 86, 198, 16, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236, 17, 236]),
        correctionsMade: 1,
      };
    });
    mockDecodeDataCodewordsDetailed.mockReturnValue({
      text: 'HELLO', bytes: new Uint8Array([72, 69, 76, 76, 79]),
      encodingMode: 'alphanumeric', valid: true, structurallyValid: true,
      segmentCount: 1, segments: [{ modeName: 'alphanumeric', valid: true, charCount: 5 }],
    });

    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    const result = decodeQR(makeImageData());
    expect(result).not.toBeNull();
    expect(result!.success).toBe(true);
  });

  it('returns null when decode reports invalid data', async () => {
    setupSuccess();
    mockDecodeDataCodewordsDetailed.mockReturnValue({
      text: '', bytes: new Uint8Array(0), encodingMode: 'byte',
      valid: false, structurallyValid: false, segmentCount: 0, segments: [],
    });
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns null when decoded text is empty string', async () => {
    setupSuccess();
    mockDecodeDataCodewordsDetailed.mockReturnValue({
      text: '', bytes: new Uint8Array(0), encodingMode: 'byte',
      valid: true, structurallyValid: true, segmentCount: 0, segments: [],
    });
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });

  it('returns null when an exception is thrown during decode', async () => {
    mockFindFinderPatterns.mockImplementation(() => { throw new Error('boom'); });
    const { decodeQR } = await import('../../src/modules/qr-decoder/decode-qr');
    expect(decodeQR(makeImageData())).toBeNull();
  });
});

// ############################################################################
// 5) image-utils.ts — mapImageToTargetsSupersampled
// ############################################################################

describe('qr-art/image-utils.ts — mapImageToTargetsSupersampled', () => {
  it('returns correct dimensions for ImageData input', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const size = 100;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128; data[i + 1] = 128; data[i + 2] = 128; data[i + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    const { targets, importance } = mapImageToTargetsSupersampled(imageData, 10);
    expect(targets).toHaveLength(10);
    expect(targets[0]).toHaveLength(10);
    expect(importance).toHaveLength(10);
    expect(importance[0]).toHaveLength(10);
  });

  it('all-black pixels produce all-dark targets', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const size = 50;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
    }
    const { targets } = mapImageToTargetsSupersampled(new ImageData(data, size, size), 5, 128);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        expect(targets[r][c]).toBe(true);
  });

  it('all-white pixels produce all-light targets', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const size = 50;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
    }
    const { targets } = mapImageToTargetsSupersampled(new ImageData(data, size, size), 5, 128);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        expect(targets[r][c]).toBe(false);
  });

  it('importance values are between 0 and 1', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const size = 50;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const v = (i / 4) % 256;
      data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255;
    }
    const { importance } = mapImageToTargetsSupersampled(new ImageData(data, size, size), 5);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        expect(importance[r][c]).toBeGreaterThanOrEqual(0);
        expect(importance[r][c]).toBeLessThanOrEqual(1);
      }
  });

  it('canvas with null context returns empty arrays', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const canvas = document.createElement('canvas');
    canvas.width = 50; canvas.height = 50;
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);

    const { targets, importance } = mapImageToTargetsSupersampled(canvas, 5);
    expect(targets).toHaveLength(5);
    expect(importance).toHaveLength(5);
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++) {
        expect(targets[r][c]).toBe(false);
        expect(importance[r][c]).toBe(0);
      }
  });

  it('uses default threshold of 128', async () => {
    const { mapImageToTargetsSupersampled } = await vi.importActual<
      typeof import('../../src/modules/qr-art/image-utils')
    >('../../src/modules/qr-art/image-utils');

    const size = 10;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 100; data[i + 1] = 100; data[i + 2] = 100; data[i + 3] = 255;
    }
    const { targets } = mapImageToTargetsSupersampled(new ImageData(data, size, size), 5);
    // gray=100 < 128 → dark
    for (let r = 0; r < 5; r++)
      for (let c = 0; c < 5; c++)
        expect(targets[r][c]).toBe(true);
  });
});

// ############################################################################
// 6) decoder-adapter.ts — lightweight coverage
// ############################################################################

describe('decoder-adapter.ts — lightweight coverage', () => {
  it('module exports decodeQR function', async () => {
    const mod = await import('../../src/modules/qr-decoder/decoder-adapter');
    expect(typeof mod.decodeQR).toBe('function');
  });
});

// ############################################################################
// 7) bit-matrix.ts — additional coverage
// ############################################################################

describe('bit-matrix.ts — additional coverage', () => {
  it('parseFromBooleanArray creates correct matrix', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');

    const boolArray = [
      [true, false, true],
      [false, true, false],
      [true, true, false],
    ];
    const matrix = BitMatrix.parseFromBooleanArray(boolArray);
    expect(matrix.getWidth()).toBe(3);
    expect(matrix.getHeight()).toBe(3);
    expect(matrix.get(0, 0)).toBe(true);
    expect(matrix.get(1, 0)).toBe(false);
    expect(matrix.get(2, 0)).toBe(true);
    expect(matrix.get(1, 1)).toBe(true);
  });

  it('flip toggles a bit', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');

    const m = new BitMatrix(10, 10);
    expect(m.get(5, 5)).toBe(false);
    m.flip(5, 5);
    expect(m.get(5, 5)).toBe(true);
    m.flip(5, 5);
    expect(m.get(5, 5)).toBe(false);
  });

  it('clone creates independent copy', async () => {
    const { BitMatrix } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/bit-matrix')
    >('../../src/modules/qr-decoder/bit-matrix');

    const m = new BitMatrix(10, 10);
    m.set(3, 3);
    const c = m.clone();
    expect(c.get(3, 3)).toBe(true);
    c.flip(3, 3);
    expect(m.get(3, 3)).toBe(true);
    expect(c.get(3, 3)).toBe(false);
  });
});

// ############################################################################
// 8) exceptions.ts — coverage
// ############################################################################

describe('exceptions.ts — exception classes', () => {
  it('all exception types have correct kind', async () => {
    const {
      NotFoundException, FormatException, ChecksumException,
      IllegalArgumentException, IllegalStateException,
      ArithmeticException, ReedSolomonException,
      UnsupportedOperationException, ArrayIndexOutOfBoundsException,
    } = await vi.importActual<typeof import('../../src/modules/qr-decoder/exceptions')>(
      '../../src/modules/qr-decoder/exceptions'
    );

    expect(new NotFoundException().getKind()).toBe('NotFoundException');
    expect(new FormatException().getKind()).toBe('FormatException');
    expect(new ChecksumException().getKind()).toBe('ChecksumException');
    expect(new IllegalArgumentException().getKind()).toBe('IllegalArgumentException');
    expect(new IllegalStateException().getKind()).toBe('IllegalStateException');
    expect(new ArithmeticException().getKind()).toBe('ArithmeticException');
    expect(new ReedSolomonException().getKind()).toBe('ReedSolomonException');
    expect(new UnsupportedOperationException().getKind()).toBe('UnsupportedOperationException');

    const aoob = new ArrayIndexOutOfBoundsException(5);
    expect(aoob.getKind()).toBe('ArrayIndexOutOfBoundsException');
    expect(aoob.message).toContain('5');
  });

  it('static factory methods return correct instances', async () => {
    const { NotFoundException, FormatException, ChecksumException } = await vi.importActual<
      typeof import('../../src/modules/qr-decoder/exceptions')
    >('../../src/modules/qr-decoder/exceptions');

    expect(NotFoundException.getNotFoundInstance()).toBeInstanceOf(NotFoundException);
    expect(FormatException.getFormatInstance()).toBeInstanceOf(FormatException);
    expect(ChecksumException.getChecksumInstance()).toBeInstanceOf(ChecksumException);
  });
});
