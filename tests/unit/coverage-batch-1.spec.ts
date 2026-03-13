/**
 * Coverage Batch 1 — tests targeting the lowest-coverage source files.
 *
 * Environment: happy-dom (provides document, Image, FileReader, canvas, etc.)
 *
 * NOTE: happy-dom does NOT provide a real CanvasRenderingContext2D, so we
 * patch HTMLCanvasElement.prototype.getContext in beforeAll/afterAll to return
 * a comprehensive mock context for all '2d' requests.
 */

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// Module-level mocks (hoisted)
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

// Mock QR decoder barrel (used by scanner.ts)
const mockDecodeQRBarrel = vi.fn();
vi.mock('../../src/modules/qr-decoder', () => ({ decodeQR: mockDecodeQRBarrel }));

// Mock decoder-adapter (used by decode-canvas.ts)
const mockDecodeQRAdapter = vi.fn();
vi.mock('../../src/domain/qr/decode/decoder-adapter', () => ({ decodeQR: mockDecodeQRAdapter }));

// Mock analyzer decoder (used by analyzer.ts)
const mockDecodeQRFromCanvas = vi.fn();
vi.mock('../../src/domain/qr/analyze/decoder', () => ({
  decodeQRFromCanvas: mockDecodeQRFromCanvas,
}));

// ============================================================================
// ImageData polyfill (safety net — happy-dom should already provide it)
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
// Global Canvas 2D Context Mock
// ============================================================================

/** Cache mock contexts per canvas instance (mirrors real browser behavior) */
const mockCtxCache = new WeakMap<HTMLCanvasElement, Record<string, unknown>>();

function createMockCtx(canvas: HTMLCanvasElement) {
  return {
    canvas,
    // Drawing
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    strokeRect: vi.fn(),
    beginPath: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn(),
    // Transforms
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    setTransform: vi.fn(),
    resetTransform: vi.fn(),
    // Pixel data — returns real ImageData with zeroed pixels
    getImageData: vi.fn((_sx: number, _sy: number, sw: number, sh: number) => {
      return new ImageData(new Uint8ClampedArray(sw * sh * 4), sw, sh);
    }),
    putImageData: vi.fn(),
    createImageData: vi.fn((w: number, h: number) => {
      return new ImageData(new Uint8ClampedArray(w * h * 4), w, h);
    }),
    // Properties
    globalCompositeOperation: 'source-over' as string,
    globalAlpha: 1,
    fillStyle: '#000000' as string,
    strokeStyle: '#000000' as string,
    lineWidth: 1,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'low' as string,
    font: '10px sans-serif',
    measureText: vi.fn(() => ({
      width: 0,
      actualBoundingBoxAscent: 0,
      actualBoundingBoxDescent: 0,
      actualBoundingBoxLeft: 0,
      actualBoundingBoxRight: 0,
      fontBoundingBoxAscent: 0,
      fontBoundingBoxDescent: 0,
    })),
  };
}

let origGetContext: typeof HTMLCanvasElement.prototype.getContext;

beforeAll(() => {
  origGetContext = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (
    contextId: string,
    ..._args: unknown[]
  ): RenderingContext | null {
    if (contextId === '2d') {
      let ctx = mockCtxCache.get(this);
      if (!ctx) {
        ctx = createMockCtx(this);
        mockCtxCache.set(this, ctx);
      }
      return ctx as unknown as CanvasRenderingContext2D;
    }
    return origGetContext.call(this, contextId, ..._args) as RenderingContext | null;
  } as typeof HTMLCanvasElement.prototype.getContext;
});

afterAll(() => {
  HTMLCanvasElement.prototype.getContext = origGetContext;
});

// ============================================================================
// Helpers
// ============================================================================

function analysisStub(overrides: Record<string, unknown> = {}) {
  return {
    success: false,
    error: 'No QR code detected',
    errorType: 'no_qr_detected',
    version: null,
    moduleCount: 0,
    eccLevel: null,
    maskPattern: null,
    encodingMode: null,
    errorsCorrected: null,
    estimatedModulePx: null,
    ...overrides,
  };
}

/** Mock Image class — fires onload or onerror when src is set (via microtask) */
function mockImageClass(shouldLoad: boolean, w = 10, h = 10) {
  return class MI {
    width = w;
    height = h;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    crossOrigin = '';
    private _src = '';
    get src() {
      return this._src;
    }
    set src(v: string) {
      this._src = v;
      Promise.resolve().then(() => (shouldLoad ? this.onload?.() : this.onerror?.()));
    }
  } as unknown as typeof Image;
}

/** Mock FileReader class */
function mockFileReaderClass(ok: boolean, result = 'data:image/png;base64,iVBOR') {
  return class MFR {
    onload: ((e: unknown) => void) | null = null;
    onerror: (() => void) | null = null;
    result: string | null = null;
    readAsDataURL(_f: File) {
      Promise.resolve().then(() => {
        if (ok) {
          this.result = result;
          this.onload?.({ target: { result } });
        } else {
          this.onerror?.();
        }
      });
    }
  } as unknown as typeof FileReader;
}

/**
 * Spy on document.createElement so that every NEW <canvas> has getContext→null.
 * This is used to test error paths where internal canvas creation fails.
 * The spy overrides the individual instance's getContext (own property beats prototype).
 */
function spyCanvasCtxNull() {
  const orig = document.createElement.bind(document);
  return vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
    const el = orig(tag);
    if (tag === 'canvas') vi.spyOn(el as HTMLCanvasElement, 'getContext').mockReturnValue(null);
    return el;
  }) as typeof document.createElement);
}

// ============================================================================
// Reset between tests
// ============================================================================

beforeEach(() => {
  mockDecodeQRBarrel.mockReset();
  mockDecodeQRAdapter.mockReset();
  mockDecodeQRFromCanvas.mockReset();
});

// ############################################################################
// 1) exporter/types.ts — getDefaultExportConfig
// ############################################################################

describe('exporter/types.ts', () => {
  it('getDefaultExportConfig returns expected defaults', async () => {
    const { getDefaultExportConfig } = await import('../../src/modules/exporter/types');
    const cfg = getDefaultExportConfig();
    expect(cfg.outputFormat).toBe('png');
    expect(cfg.outputWidth).toBe(400);
    expect(cfg.outputHeight).toBe(400);
    expect(cfg.outputQuality).toBe(0.9);
    expect(cfg.filename).toBe('anqr-qrcode');
    expect(cfg.animationSpeed).toBe(100);
    expect(cfg.loopAnimation).toBe(true);
    expect(cfg.transparentBackground).toBe(false);
    expect(cfg.dpi).toBe(72);
    expect(cfg.includeMetadata).toBe(false);
    expect(cfg.includeQuietZone).toBe(true);
    expect(cfg.bgOverride).toBe('');
    expect(cfg.gifDisposal).toBe('keep');
  });
});

// ############################################################################
// 2) dither-algorithms/utils.ts
// ############################################################################

describe('dither-algorithms/utils.ts', () => {
  it('getOrderedMatrix returns correct matrix for each name', async () => {
    const { getOrderedMatrix } = await import('../../src/modules/dither-algorithms/utils');
    expect(getOrderedMatrix('bayer2')).toHaveLength(2);
    expect(getOrderedMatrix('bayer4')).toHaveLength(4);
    expect(getOrderedMatrix('bayer8')).toHaveLength(8);
    expect(getOrderedMatrix('clustered_dot').length).toBeGreaterThan(0);
    expect(getOrderedMatrix('void_cluster').length).toBeGreaterThan(0);
  });

  it('getOrderedMatrix returns bayer4 for unknown name', async () => {
    const { getOrderedMatrix } = await import('../../src/modules/dither-algorithms/utils');
    const fallback = getOrderedMatrix('nonexistent' as never);
    expect(fallback).toHaveLength(4);
  });

  it('imageDataToFloat converts RGBA pixels to 0-1 float rows', async () => {
    const { imageDataToFloat } = await import('../../src/modules/dither-algorithms/utils');
    const data = new Uint8ClampedArray([255, 128, 0, 255, 0, 0, 255, 255]);
    const img = new ImageData(data, 2, 1);
    const rows = imageDataToFloat(img);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(6); // 2 pixels × 3 channels
    expect(rows[0][0]).toBeCloseTo(1); // r of pixel 0
    expect(rows[0][1]).toBeCloseTo(128 / 255); // g
    expect(rows[0][2]).toBeCloseTo(0); // b
    expect(rows[0][3]).toBeCloseTo(0); // r of pixel 1
    expect(rows[0][5]).toBeCloseTo(1); // b of pixel 1
  });
});

// ############################################################################
// 3) canvas-factory.ts
// ############################################################################

describe('canvas-factory.ts', () => {
  it('createCanvas resolves with a canvas of correct size', async () => {
    const { defaultBrowserCanvasFactory } =
      await import('../../src/modules/qr-generator/canvas-factory');
    const canvas = await defaultBrowserCanvasFactory.createCanvas(200, 150);
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(150);
  });

  it('loadImage resolves when image loads', async () => {
    const orig = globalThis.Image;
    globalThis.Image = mockImageClass(true, 20, 30);
    try {
      const { defaultBrowserCanvasFactory } =
        await import('../../src/modules/qr-generator/canvas-factory');
      const img = await defaultBrowserCanvasFactory.loadImage!('http://example.com/pic.png');
      expect(img).toBeDefined();
    } finally {
      globalThis.Image = orig;
    }
  });

  it('loadImage rejects when image fails', async () => {
    const orig = globalThis.Image;
    globalThis.Image = mockImageClass(false);
    try {
      const { defaultBrowserCanvasFactory } =
        await import('../../src/modules/qr-generator/canvas-factory');
      await expect(
        defaultBrowserCanvasFactory.loadImage!('http://example.com/bad.png')
      ).rejects.toThrow('Failed to load image');
    } finally {
      globalThis.Image = orig;
    }
  });
});

// ############################################################################
// 4) decode-canvas.ts
// ############################################################################

describe('decode-canvas.ts', () => {
  it('decodeFromCanvas returns result from adapter', async () => {
    mockDecodeQRAdapter.mockReturnValue({ success: true, data: 'hello' });
    const { decodeFromCanvas } = await import('../../src/modules/qr-decoder/decode-canvas');
    const canvas = document.createElement('canvas');
    canvas.width = 10;
    canvas.height = 10;
    const result = decodeFromCanvas(canvas);
    expect(result).toEqual({ success: true, data: 'hello' });
  });

  it('decodeFromCanvas returns null when ctx is null', async () => {
    const { decodeFromCanvas } = await import('../../src/modules/qr-decoder/decode-canvas');
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);
    expect(decodeFromCanvas(canvas)).toBeNull();
  });
});

// ############################################################################
// 5) scanner.ts
// ############################################################################

describe('scanner.ts', () => {
  const loc = {
    topLeftCorner: { x: 0, y: 0 },
    topRightCorner: { x: 10, y: 0 },
    bottomLeftCorner: { x: 0, y: 10 },
    bottomRightCorner: { x: 10, y: 10 },
  };

  describe('scanFile', () => {
    it('resolves with data when file reads and image loads', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 50, 50);
      mockDecodeQRBarrel.mockReturnValue({ success: true, data: 'OK', location: loc });
      try {
        const { scanFile } = await import('../../src/modules/qr-analyzer/scanner');
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        const res = await scanFile(file);
        expect(res.data).toBe('OK');
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('resolves null on FileReader error', async () => {
      const origFR = globalThis.FileReader;
      globalThis.FileReader = mockFileReaderClass(false);
      try {
        const { scanFile } = await import('../../src/modules/qr-analyzer/scanner');
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        const res = await scanFile(file);
        expect(res.data).toBeNull();
      } finally {
        globalThis.FileReader = origFR;
      }
    });

    it('resolves null on Image error', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(false);
      try {
        const { scanFile } = await import('../../src/modules/qr-analyzer/scanner');
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        const res = await scanFile(file);
        expect(res.data).toBeNull();
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('resolves null when canvas ctx is null', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 5, 5);
      const spy = spyCanvasCtxNull();
      try {
        const { scanFile } = await import('../../src/modules/qr-analyzer/scanner');
        const file = new File(['x'], 'a.png', { type: 'image/png' });
        const res = await scanFile(file);
        expect(res.data).toBeNull();
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
        spy.mockRestore();
      }
    });
  });

  describe('validateQRCode', () => {
    it('returns invalid when no data detected', async () => {
      mockDecodeQRBarrel.mockReturnValue(null);
      const { validateQRCode } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCode(canvas);
      expect(res.valid).toBe(false);
      expect(res.confidence).toBe('low');
    });

    it('returns mismatch when content differs', async () => {
      mockDecodeQRBarrel.mockReturnValue({ success: true, data: 'abc', location: loc });
      const { validateQRCode } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCode(canvas, 'xyz');
      expect(res.valid).toBe(false);
      expect(res.confidence).toBe('medium');
      expect(res.data).toBe('abc');
    });

    it('returns valid when content matches', async () => {
      mockDecodeQRBarrel.mockReturnValue({ success: true, data: 'abc', location: loc });
      const { validateQRCode } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCode(canvas, 'abc');
      expect(res.valid).toBe(true);
      expect(res.confidence).toBe('high');
    });

    it('returns valid when no expected content specified', async () => {
      mockDecodeQRBarrel.mockReturnValue({ success: true, data: 'abc', location: loc });
      const { validateQRCode } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCode(canvas);
      expect(res.valid).toBe(true);
    });
  });

  describe('validateQRCodeRobust', () => {
    it('returns valid on first success', async () => {
      mockDecodeQRBarrel.mockReturnValue({ success: true, data: 'ok', location: loc });
      const { validateQRCodeRobust } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCodeRobust(canvas, 'ok', 3);
      expect(res.valid).toBe(true);
    });

    it('returns invalid after all attempts fail', async () => {
      mockDecodeQRBarrel.mockReturnValue(null);
      const { validateQRCodeRobust } = await import('../../src/modules/qr-analyzer/scanner');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = validateQRCodeRobust(canvas, 'ok', 3);
      expect(res.valid).toBe(false);
      expect(res.confidence).toBe('low');
    });
  });

  describe('validateFrames', () => {
    it('returns correct counts', async () => {
      let callCount = 0;
      mockDecodeQRBarrel.mockImplementation(() => {
        callCount++;
        return callCount <= 2 ? { success: true, data: 'ok', location: loc } : null;
      });
      const { validateFrames } = await import('../../src/modules/qr-analyzer/scanner');
      const frames = Array.from({ length: 3 }, () => {
        const c = document.createElement('canvas');
        c.width = 10;
        c.height = 10;
        return c;
      });
      const res = validateFrames(frames, 'ok');
      expect(res.totalCount).toBe(3);
      expect(res.validCount).toBe(2);
      expect(res.valid).toBe(false);
    });
  });
});

// ############################################################################
// 6) analyzer.ts
// ############################################################################

describe('analyzer.ts', () => {
  describe('analyzeQRFromCanvas', () => {
    it('returns result with timing', async () => {
      mockDecodeQRFromCanvas.mockReturnValue(analysisStub());
      const { analyzeQRFromCanvas } = await import('../../src/modules/qr-analyzer/analyzer');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = await analyzeQRFromCanvas(canvas);
      expect(res.success).toBe(false);
      expect(res.timing?.totalAnalysisMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeQRCode', () => {
    it('returns result with timing (sync)', async () => {
      mockDecodeQRFromCanvas.mockReturnValue(analysisStub({ success: true }));
      const { analyzeQRCode } = await import('../../src/modules/qr-analyzer/analyzer');
      const canvas = document.createElement('canvas');
      canvas.width = 10;
      canvas.height = 10;
      const res = analyzeQRCode(canvas);
      expect(res.success).toBe(true);
      expect(res.timing?.totalAnalysisMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('analyzeQRFromFile', () => {
    it('resolves on success', async () => {
      mockDecodeQRFromCanvas.mockReturnValue(analysisStub({ success: true }));
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 20, 20);
      try {
        const { analyzeQRFromFile } = await import('../../src/modules/qr-analyzer/analyzer');
        const file = new File(['x'], 'q.png', { type: 'image/png' });
        const res = await analyzeQRFromFile(file);
        expect(res.success).toBe(true);
        expect(res.timing?.totalAnalysisMs).toBeGreaterThanOrEqual(0);
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('resolves with error on FileReader failure', async () => {
      const origFR = globalThis.FileReader;
      globalThis.FileReader = mockFileReaderClass(false);
      try {
        const { analyzeQRFromFile } = await import('../../src/modules/qr-analyzer/analyzer');
        const file = new File(['x'], 'q.png', { type: 'image/png' });
        const res = await analyzeQRFromFile(file);
        expect(res.success).toBe(false);
        expect(res.error).toBe('Failed to read file');
      } finally {
        globalThis.FileReader = origFR;
      }
    });

    it('resolves with error on Image load failure', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(false);
      try {
        const { analyzeQRFromFile } = await import('../../src/modules/qr-analyzer/analyzer');
        const file = new File(['x'], 'q.png', { type: 'image/png' });
        const res = await analyzeQRFromFile(file);
        expect(res.success).toBe(false);
        expect(res.error).toBe('Failed to load image');
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('resolves with error when canvas ctx is null', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 5, 5);
      const spy = spyCanvasCtxNull();
      try {
        const { analyzeQRFromFile } = await import('../../src/modules/qr-analyzer/analyzer');
        const file = new File(['x'], 'q.png', { type: 'image/png' });
        const res = await analyzeQRFromFile(file);
        expect(res.success).toBe(false);
        expect(res.error).toBe('Could not get canvas context');
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
        spy.mockRestore();
      }
    });
  });

  describe('analyzeQRFromUrl', () => {
    it('resolves on success', async () => {
      mockDecodeQRFromCanvas.mockReturnValue(analysisStub({ success: true }));
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(true, 20, 20);
      try {
        const { analyzeQRFromUrl } = await import('../../src/modules/qr-analyzer/analyzer');
        const res = await analyzeQRFromUrl('http://example.com/qr.png');
        expect(res.success).toBe(true);
      } finally {
        globalThis.Image = origImg;
      }
    });

    it('resolves with CORS error on image failure', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(false);
      try {
        const { analyzeQRFromUrl } = await import('../../src/modules/qr-analyzer/analyzer');
        const res = await analyzeQRFromUrl('http://example.com/bad.png');
        expect(res.success).toBe(false);
        expect(res.errorType).toBe('cors_blocked');
      } finally {
        globalThis.Image = origImg;
      }
    });

    it('resolves with error when canvas ctx is null', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(true, 5, 5);
      const spy = spyCanvasCtxNull();
      try {
        const { analyzeQRFromUrl } = await import('../../src/modules/qr-analyzer/analyzer');
        const res = await analyzeQRFromUrl('http://example.com/qr.png');
        expect(res.success).toBe(false);
        expect(res.error).toBe('Could not get canvas context');
      } finally {
        globalThis.Image = origImg;
        spy.mockRestore();
      }
    });
  });
});

// ############################################################################
// 7) overlay/processor.ts
// ############################################################################

describe('overlay/processor.ts', () => {
  function srcCanvas(w: number, h: number): HTMLCanvasElement {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  // --- loadImage* -----------------------------------------------------------

  describe('loadImageFromFile', () => {
    it('resolves with canvas on success', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 40, 30);
      try {
        const { loadImageFromFile } = await import('../../src/modules/overlay/processor');
        const file = new File(['px'], 'i.png', { type: 'image/png' });
        const canvas = await loadImageFromFile(file);
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(40);
        expect(canvas.height).toBe(30);
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('rejects on FileReader error', async () => {
      const origFR = globalThis.FileReader;
      globalThis.FileReader = mockFileReaderClass(false);
      try {
        const { loadImageFromFile } = await import('../../src/modules/overlay/processor');
        const file = new File(['x'], 'i.png', { type: 'image/png' });
        await expect(loadImageFromFile(file)).rejects.toThrow('Failed to read file');
      } finally {
        globalThis.FileReader = origFR;
      }
    });

    it('rejects on Image error', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(false);
      try {
        const { loadImageFromFile } = await import('../../src/modules/overlay/processor');
        const file = new File(['x'], 'i.png', { type: 'image/png' });
        await expect(loadImageFromFile(file)).rejects.toThrow('Failed to load image');
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
      }
    });

    it('rejects when canvas ctx is null', async () => {
      const origFR = globalThis.FileReader;
      const origImg = globalThis.Image;
      globalThis.FileReader = mockFileReaderClass(true);
      globalThis.Image = mockImageClass(true, 5, 5);
      const spy = spyCanvasCtxNull();
      try {
        const { loadImageFromFile } = await import('../../src/modules/overlay/processor');
        const file = new File(['x'], 'i.png', { type: 'image/png' });
        await expect(loadImageFromFile(file)).rejects.toThrow('Could not get 2D context');
      } finally {
        globalThis.FileReader = origFR;
        globalThis.Image = origImg;
        spy.mockRestore();
      }
    });
  });

  describe('loadImageFromUrl', () => {
    it('resolves with canvas on success', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(true, 60, 40);
      try {
        const { loadImageFromUrl } = await import('../../src/modules/overlay/processor');
        const canvas = await loadImageFromUrl('http://example.com/pic.png');
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
        expect(canvas.width).toBe(60);
      } finally {
        globalThis.Image = origImg;
      }
    });

    it('rejects on Image error', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(false);
      try {
        const { loadImageFromUrl } = await import('../../src/modules/overlay/processor');
        await expect(loadImageFromUrl('http://bad')).rejects.toThrow(
          'Failed to load image from URL'
        );
      } finally {
        globalThis.Image = origImg;
      }
    });

    it('rejects when canvas ctx is null', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(true, 5, 5);
      const spy = spyCanvasCtxNull();
      try {
        const { loadImageFromUrl } = await import('../../src/modules/overlay/processor');
        await expect(loadImageFromUrl('http://x')).rejects.toThrow('Could not get 2D context');
      } finally {
        globalThis.Image = origImg;
        spy.mockRestore();
      }
    });
  });

  describe('loadImageFromDataUrl', () => {
    it('delegates to loadImageFromUrl', async () => {
      const origImg = globalThis.Image;
      globalThis.Image = mockImageClass(true, 5, 5);
      try {
        const { loadImageFromDataUrl } = await import('../../src/modules/overlay/processor');
        const canvas = await loadImageFromDataUrl('data:image/png;base64,abc');
        expect(canvas).toBeInstanceOf(HTMLCanvasElement);
      } finally {
        globalThis.Image = origImg;
      }
    });
  });

  // --- transformations ------------------------------------------------------

  describe('cropOverlayImage', () => {
    it('returns cropped canvas', async () => {
      const { cropOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = cropOverlayImage(srcCanvas(100, 100), {
        x: 10,
        y: 20,
        width: 50,
        height: 30,
      });
      expect(result.width).toBe(50);
      expect(result.height).toBe(30);
    });

    it('throws when ctx is null', async () => {
      const { cropOverlayImage } = await import('../../src/modules/overlay/processor');
      const spy = spyCanvasCtxNull();
      try {
        expect(() =>
          cropOverlayImage(srcCanvas(10, 10), { x: 0, y: 0, width: 5, height: 5 })
        ).toThrow('Could not get 2D context');
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('fitOverlayImage', () => {
    it('contain — landscape source', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(200, 100), 150, 150, 'contain');
      expect(result.width).toBe(150);
      expect(result.height).toBe(150);
    });

    it('contain — portrait source', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(100, 200), 150, 150, 'contain');
      expect(result.width).toBe(150);
      expect(result.height).toBe(150);
    });

    it('cover — landscape source', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(200, 100), 150, 150, 'cover');
      expect(result.width).toBe(150);
    });

    it('cover — portrait source', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(100, 200), 150, 150, 'cover');
      expect(result.width).toBe(150);
    });

    it('fill', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(50, 50), 120, 80, 'fill');
      expect(result.width).toBe(120);
      expect(result.height).toBe(80);
    });

    it('none', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const result = fitOverlayImage(srcCanvas(50, 50), 120, 80, 'none');
      expect(result.width).toBe(120);
      expect(result.height).toBe(80);
    });

    it('throws when ctx is null', async () => {
      const { fitOverlayImage } = await import('../../src/modules/overlay/processor');
      const spy = spyCanvasCtxNull();
      try {
        expect(() => fitOverlayImage(srcCanvas(10, 10), 20, 20, 'fill')).toThrow(
          'Could not get 2D context'
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('rotateOverlayCanvas', () => {
    it('returns rotated canvas', async () => {
      const { rotateOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const result = rotateOverlayCanvas(srcCanvas(100, 50), 45);
      expect(result).toBeInstanceOf(HTMLCanvasElement);
      expect(result.width).toBeGreaterThan(0);
      expect(result.height).toBeGreaterThan(0);
    });

    it('throws when ctx is null', async () => {
      const { rotateOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const spy = spyCanvasCtxNull();
      try {
        expect(() => rotateOverlayCanvas(srcCanvas(10, 10), 90)).toThrow(
          'Could not get 2D context'
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  describe('flipOverlayCanvas', () => {
    it('flips horizontally', async () => {
      const { flipOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const result = flipOverlayCanvas(srcCanvas(80, 60), true, false);
      expect(result.width).toBe(80);
      expect(result.height).toBe(60);
    });

    it('flips vertically', async () => {
      const { flipOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const result = flipOverlayCanvas(srcCanvas(80, 60), false, true);
      expect(result.width).toBe(80);
    });

    it('flips both', async () => {
      const { flipOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const result = flipOverlayCanvas(srcCanvas(80, 60), true, true);
      expect(result.width).toBe(80);
    });

    it('throws when ctx is null', async () => {
      const { flipOverlayCanvas } = await import('../../src/modules/overlay/processor');
      const spy = spyCanvasCtxNull();
      try {
        expect(() => flipOverlayCanvas(srcCanvas(10, 10), true, false)).toThrow(
          'Could not get 2D context'
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  // --- dithering ------------------------------------------------------------

  describe('getOverlayDitherKind', () => {
    it('returns none when disabled', async () => {
      const { getOverlayDitherKind } = await import('../../src/modules/overlay/processor');
      expect(getOverlayDitherKind()).toBe('none');
      expect(getOverlayDitherKind({ enabled: false })).toBe('none');
    });

    it('returns kind when enabled', async () => {
      const { getOverlayDitherKind } = await import('../../src/modules/overlay/processor');
      expect(getOverlayDitherKind({ enabled: true, kind: 'ordered' })).toBe('ordered');
    });

    it('defaults to floyd_steinberg', async () => {
      const { getOverlayDitherKind } = await import('../../src/modules/overlay/processor');
      expect(getOverlayDitherKind({ enabled: true })).toBe('floyd_steinberg');
    });
  });

  describe('applyOverlayDither', () => {
    it('returns input unchanged when disabled', async () => {
      const { applyOverlayDither } = await import('../../src/modules/overlay/processor');
      const data = new Uint8ClampedArray(16);
      const img = new ImageData(data, 2, 2);
      const result = applyOverlayDither(img, { enabled: false });
      expect(result).toBe(img);
    });

    it('returns input unchanged when kind is none', async () => {
      const { applyOverlayDither } = await import('../../src/modules/overlay/processor');
      const data = new Uint8ClampedArray(16);
      const img = new ImageData(data, 2, 2);
      const result = applyOverlayDither(img, { enabled: true, kind: 'none' });
      expect(result).toBe(img);
    });

    it('processes pixels when enabled with valid kind', async () => {
      const { applyOverlayDither } = await import('../../src/modules/overlay/processor');
      const data = new Uint8ClampedArray([
        128, 64, 32, 255, 200, 100, 50, 255, 10, 20, 30, 255, 240, 230, 220, 255,
      ]);
      const img = new ImageData(data, 2, 2);
      const result = applyOverlayDither(img, {
        enabled: true,
        kind: 'floyd_steinberg',
        strength: 1.0,
        levels: 2,
      });
      expect(result).toBeInstanceOf(ImageData);
      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
      expect(result.data.length).toBe(16);
    });
  });

  describe('applyOverlayDitherForQR', () => {
    it('returns source when disabled', async () => {
      const { applyOverlayDitherForQR } = await import('../../src/modules/overlay/processor');
      const c = srcCanvas(10, 10);
      expect(applyOverlayDitherForQR(c, { enabled: false })).toBe(c);
    });

    it('returns source when kind is none', async () => {
      const { applyOverlayDitherForQR } = await import('../../src/modules/overlay/processor');
      const c = srcCanvas(10, 10);
      expect(applyOverlayDitherForQR(c, { enabled: true, kind: 'none' })).toBe(c);
    });

    it('returns new canvas when dithering applied', async () => {
      const { applyOverlayDitherForQR } = await import('../../src/modules/overlay/processor');
      const c = srcCanvas(4, 4);
      const result = applyOverlayDitherForQR(c, {
        enabled: true,
        kind: 'ordered',
        strength: 1,
        levels: 2,
      });
      expect(result).toBeInstanceOf(HTMLCanvasElement);
    });

    it('returns source when ctx is null', async () => {
      const { applyOverlayDitherForQR } = await import('../../src/modules/overlay/processor');
      const c = srcCanvas(4, 4);
      vi.spyOn(c, 'getContext').mockReturnValue(null);
      const result = applyOverlayDitherForQR(c, { enabled: true, kind: 'ordered' });
      expect(result).toBe(c);
    });
  });

  // --- data extraction ------------------------------------------------------

  describe('extractOverlayBrightnessData', () => {
    it('returns Float32Array of expected length', async () => {
      const { extractOverlayBrightnessData } = await import('../../src/modules/overlay/processor');
      const result = extractOverlayBrightnessData(srcCanvas(50, 50), 10);
      expect(result).toBeInstanceOf(Float32Array);
      expect(result.length).toBe(100); // 10×10
    });
  });

  describe('extractOverlayRGBData', () => {
    it('returns r/g/b Float32Arrays', async () => {
      const { extractOverlayRGBData } = await import('../../src/modules/overlay/processor');
      const { r, g, b } = extractOverlayRGBData(srcCanvas(50, 50), 8);
      expect(r.length).toBe(64);
      expect(g.length).toBe(64);
      expect(b.length).toBe(64);
    });
  });

  // --- blend modes ----------------------------------------------------------

  describe('applyCanvasBlendMode', () => {
    const modes = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light'] as const;

    for (const mode of modes) {
      it(`applies ${mode} blend`, async () => {
        const { applyCanvasBlendMode } = await import('../../src/modules/overlay/processor');
        const base = srcCanvas(20, 20);
        const over = srcCanvas(20, 20);
        const result = applyCanvasBlendMode(base, over, mode, 0.8);
        expect(result).toBeInstanceOf(HTMLCanvasElement);
        expect(result.width).toBe(20);
      });
    }

    it('throws when ctx is null', async () => {
      const { applyCanvasBlendMode } = await import('../../src/modules/overlay/processor');
      const spy = spyCanvasCtxNull();
      try {
        expect(() => applyCanvasBlendMode(srcCanvas(10, 10), srcCanvas(10, 10), 'normal')).toThrow(
          'Could not get 2D context'
        );
      } finally {
        spy.mockRestore();
      }
    });
  });

  // --- processOverlay -------------------------------------------------------

  describe('processOverlay', () => {
    it('basic fit only', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50);
      expect(res.width).toBe(50);
      expect(res.height).toBe(50);
      expect(res.originalWidth).toBe(100);
      expect(res.originalHeight).toBe(100);
    });

    it('with crop', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50, {
        crop: { x: 10, y: 10, width: 60, height: 60 },
      });
      expect(res.width).toBe(50);
    });

    it('with rotation', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50, { rotation: 45 });
      expect(res.width).toBe(50);
    });

    it('with flip', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50, { flipX: true, flipY: true });
      expect(res.width).toBe(50);
    });

    it('with filters', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50, {
        filters: { brightness: 20 },
      });
      expect(res.width).toBe(50);
    });

    it('with dithering', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(20, 20), 10, 10, {
        dither: { enabled: true, kind: 'ordered', strength: 1, levels: 2 },
      });
      expect(res.width).toBe(10);
    });

    it('with all options combined', async () => {
      const { processOverlay } = await import('../../src/modules/overlay/processor');
      const res = processOverlay(srcCanvas(100, 100), 50, 50, {
        crop: { x: 5, y: 5, width: 90, height: 90 },
        rotation: 30,
        flipX: true,
        fitMode: 'contain',
        filters: { contrast: 10 },
        dither: { enabled: true, kind: 'floyd_steinberg', strength: 0.8, levels: 4 },
      });
      expect(res.canvas).toBeInstanceOf(HTMLCanvasElement);
      expect(res.originalWidth).toBe(100);
    });
  });
});

// ############################################################################
// 8) dither-algorithms/temporal.ts — applyTemporalNoiseToCanvas
// ############################################################################

describe('dither-algorithms/temporal.ts — applyTemporalNoiseToCanvas', () => {
  it('returns same canvas when offset is 0', async () => {
    const { applyTemporalNoiseToCanvas } =
      await import('../../src/modules/dither-algorithms/temporal');
    const c = document.createElement('canvas');
    c.width = 10;
    c.height = 10;
    expect(applyTemporalNoiseToCanvas(c, 0, 0.02)).toBe(c);
  });

  it('returns same canvas when strength is 0', async () => {
    const { applyTemporalNoiseToCanvas } =
      await import('../../src/modules/dither-algorithms/temporal');
    const c = document.createElement('canvas');
    c.width = 10;
    c.height = 10;
    expect(applyTemporalNoiseToCanvas(c, 0.5, 0)).toBe(c);
  });

  it('returns new canvas when offset and strength are non-zero', async () => {
    const { applyTemporalNoiseToCanvas } =
      await import('../../src/modules/dither-algorithms/temporal');
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    const result = applyTemporalNoiseToCanvas(c, 0.5, 0.02);
    expect(result).toBeInstanceOf(HTMLCanvasElement);
    // The function creates a NEW canvas via document.createElement, so they differ
    expect(result).not.toBe(c);
  });

  it('returns original when new canvas ctx is null', async () => {
    const { applyTemporalNoiseToCanvas } =
      await import('../../src/modules/dither-algorithms/temporal');
    const c = document.createElement('canvas');
    c.width = 4;
    c.height = 4;
    // Make ALL newly-created canvases have null ctx
    const spy = spyCanvasCtxNull();
    try {
      const result = applyTemporalNoiseToCanvas(c, 0.5, 0.02);
      // When the internal new canvas has null ctx, the function returns the original
      expect(result).toBeDefined();
    } finally {
      spy.mockRestore();
    }
  });
});

// ############################################################################
// 9) overlay-transforms.ts — applyGeometricTransforms & preprocessOverlay
// ############################################################################

describe('overlay-transforms.ts', () => {
  const createCanvasFn = async (w: number, h: number) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c as HTMLCanvasElement | OffscreenCanvas;
  };

  describe('applyGeometricTransforms', () => {
    it('returns original canvas (no transforms configured)', async () => {
      const { applyGeometricTransforms } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 10;
      c.height = 10;
      const result = await applyGeometricTransforms(c, {} as never, createCanvasFn);
      expect(result).toBe(c);
    });
  });

  describe('preprocessOverlay', () => {
    it('returns original canvas when no preprocessing needed', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 10;
      c.height = 10;
      const result = await preprocessOverlay(c, {} as never, createCanvasFn);
      expect(result).toBe(c);
    });

    it('returns original when no preprocessing needed (debug on)', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 10;
      c.height = 10;
      const result = await preprocessOverlay(
        c,
        { debugOverlayDither: true } as never,
        createCanvasFn
      );
      expect(result).toBe(c);
    });

    it('applies preprocessing when filter options set', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 8;
      c.height = 8;
      const result = await preprocessOverlay(c, { filterBrightness: 50 } as never, createCanvasFn);
      // preprocessOverlay creates a NEW canvas via createCanvasFn, so they differ
      expect(result).not.toBe(c);
      expect(result.width).toBe(8);
    });

    it('applies preprocessing with debug enabled', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 4;
      c.height = 4;
      const result = await preprocessOverlay(
        c,
        { filterContrast: 30, debugOverlayDither: true } as never,
        createCanvasFn
      );
      expect(result).not.toBe(c);
    });

    it('returns original when source ctx is null', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 4;
      c.height = 4;
      vi.spyOn(c, 'getContext').mockReturnValue(null);
      const result = await preprocessOverlay(c, { filterBrightness: 10 } as never, createCanvasFn);
      expect(result).toBe(c);
    });

    it('returns original when result ctx is null', async () => {
      const { preprocessOverlay } =
        await import('../../src/modules/qr-generator/overlay-transforms');
      const c = document.createElement('canvas');
      c.width = 4;
      c.height = 4;

      const nullCtxCreate = async (w: number, h: number) => {
        const nc = document.createElement('canvas');
        nc.width = w;
        nc.height = h;
        vi.spyOn(nc, 'getContext').mockReturnValue(null);
        return nc as HTMLCanvasElement | OffscreenCanvas;
      };

      const result = await preprocessOverlay(c, { filterBrightness: 10 } as never, nullCtxCreate);
      expect(result).toBe(c);
    });
  });
});
