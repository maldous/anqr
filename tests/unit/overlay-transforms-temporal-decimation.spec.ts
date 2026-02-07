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

// ============================================================================
// overlay-transforms.ts tests
// ============================================================================

describe('overlay-transforms.ts', () => {
  describe('hasPreprocessingOptions', () => {
    async function getHasPreprocessing() {
      const mod = await import('../../src/modules/qr-generator/overlay-transforms');
      return mod.hasPreprocessingOptions;
    }

    it('returns false when all filters are default/undefined', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({} as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterBrightness !== 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterBrightness: 50 } as Parameters<typeof fn>[0])).toBe(true);
      expect(fn({ filterBrightness: -10 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for filterBrightness === 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterBrightness: 0 } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterContrast !== 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterContrast: 30 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for filterContrast === 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterContrast: 0 } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterSaturation !== 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterSaturation: 20 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for filterHue !== 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterHue: 45 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for filterGamma !== 1', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterGamma: 2.2 } as Parameters<typeof fn>[0])).toBe(true);
      expect(fn({ filterGamma: 0.5 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for filterGamma === 1 (default)', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterGamma: 1 } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterInvert', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterInvert: true } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for filterInvert = false', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterInvert: false } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterGrayscale', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterGrayscale: true } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for filterThreshold > 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterThreshold: 128 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for filterThreshold = 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterThreshold: 0 } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterBlur > 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterBlur: 3 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for filterSharpen > 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterSharpen: 2 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for filterPosterize > 0', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterPosterize: 4 } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for duotone (both colors set)', async () => {
      const fn = await getHasPreprocessing();
      expect(
        fn({ filterDuotone1: '#000000', filterDuotone2: '#ffffff' } as Parameters<typeof fn>[0])
      ).toBe(true);
    });

    it('returns false for duotone with only one color', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterDuotone1: '#000000' } as Parameters<typeof fn>[0])).toBe(false);
      expect(fn({ filterDuotone2: '#ffffff' } as Parameters<typeof fn>[0])).toBe(false);
    });

    it('returns true for filterEdgeDetect', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ filterEdgeDetect: true } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns true for colorMode !== color', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ colorMode: 'grayscale' } as Parameters<typeof fn>[0])).toBe(true);
      expect(fn({ colorMode: 'bw' } as Parameters<typeof fn>[0])).toBe(true);
    });

    it('returns false for colorMode = color', async () => {
      const fn = await getHasPreprocessing();
      expect(fn({ colorMode: 'color' } as Parameters<typeof fn>[0])).toBe(false);
    });
  });

  describe('hasGeometricTransforms', () => {
    it('always returns false', async () => {
      const { hasGeometricTransforms } = await import(
        '../../src/modules/qr-generator/overlay-transforms'
      );
      expect(hasGeometricTransforms({} as Parameters<typeof hasGeometricTransforms>[0])).toBe(
        false
      );
      expect(
        hasGeometricTransforms({
          overlayRotation: 90,
          overlayFlipX: true,
        } as Parameters<typeof hasGeometricTransforms>[0])
      ).toBe(false);
    });
  });

  describe('applyGeometricTransforms', () => {
    it('returns canvas as-is when no transforms needed', async () => {
      const { applyGeometricTransforms } = await import(
        '../../src/modules/qr-generator/overlay-transforms'
      );
      const mockCanvas = { width: 100, height: 100 } as HTMLCanvasElement;
      const result = await applyGeometricTransforms(
        mockCanvas,
        {} as Parameters<typeof applyGeometricTransforms>[1],
        async (w: number, h: number) =>
          ({ width: w, height: h }) as unknown as HTMLCanvasElement
      );
      // Since hasGeometricTransforms always returns false, original canvas is returned
      expect(result).toBe(mockCanvas);
    });
  });
});

// ============================================================================
// temporal.ts tests
// ============================================================================

describe('dither-algorithms temporal.ts', () => {
  describe('calculateTemporalOffset', () => {
    async function getCalc() {
      const mod = await import('../../src/modules/dither-algorithms/temporal');
      return mod.calculateTemporalOffset;
    }

    it('returns 0 for mode=off', async () => {
      const fn = await getCalc();
      expect(fn(0, 'off')).toBe(0);
      expect(fn(5, 'off')).toBe(0);
      expect(fn(100, 'off')).toBe(0);
    });

    it('returns 0 for undefined/falsy mode', async () => {
      const fn = await getCalc();
      expect(fn(0, '' as 'off')).toBe(0);
    });

    it('returns golden-ratio-based offset for mode=blue_noise', async () => {
      const fn = await getCalc();
      const phi = 1.618033988749895;
      // Frame 0, seed 0
      expect(fn(0, 'blue_noise')).toBeCloseTo((0 * phi) % 1, 5);
      // Frame 1, seed 0
      expect(fn(1, 'blue_noise')).toBeCloseTo((1 * phi) % 1, 5);
      // Frame 5, seed 0
      expect(fn(5, 'blue_noise')).toBeCloseTo((5 * phi) % 1, 5);
    });

    it('incorporates seed for blue_noise mode', async () => {
      const fn = await getCalc();
      const phi = 1.618033988749895;
      const seed = 42;
      expect(fn(0, 'blue_noise', seed)).toBeCloseTo((0 * phi + seed * 0.1) % 1, 5);
    });

    it('returns safe offsets for mode=flicker_safe', async () => {
      const fn = await getCalc();
      // Frame 0 → 0
      expect(fn(0, 'flicker_safe')).toBeCloseTo(0, 5);
      // Frame 1 → 0.5
      expect(fn(1, 'flicker_safe')).toBeCloseTo(0.5, 5);
      // Frame 2 → 0.25
      expect(fn(2, 'flicker_safe')).toBeCloseTo(0.25, 5);
      // Frame 3 → 0.75
      expect(fn(3, 'flicker_safe')).toBeCloseTo(0.75, 5);
    });

    it('wraps around for flicker_safe frames > 16', async () => {
      const fn = await getCalc();
      // Frame 16 should wrap to index 0 → offset 0
      expect(fn(16, 'flicker_safe')).toBeCloseTo(0, 5);
      // Frame 17 should wrap to index 1 → offset 0.5
      expect(fn(17, 'flicker_safe')).toBeCloseTo(0.5, 5);
    });

    it('incorporates seed for flicker_safe mode', async () => {
      const fn = await getCalc();
      const seed = 100;
      // Frame 0 with seed → (0 + 100*0.01) % 1 = 1.0 % 1 = 0
      expect(fn(0, 'flicker_safe', seed)).toBeCloseTo(0, 5);
    });

    it('returns value in [0, 1) range for all modes', async () => {
      const fn = await getCalc();
      for (let i = 0; i < 50; i++) {
        const bn = fn(i, 'blue_noise', 7);
        expect(bn).toBeGreaterThanOrEqual(0);
        expect(bn).toBeLessThan(1);
        const fs = fn(i, 'flicker_safe', 7);
        expect(fs).toBeGreaterThanOrEqual(0);
        expect(fs).toBeLessThan(1);
      }
    });
  });

  describe('generateTemporalSequence', () => {
    it('returns array of correct length', async () => {
      const { generateTemporalSequence } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      expect(generateTemporalSequence(5, 'blue_noise')).toHaveLength(5);
      expect(generateTemporalSequence(10, 'flicker_safe')).toHaveLength(10);
      expect(generateTemporalSequence(0, 'blue_noise')).toHaveLength(0);
    });

    it('elements match calculateTemporalOffset', async () => {
      const { generateTemporalSequence, calculateTemporalOffset } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      const seq = generateTemporalSequence(8, 'blue_noise', 42);
      for (let i = 0; i < 8; i++) {
        expect(seq[i]).toBe(calculateTemporalOffset(i, 'blue_noise', 42));
      }
    });

    it('all zeros for mode=off', async () => {
      const { generateTemporalSequence } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      const seq = generateTemporalSequence(5, 'off');
      expect(seq).toEqual([0, 0, 0, 0, 0]);
    });
  });

  describe('isTemporalDitherActive', () => {
    it('returns false for off', async () => {
      const { isTemporalDitherActive } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      expect(isTemporalDitherActive('off')).toBe(false);
    });

    it('returns true for blue_noise', async () => {
      const { isTemporalDitherActive } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      expect(isTemporalDitherActive('blue_noise')).toBe(true);
    });

    it('returns true for flicker_safe', async () => {
      const { isTemporalDitherActive } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      expect(isTemporalDitherActive('flicker_safe')).toBe(true);
    });
  });

  describe('temporalBlueNoiseDither', () => {
    it('produces correctly sized output', async () => {
      const { temporalBlueNoiseDither } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      const width = 8;
      const height = 8;
      // Create float data: each row is Float32Array of [r,g,b, r,g,b, ...]
      const imageData: Float32Array[] = [];
      for (let y = 0; y < height; y++) {
        const row = new Float32Array(width * 3);
        for (let x = 0; x < width; x++) {
          const gray = ((x + y) / (width + height)) * 255;
          row[x * 3] = gray;
          row[x * 3 + 1] = gray;
          row[x * 3 + 2] = gray;
        }
        imageData.push(row);
      }

      const result = temporalBlueNoiseDither(imageData, width, height, 0);
      expect(result.matrix).toHaveLength(height);
      expect(result.matrix[0]).toHaveLength(width);
      expect(result.colors).toHaveLength(height);
      expect(result.colors[0]).toHaveLength(width);
    });

    it('uses frame offset for temporal variation', async () => {
      const { temporalBlueNoiseDither } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      // Input data must be in [0, 1] range (matching imageDataToFloat output).
      // Use a gradient from 0.25 to 0.75 to ensure threshold crossings differ.
      const width = 16;
      const height = 16;
      const imageData: Float32Array[] = [];
      for (let y = 0; y < height; y++) {
        const row = new Float32Array(width * 3);
        for (let x = 0; x < width; x++) {
          const normalized = 0.25 + ((x + y * width) / (width * height)) * 0.5;
          row[x * 3] = normalized;
          row[x * 3 + 1] = normalized;
          row[x * 3 + 2] = normalized;
        }
        imageData.push(row);
      }

      const frame0 = temporalBlueNoiseDither(imageData, width, height, 0, 16, 0);
      const frame10 = temporalBlueNoiseDither(imageData, width, height, 10, 16, 0);
      const flat0 = frame0.matrix.flat();
      const flat10 = frame10.matrix.flat();
      let differs = false;
      for (let i = 0; i < flat0.length; i++) {
        if (flat0[i] !== flat10[i]) {
          differs = true;
          break;
        }
      }
      expect(differs).toBe(true);
    });

    it('respects tileSize and seed parameters', async () => {
      const { temporalBlueNoiseDither } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      const width = 4;
      const height = 4;
      const imageData: Float32Array[] = [];
      for (let y = 0; y < height; y++) {
        const row = new Float32Array(width * 3);
        row.fill(100);
        imageData.push(row);
      }
      // Should not throw with custom tileSize and seed
      const result = temporalBlueNoiseDither(imageData, width, height, 0, 32, 99);
      expect(result.matrix).toHaveLength(height);
    });

    it('produces dark/light output colors', async () => {
      const { temporalBlueNoiseDither } = await import(
        '../../src/modules/dither-algorithms/temporal'
      );
      const width = 4;
      const height = 4;
      const imageData: Float32Array[] = [];
      for (let y = 0; y < height; y++) {
        const row = new Float32Array(width * 3);
        row.fill(128);
        imageData.push(row);
      }
      const result = temporalBlueNoiseDither(imageData, width, height, 0);
      // Colors should be either black or white
      for (const row of result.colors) {
        for (const c of row) {
          expect(c.r === 0 || c.r === 255).toBe(true);
          expect(c.g === 0 || c.g === 255).toBe(true);
          expect(c.b === 0 || c.b === 255).toBe(true);
        }
      }
    });
  });
});

// ============================================================================
// decimation.ts tests
// ============================================================================

describe('animation decimation.ts', () => {
  interface AnimFrame {
    delay: number;
  }

  interface MockCompositor {
    frameCount: number;
    delayMs: (i: number) => number;
  }

  describe('calculateSourceFps', () => {
    it('returns 10 for empty frames', async () => {
      const { calculateSourceFps } = await import('../../src/modules/animation/decimation');
      expect(calculateSourceFps([])).toBe(10);
    });

    it('calculates correct FPS from frame delays', async () => {
      const { calculateSourceFps } = await import('../../src/modules/animation/decimation');
      // 10 frames × 100ms delay each = 1000ms total, 100ms avg → 10 FPS
      const frames: AnimFrame[] = Array.from({ length: 10 }, () => ({ delay: 100 }));
      expect(calculateSourceFps(frames)).toBe(10);
    });

    it('handles mixed delays', async () => {
      const { calculateSourceFps } = await import('../../src/modules/animation/decimation');
      // 2 frames: 50ms + 150ms = 200ms total, 100ms avg → 10 FPS
      const frames: AnimFrame[] = [{ delay: 50 }, { delay: 150 }];
      expect(calculateSourceFps(frames)).toBe(10);
    });

    it('handles default delay (100ms) for undefined delay', async () => {
      const { calculateSourceFps } = await import('../../src/modules/animation/decimation');
      // delay is OR'd with 100: (f.delay || 100)
      const frames = [{ delay: 0 }, { delay: 0 }];
      // 0 is falsy, so each frame gets delay 100 → avg 100 → 10 FPS
      expect(calculateSourceFps(frames as AnimFrame[])).toBe(10);
    });
  });

  describe('calculateCompositorFps', () => {
    it('returns 10 for empty compositor', async () => {
      const { calculateCompositorFps } = await import('../../src/modules/animation/decimation');
      const compositor: MockCompositor = { frameCount: 0, delayMs: () => 100 };
      expect(calculateCompositorFps(compositor)).toBe(10);
    });

    it('calculates correct FPS', async () => {
      const { calculateCompositorFps } = await import('../../src/modules/animation/decimation');
      const compositor: MockCompositor = {
        frameCount: 5,
        delayMs: () => 50, // 50ms per frame → 20 FPS
      };
      expect(calculateCompositorFps(compositor)).toBe(20);
    });
  });

  describe('decimateCompositorFrames', () => {
    it('returns all frames for single frame', async () => {
      const { decimateCompositorFrames } = await import('../../src/modules/animation/decimation');
      const compositor: MockCompositor = { frameCount: 1, delayMs: () => 100 };
      expect(decimateCompositorFrames(compositor, 10)).toEqual([0]);
    });

    it('returns all frames when targetFps <= 0', async () => {
      const { decimateCompositorFrames } = await import('../../src/modules/animation/decimation');
      const compositor: MockCompositor = { frameCount: 5, delayMs: () => 100 };
      expect(decimateCompositorFrames(compositor, 0)).toEqual([0, 1, 2, 3, 4]);
      expect(decimateCompositorFrames(compositor, -1)).toEqual([0, 1, 2, 3, 4]);
    });

    it('returns all frames when source FPS <= target FPS', async () => {
      const { decimateCompositorFrames } = await import('../../src/modules/animation/decimation');
      // Source: 100ms per frame → 10 FPS, target 20 FPS → keep all
      const compositor: MockCompositor = { frameCount: 5, delayMs: () => 100 };
      expect(decimateCompositorFrames(compositor, 20)).toEqual([0, 1, 2, 3, 4]);
    });

    it('decimates when source FPS > target FPS', async () => {
      const { decimateCompositorFrames } = await import('../../src/modules/animation/decimation');
      // Source: 50ms per frame → 20 FPS, target 10 FPS → keep ~half
      const compositor: MockCompositor = { frameCount: 10, delayMs: () => 50 };
      const result = decimateCompositorFrames(compositor, 10);
      expect(result.length).toBeLessThan(10);
      // First and last frames should be included
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(9);
    });

    it('always includes first and last frame', async () => {
      const { decimateCompositorFrames } = await import('../../src/modules/animation/decimation');
      const compositor: MockCompositor = { frameCount: 20, delayMs: () => 10 }; // 100 FPS
      const result = decimateCompositorFrames(compositor, 5); // target 5 FPS
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
    });
  });

  describe('decimateFramesToFps', () => {
    it('returns all indices for single frame', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      const frames: AnimFrame[] = [{ delay: 100 }];
      expect(decimateFramesToFps(frames, 10)).toEqual([0]);
    });

    it('returns all indices for empty frames', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      expect(decimateFramesToFps([], 10)).toEqual([]);
    });

    it('returns all indices when targetFps <= 0', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      const frames: AnimFrame[] = [{ delay: 100 }, { delay: 100 }, { delay: 100 }];
      expect(decimateFramesToFps(frames, 0)).toEqual([0, 1, 2]);
    });

    it('returns all indices when source FPS <= target FPS', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      const frames: AnimFrame[] = Array.from({ length: 5 }, () => ({ delay: 100 }));
      // Source 10 FPS, target 20 → keep all
      expect(decimateFramesToFps(frames, 20)).toEqual([0, 1, 2, 3, 4]);
    });

    it('decimates when source > target', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      // 10 frames at 50ms = 20 FPS, target 10 FPS → ~half
      const frames: AnimFrame[] = Array.from({ length: 10 }, () => ({ delay: 50 }));
      const result = decimateFramesToFps(frames, 10);
      expect(result.length).toBeLessThan(10);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(9);
    });

    it('always includes first and last frame when decimating', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      const frames: AnimFrame[] = Array.from({ length: 20 }, () => ({ delay: 10 }));
      const result = decimateFramesToFps(frames, 5);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
    });

    it('adds first frame if not already included', async () => {
      const { decimateFramesToFps } = await import('../../src/modules/animation/decimation');
      // 20 frames at 25ms = 40fps, decimate to 10fps → ratio=4, keeps ~5 frames
      const frames: AnimFrame[] = Array.from({ length: 20 }, () => ({ delay: 25 }));
      const result = decimateFramesToFps(frames, 10);
      expect(result[0]).toBe(0);
      expect(result[result.length - 1]).toBe(19);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  });
});
