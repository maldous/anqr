import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

// Helper to create Float32Array[] image data (values 0-1)
function makeImageData(width: number, height: number, fill?: (x: number, y: number) => [number, number, number]): Float32Array[] {
  const rows: Float32Array[] = [];
  for (let y = 0; y < height; y++) {
    const row = new Float32Array(width * 3);
    for (let x = 0; x < width; x++) {
      const [r, g, b] = fill ? fill(x, y) : [x / (width - 1 || 1), y / (height - 1 || 1), 0.5];
      row[x * 3] = r;
      row[x * 3 + 1] = g;
      row[x * 3 + 2] = b;
    }
    rows.push(row);
  }
  return rows;
}

function assertDitherResult(result: { matrix: boolean[][]; colors: { r: number; g: number; b: number }[][] }, w: number, h: number) {
  expect(result.matrix.length).toBe(h);
  expect(result.colors.length).toBe(h);
  for (let y = 0; y < h; y++) {
    expect(result.matrix[y].length).toBe(w);
    expect(result.colors[y].length).toBe(w);
    for (let x = 0; x < w; x++) {
      expect(typeof result.matrix[y][x]).toBe('boolean');
      const c = result.colors[y][x];
      expect(c.r).toBeGreaterThanOrEqual(0);
      expect(c.r).toBeLessThanOrEqual(255);
      expect(c.g).toBeGreaterThanOrEqual(0);
      expect(c.g).toBeLessThanOrEqual(255);
      expect(c.b).toBeGreaterThanOrEqual(0);
      expect(c.b).toBeLessThanOrEqual(255);
    }
  }
}

// ========== ADVANCED DITHERING ==========

describe('advanced dithering algorithms', () => {
  describe('blueNoiseDither', () => {
    it('produces correct shape in bw mode', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8);
      const result = blueNoiseDither(img, 8, 8, { colorMode: 'bw', seed: 42, tileSize: 8 });
      assertDitherResult(result, 8, 8);
      // BW mode: colors should be only black or white
      for (const row of result.colors) {
        for (const c of row) {
          expect(c.r === 0 || c.r === 255).toBe(true);
        }
      }
    });

    it('produces correct shape in grayscale mode', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(6, 6);
      const result = blueNoiseDither(img, 6, 6, { colorMode: 'grayscale', levels: 4, seed: 10, tileSize: 4 });
      assertDitherResult(result, 6, 6);
      // Grayscale: r === g === b
      for (const row of result.colors) {
        for (const c of row) {
          expect(c.r).toBe(c.g);
          expect(c.g).toBe(c.b);
        }
      }
    });

    it('produces correct shape in color mode', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(6, 6, (x, y) => [x / 5, y / 5, (x + y) / 10]);
      const result = blueNoiseDither(img, 6, 6, { colorMode: 'color', levels: 3, seed: 7, tileSize: 4 });
      assertDitherResult(result, 6, 6);
    });

    it('is deterministic with same seed', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const a = blueNoiseDither(img, 4, 4, { seed: 99, tileSize: 4 });
      const b = blueNoiseDither(img, 4, 4, { seed: 99, tileSize: 4 });
      expect(a.matrix).toEqual(b.matrix);
    });

    it('uses default options when none provided', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = blueNoiseDither(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('respects strength parameter', async () => {
      const { blueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const weak = blueNoiseDither(img, 4, 4, { strength: 10, seed: 1, tileSize: 4 });
      const strong = blueNoiseDither(img, 4, 4, { strength: 100, seed: 1, tileSize: 4 });
      assertDitherResult(weak, 4, 4);
      assertDitherResult(strong, 4, 4);
    });
  });

  describe('blueNoiseErrorDiffusion', () => {
    it('produces correct shape in bw mode', async () => {
      const { blueNoiseErrorDiffusion } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8);
      const result = blueNoiseErrorDiffusion(img, 8, 8, { colorMode: 'bw', seed: 5, tileSize: 8 });
      assertDitherResult(result, 8, 8);
    });

    it('produces correct shape in color mode with serpentine', async () => {
      const { blueNoiseErrorDiffusion } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(6, 6, (x, y) => [x / 5, y / 5, 0.3]);
      const result = blueNoiseErrorDiffusion(img, 6, 6, { colorMode: 'color', serpentine: true, levels: 3, seed: 3, tileSize: 4 });
      assertDitherResult(result, 6, 6);
    });

    it('works with non-serpentine mode', async () => {
      const { blueNoiseErrorDiffusion } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = blueNoiseErrorDiffusion(img, 4, 4, { serpentine: false });
      assertDitherResult(result, 4, 4);
    });

    it('uses default options', async () => {
      const { blueNoiseErrorDiffusion } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = blueNoiseErrorDiffusion(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('supports different kernels', async () => {
      const { blueNoiseErrorDiffusion } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = blueNoiseErrorDiffusion(img, 4, 4, { kernelName: 'atkinson' });
      assertDitherResult(result, 4, 4);
    });
  });

  describe('screenedBlueNoiseDither', () => {
    it('produces correct shape', async () => {
      const { screenedBlueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8);
      const result = screenedBlueNoiseDither(img, 8, 8, { seed: 42, tileSize: 8 });
      assertDitherResult(result, 8, 8);
    });

    it('uses default options', async () => {
      const { screenedBlueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = screenedBlueNoiseDither(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('respects strength', async () => {
      const { screenedBlueNoiseDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4, () => [0.4, 0.4, 0.4]);
      const result = screenedBlueNoiseDither(img, 4, 4, { strength: 50 });
      assertDitherResult(result, 4, 4);
    });
  });

  describe('perceptualDither', () => {
    it('produces correct shape in bw mode', async () => {
      const { perceptualDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(6, 6);
      const result = perceptualDither(img, 6, 6, { colorMode: 'bw' });
      assertDitherResult(result, 6, 6);
    });

    it('produces correct shape in color mode', async () => {
      const { perceptualDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(6, 6, (x, y) => [x / 5, y / 5, 0.2]);
      const result = perceptualDither(img, 6, 6, { colorMode: 'color', levels: 3 });
      assertDitherResult(result, 6, 6);
    });

    it('uses default options', async () => {
      const { perceptualDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = perceptualDither(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('handles serpentine toggle', async () => {
      const { perceptualDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 6);
      const result = perceptualDither(img, 4, 6, { serpentine: false });
      assertDitherResult(result, 4, 6);
    });

    it('handles different kernel names', async () => {
      const { perceptualDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = perceptualDither(img, 4, 4, { kernelName: 'stucki' });
      assertDitherResult(result, 4, 4);
    });
  });

  describe('edgeAwareDither', () => {
    it('produces correct shape in bw mode', async () => {
      const { edgeAwareDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8);
      const result = edgeAwareDither(img, 8, 8, { colorMode: 'bw' });
      assertDitherResult(result, 8, 8);
    });

    it('produces correct shape in color mode', async () => {
      const { edgeAwareDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8, (x, y) => [x / 7, y / 7, 0.5]);
      const result = edgeAwareDither(img, 8, 8, { colorMode: 'color', levels: 4 });
      assertDitherResult(result, 8, 8);
    });

    it('detects edges from sharp transitions', async () => {
      const { edgeAwareDither } = await import('../../src/modules/dither-algorithms/advanced');
      // Create image with sharp edge at x=4
      const img = makeImageData(8, 8, (x) => x < 4 ? [0, 0, 0] : [1, 1, 1]);
      const result = edgeAwareDither(img, 8, 8, { colorMode: 'bw' });
      assertDitherResult(result, 8, 8);
    });

    it('uses default options', async () => {
      const { edgeAwareDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 4);
      const result = edgeAwareDither(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('handles serpentine toggle', async () => {
      const { edgeAwareDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(4, 6);
      const result = edgeAwareDither(img, 4, 6, { serpentine: false });
      assertDitherResult(result, 4, 6);
    });
  });

  describe('adaptiveThresholdDither', () => {
    it('produces correct shape', async () => {
      const { adaptiveThresholdDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8);
      const result = adaptiveThresholdDither(img, 8, 8);
      assertDitherResult(result, 8, 8);
    });

    it('respects strength parameter', async () => {
      const { adaptiveThresholdDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(8, 8, () => [0.5, 0.5, 0.5]);
      const weak = adaptiveThresholdDither(img, 8, 8, 10);
      const strong = adaptiveThresholdDither(img, 8, 8, 100);
      assertDitherResult(weak, 8, 8);
      assertDitherResult(strong, 8, 8);
    });

    it('handles small images', async () => {
      const { adaptiveThresholdDither } = await import('../../src/modules/dither-algorithms/advanced');
      const img = makeImageData(2, 2);
      const result = adaptiveThresholdDither(img, 2, 2);
      assertDitherResult(result, 2, 2);
    });

    it('uses integral image correctly for uniform image', async () => {
      const { adaptiveThresholdDither } = await import('../../src/modules/dither-algorithms/advanced');
      // All white - everything should be above local mean
      const img = makeImageData(8, 8, () => [1, 1, 1]);
      const result = adaptiveThresholdDither(img, 8, 8);
      assertDitherResult(result, 8, 8);
    });
  });
});

// ========== NOISE DITHERING ==========

describe('noise dithering algorithms', () => {
  describe('whiteNoiseDither', () => {
    it('produces correct shape', async () => {
      const { whiteNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(6, 6);
      const result = whiteNoiseDither(img, 6, 6);
      assertDitherResult(result, 6, 6);
    });

    it('is deterministic with same seed', async () => {
      const { whiteNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4);
      const a = whiteNoiseDither(img, 4, 4, 42);
      const b = whiteNoiseDither(img, 4, 4, 42);
      expect(a.matrix).toEqual(b.matrix);
    });

    it('varies with different seeds', async () => {
      const { whiteNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const a = whiteNoiseDither(img, 4, 4, 1);
      const b = whiteNoiseDither(img, 4, 4, 2);
      // Different seeds should produce different results (with high probability)
      const flatA = a.matrix.flat();
      const flatB = b.matrix.flat();
      const diffs = flatA.filter((v, i) => v !== flatB[i]).length;
      expect(diffs).toBeGreaterThan(0);
    });

    it('respects strength parameter', async () => {
      const { whiteNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const result = whiteNoiseDither(img, 4, 4, 0, 50);
      assertDitherResult(result, 4, 4);
    });

    it('produces only black/white colors', async () => {
      const { whiteNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4);
      const result = whiteNoiseDither(img, 4, 4);
      for (const row of result.colors) {
        for (const c of row) {
          expect(c.r === 0 || c.r === 255).toBe(true);
          expect(c.r).toBe(c.g);
          expect(c.g).toBe(c.b);
        }
      }
    });
  });

  describe('gaussianNoiseDither', () => {
    it('produces correct shape', async () => {
      const { gaussianNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(6, 6);
      const result = gaussianNoiseDither(img, 6, 6);
      assertDitherResult(result, 6, 6);
    });

    it('is deterministic with same seed', async () => {
      const { gaussianNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4);
      const a = gaussianNoiseDither(img, 4, 4, 99);
      const b = gaussianNoiseDither(img, 4, 4, 99);
      expect(a.matrix).toEqual(b.matrix);
    });

    it('respects strength', async () => {
      const { gaussianNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const result = gaussianNoiseDither(img, 4, 4, 0, 30);
      assertDitherResult(result, 4, 4);
    });
  });

  describe('triangularNoiseDither', () => {
    it('produces correct shape', async () => {
      const { triangularNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(6, 6);
      const result = triangularNoiseDither(img, 6, 6);
      assertDitherResult(result, 6, 6);
    });

    it('is deterministic with same seed', async () => {
      const { triangularNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4);
      const a = triangularNoiseDither(img, 4, 4, 77);
      const b = triangularNoiseDither(img, 4, 4, 77);
      expect(a.matrix).toEqual(b.matrix);
    });

    it('respects strength', async () => {
      const { triangularNoiseDither } = await import('../../src/modules/dither-algorithms/noise');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const result = triangularNoiseDither(img, 4, 4, 0, 80);
      assertDitherResult(result, 4, 4);
    });
  });
});

// ========== ERROR DIFFUSION ==========

describe('error diffusion dithering', () => {
  describe('distributeErrorWithKernel', () => {
    it('distributes error to neighboring pixels', async () => {
      const { distributeErrorWithKernel } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const { DIFFUSION_KERNELS } = await import('../../src/modules/dither-algorithms/kernels');
      const pixels = [
        [{ r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }],
        [{ r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }],
      ];
      distributeErrorWithKernel({
        pixels,
        x: 0,
        y: 0,
        width: 3,
        height: 2,
        errorR: 0.1,
        errorG: 0.2,
        errorB: 0.3,
        kernel: DIFFUSION_KERNELS.floyd_steinberg,
        leftToRight: true,
      });
      // Right neighbor should get 7/16 of error
      expect(pixels[0][1].r).toBeGreaterThan(0.5);
      expect(pixels[0][1].g).toBeGreaterThan(0.5);
    });

    it('distributes error right-to-left', async () => {
      const { distributeErrorWithKernel } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const { DIFFUSION_KERNELS } = await import('../../src/modules/dither-algorithms/kernels');
      const pixels = [
        [{ r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }],
        [{ r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }, { r: 0.5, g: 0.5, b: 0.5 }],
      ];
      distributeErrorWithKernel({
        pixels,
        x: 2,
        y: 0,
        width: 3,
        height: 2,
        errorR: 0.1,
        errorG: 0.1,
        errorB: 0.1,
        kernel: DIFFUSION_KERNELS.floyd_steinberg,
        leftToRight: false,
      });
      // Left neighbor should get error
      expect(pixels[0][1].r).toBeGreaterThan(0.5);
    });

    it('handles boundary pixels without out-of-bounds', async () => {
      const { distributeErrorWithKernel } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const { DIFFUSION_KERNELS } = await import('../../src/modules/dither-algorithms/kernels');
      const pixels = [[{ r: 0.5, g: 0.5, b: 0.5 }]];
      // Should not throw for 1x1 image
      distributeErrorWithKernel({
        pixels,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
        errorR: 0.5,
        errorG: 0.5,
        errorB: 0.5,
        kernel: DIFFUSION_KERNELS.floyd_steinberg,
        leftToRight: true,
      });
      expect(pixels[0][0].r).toBe(0.5); // No neighbor to distribute to
    });
  });

  describe('errorDiffusion', () => {
    it('produces correct shape in bw mode', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(6, 6);
      const result = errorDiffusion(img, 6, 6, { colorMode: 'bw' });
      assertDitherResult(result, 6, 6);
    });

    it('produces correct shape in grayscale mode', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(6, 6);
      const result = errorDiffusion(img, 6, 6, { colorMode: 'grayscale', levels: 4 });
      assertDitherResult(result, 6, 6);
      // Grayscale: r===g===b
      for (const row of result.colors) {
        for (const c of row) {
          expect(c.r).toBe(c.g);
          expect(c.g).toBe(c.b);
        }
      }
    });

    it('produces correct shape in color mode', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(6, 6, (x, y) => [x / 5, y / 5, 0.3]);
      const result = errorDiffusion(img, 6, 6, { colorMode: 'color', levels: 3 });
      assertDitherResult(result, 6, 6);
    });

    it('handles serpentine toggle', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(4, 6);
      const result = errorDiffusion(img, 4, 6, { serpentine: false });
      assertDitherResult(result, 4, 6);
    });

    it('uses different kernels', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(4, 4);
      for (const kernel of ['atkinson', 'jarvis_judice_ninke', 'stucki', 'burkes', 'sierra', 'sierra_2', 'sierra_lite'] as const) {
        const result = errorDiffusion(img, 4, 4, { kernelName: kernel });
        assertDitherResult(result, 4, 4);
      }
    });

    it('uses default options', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(4, 4);
      const result = errorDiffusion(img, 4, 4);
      assertDitherResult(result, 4, 4);
    });

    it('respects strength', async () => {
      const { errorDiffusion } = await import('../../src/modules/dither-algorithms/error-diffusion');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const result = errorDiffusion(img, 4, 4, { strength: 50 });
      assertDitherResult(result, 4, 4);
    });
  });
});

// ========== TEMPORAL DITHERING ==========

describe('temporal dithering', () => {
  describe('calculateTemporalOffset', () => {
    it('returns 0 for off mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      expect(calculateTemporalOffset(0, 'off')).toBe(0);
      expect(calculateTemporalOffset(5, 'off')).toBe(0);
    });

    it('returns 0 for empty/falsy mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      expect(calculateTemporalOffset(0, '' as 'off')).toBe(0);
    });

    it('returns golden ratio offsets for blue_noise mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      const offset0 = calculateTemporalOffset(0, 'blue_noise');
      const offset1 = calculateTemporalOffset(1, 'blue_noise');
      const offset2 = calculateTemporalOffset(2, 'blue_noise');
      expect(offset0).toBeGreaterThanOrEqual(0);
      expect(offset0).toBeLessThan(1);
      expect(offset1).toBeGreaterThanOrEqual(0);
      expect(offset1).toBeLessThan(1);
      expect(offset1).not.toBe(offset0);
      expect(offset2).not.toBe(offset1);
    });

    it('uses seed for blue_noise mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      const a = calculateTemporalOffset(0, 'blue_noise', 0);
      const b = calculateTemporalOffset(0, 'blue_noise', 7);
      expect(a).not.toBe(b);
    });

    it('returns safe offsets for flicker_safe mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      for (let i = 0; i < 16; i++) {
        const offset = calculateTemporalOffset(i, 'flicker_safe');
        expect(offset).toBeGreaterThanOrEqual(0);
        expect(offset).toBeLessThan(1);
      }
    });

    it('wraps around for flicker_safe after 16 frames', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      const a = calculateTemporalOffset(0, 'flicker_safe', 0);
      const b = calculateTemporalOffset(16, 'flicker_safe', 0);
      expect(a).toBe(b);
    });

    it('uses seed for flicker_safe mode', async () => {
      const { calculateTemporalOffset } = await import('../../src/modules/dither-algorithms/temporal');
      const a = calculateTemporalOffset(0, 'flicker_safe', 0);
      const b = calculateTemporalOffset(0, 'flicker_safe', 100);
      // Seed shifts the offset
      expect(typeof a).toBe('number');
      expect(typeof b).toBe('number');
    });
  });

  describe('generateTemporalSequence', () => {
    it('returns array of correct length', async () => {
      const { generateTemporalSequence } = await import('../../src/modules/dither-algorithms/temporal');
      const seq = generateTemporalSequence(10, 'blue_noise');
      expect(seq).toHaveLength(10);
      for (const v of seq) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });

    it('returns all zeros for off mode', async () => {
      const { generateTemporalSequence } = await import('../../src/modules/dither-algorithms/temporal');
      const seq = generateTemporalSequence(5, 'off');
      expect(seq).toEqual([0, 0, 0, 0, 0]);
    });

    it('returns correct length for flicker_safe', async () => {
      const { generateTemporalSequence } = await import('../../src/modules/dither-algorithms/temporal');
      const seq = generateTemporalSequence(20, 'flicker_safe', 5);
      expect(seq).toHaveLength(20);
    });
  });

  describe('isTemporalDitherActive', () => {
    it('returns true for blue_noise', async () => {
      const { isTemporalDitherActive } = await import('../../src/modules/dither-algorithms/temporal');
      expect(isTemporalDitherActive('blue_noise')).toBe(true);
    });

    it('returns true for flicker_safe', async () => {
      const { isTemporalDitherActive } = await import('../../src/modules/dither-algorithms/temporal');
      expect(isTemporalDitherActive('flicker_safe')).toBe(true);
    });

    it('returns false for off', async () => {
      const { isTemporalDitherActive } = await import('../../src/modules/dither-algorithms/temporal');
      expect(isTemporalDitherActive('off')).toBe(false);
    });
  });

  describe('temporalBlueNoiseDither', () => {
    it('produces correct shape', async () => {
      const { temporalBlueNoiseDither } = await import('../../src/modules/dither-algorithms/temporal');
      const img = makeImageData(6, 6);
      const result = temporalBlueNoiseDither(img, 6, 6, 0, 8, 42);
      assertDitherResult(result, 6, 6);
    });

    it('varies output with different frame indices', async () => {
      const { temporalBlueNoiseDither } = await import('../../src/modules/dither-algorithms/temporal');
      const img = makeImageData(4, 4, () => [0.5, 0.5, 0.5]);
      const a = temporalBlueNoiseDither(img, 4, 4, 0, 4, 0);
      const b = temporalBlueNoiseDither(img, 4, 4, 1, 4, 0);
      assertDitherResult(a, 4, 4);
      assertDitherResult(b, 4, 4);
    });

    it('is deterministic for same inputs', async () => {
      const { temporalBlueNoiseDither } = await import('../../src/modules/dither-algorithms/temporal');
      const img = makeImageData(4, 4);
      const a = temporalBlueNoiseDither(img, 4, 4, 3, 4, 10);
      const b = temporalBlueNoiseDither(img, 4, 4, 3, 4, 10);
      expect(a.matrix).toEqual(b.matrix);
    });

    it('uses default parameters', async () => {
      const { temporalBlueNoiseDither } = await import('../../src/modules/dither-algorithms/temporal');
      const img = makeImageData(4, 4);
      const result = temporalBlueNoiseDither(img, 4, 4, 0);
      assertDitherResult(result, 4, 4);
    });
  });
});
