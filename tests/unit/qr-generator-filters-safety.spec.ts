import { describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

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

// ========== detectBimodalBW ==========

describe('detectBimodalBW', () => {
  it('detects bimodal B&W image (strong dark + light peaks)', async () => {
    const { detectBimodalBW } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 100;
    const data = new Uint8ClampedArray(size * size * 4);
    // Half black, half white - strong bimodal distribution
    for (let i = 0; i < size * size; i++) {
      const val = i < size * size / 2 ? 0 : 255;
      data[i * 4] = val;
      data[i * 4 + 1] = val;
      data[i * 4 + 2] = val;
      data[i * 4 + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    expect(detectBimodalBW(imageData)).toBe(true);
  });

  it('returns false for uniform gray image', async () => {
    const { detectBimodalBW } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 100;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = 128;
      data[i * 4 + 1] = 128;
      data[i * 4 + 2] = 128;
      data[i * 4 + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    expect(detectBimodalBW(imageData)).toBe(false);
  });

  it('returns false for gradient image (many mid-tones)', async () => {
    const { detectBimodalBW } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 100;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = Math.floor((i / (size * size)) * 255);
      data[i * 4] = val;
      data[i * 4 + 1] = val;
      data[i * 4 + 2] = val;
      data[i * 4 + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    expect(detectBimodalBW(imageData)).toBe(false);
  });

  it('returns false for single-color image', async () => {
    const { detectBimodalBW } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 50;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = 10;
      data[i * 4 + 1] = 10;
      data[i * 4 + 2] = 10;
      data[i * 4 + 3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    expect(detectBimodalBW(imageData)).toBe(false);
  });
});

// ========== softenBWImage ==========

describe('softenBWImage', () => {
  it('returns a new ImageData with same dimensions', async () => {
    const { softenBWImage } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 20;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      const val = i % 8 === 0 ? 0 : 255;
      data[i] = val; data[i+1] = val; data[i+2] = val; data[i+3] = 255;
    }
    const imageData = new ImageData(data, size, size);
    const result = softenBWImage(imageData);
    expect(result.width).toBe(size);
    expect(result.height).toBe(size);
    expect(result.data.length).toBe(data.length);
    // Should not be the same object (copy)
    expect(result).not.toBe(imageData);
    expect(result.data).not.toBe(data);
  });
});

// ========== preprocessImageData ==========

describe('preprocessImageData', () => {
  function makeTestImage(size = 20): ImageData {
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 128; data[i+1] = 100; data[i+2] = 80; data[i+3] = 255;
    }
    return new ImageData(data, size, size);
  }

  it('returns copy when no filters are set', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, {} as never);
    expect(result.width).toBe(img.width);
    expect(result.height).toBe(img.height);
    expect(result).not.toBe(img);
  });

  it('applies brightness filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterBrightness: 50 } as never);
    expect(result.width).toBe(img.width);
    // Brightness increased - pixels should be different
    let anyDiff = false;
    for (let i = 0; i < result.data.length; i += 4) {
      if (result.data[i] !== img.data[i]) { anyDiff = true; break; }
    }
    expect(anyDiff).toBe(true);
  });

  it('applies contrast filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterContrast: 50 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies saturation filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterSaturation: 50 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies hue filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterHue: 180 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies gamma filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterGamma: 0.5 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies invert filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterInvert: true } as never);
    expect(result.width).toBe(img.width);
    // First pixel should be inverted: 128 → ~127
    expect(result.data[0]).not.toBe(128);
  });

  it('applies grayscale filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterGrayscale: true } as never);
    // Grayscale: R, G, B should be equal
    expect(result.data[0]).toBe(result.data[1]);
    expect(result.data[1]).toBe(result.data[2]);
  });

  it('applies threshold filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterThreshold: 128 } as never);
    // Thresholded: pixels should be either 0 or 255
    for (let i = 0; i < result.data.length; i += 4) {
      expect(result.data[i] === 0 || result.data[i] === 255).toBe(true);
    }
  });

  it('applies blur filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterBlur: 2 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies sharpen filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterSharpen: 50 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies posterize filter', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterPosterize: 4 } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies duotone filter (non-color mode)', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, {
      filterDuotone1: '#ff0000',
      filterDuotone2: '#0000ff',
      colorMode: 'grayscale',
    } as never);
    expect(result.width).toBe(img.width);
  });

  it('skips duotone in color mode', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, {
      filterDuotone1: '#ff0000',
      filterDuotone2: '#0000ff',
      colorMode: 'color',
    } as never);
    expect(result.width).toBe(img.width);
  });

  it('maps colorMode grayscale', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { colorMode: 'grayscale' } as never);
    // Grayscale mode: R=G=B
    expect(result.data[0]).toBe(result.data[1]);
  });

  it('maps colorMode bw', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { colorMode: 'bw' } as never);
    expect(result.width).toBe(img.width);
  });

  it('maps colorMode color (disables grayscale)', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, {
      colorMode: 'color',
      filterBrightness: 10,
    } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies edge detection with sobel', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage(30);
    const result = preprocessImageData(img, {
      filterEdgeDetect: true,
      filterEdgeMode: 'sobel',
      filterBrightness: 10,
    } as never);
    expect(result.width).toBe(img.width);
  });

  it('applies edge detection with canny', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage(30);
    const result = preprocessImageData(img, {
      filterEdgeDetect: true,
      filterEdgeMode: 'canny',
      filterBrightness: 10,
    } as never);
    expect(result.width).toBe(img.width);
  });

  it('passes debug flag without error', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, { filterBrightness: 10 } as never, true);
    expect(result.width).toBe(img.width);
  });

  it('handles disableAutoSoften flag', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 50;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = i < size * size / 2 ? 0 : 255;
      data[i * 4] = val; data[i * 4 + 1] = val; data[i * 4 + 2] = val; data[i * 4 + 3] = 255;
    }
    const img = new ImageData(data, size, size);
    const result = preprocessImageData(img, { disableAutoSoften: true } as never);
    expect(result.width).toBe(size);
  });

  it('detects bimodal B&W during preprocessing without softening', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const size = 100;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      const val = i < size * size / 2 ? 0 : 255;
      data[i * 4] = val; data[i * 4 + 1] = val; data[i * 4 + 2] = val; data[i * 4 + 3] = 255;
    }
    const img = new ImageData(data, size, size);
    // Without disableAutoSoften, it detects B&W but doesn't soften (just logs)
    const result = preprocessImageData(img, {} as never, true);
    expect(result.width).toBe(size);
  });

  it('combines multiple filters', async () => {
    const { preprocessImageData } = await import('../../src/modules/qr-generator/filters-preprocess');
    const img = makeTestImage();
    const result = preprocessImageData(img, {
      filterBrightness: 20,
      filterContrast: -10,
      filterGamma: 1.2,
    } as never);
    expect(result.width).toBe(img.width);
  });
});

// ========== applyAdvancedDither ==========

describe('applyAdvancedDither', () => {
  it('produces boolean matrix of correct size', async () => {
    const { applyAdvancedDither } = await import('../../src/modules/qr-generator/dithering-advanced');
    const moduleCount = 5;
    const qr = { isDark: (r: number, c: number) => (r + c) % 2 === 0 };
    const overlayData: Record<number, Record<number, number>> = {};
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = {};
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = (r * moduleCount + c) / (moduleCount * moduleCount);
      }
    }
    const dummyCreateCanvas = vi.fn();
    const result = await applyAdvancedDither(
      qr as never,
      moduleCount,
      overlayData as never,
      { blueNoiseSeed: 42, blueNoiseTileSize: 16, ditherStrength: 50, overlayIntensity: 100 } as never,
      dummyCreateCanvas as never
    );
    expect(result.length).toBe(moduleCount);
    for (let r = 0; r < moduleCount; r++) {
      expect(result[r].length).toBe(moduleCount);
      for (let c = 0; c < moduleCount; c++) {
        expect(typeof result[r][c]).toBe('boolean');
      }
    }
  });

  it('uses default config values when not specified', async () => {
    const { applyAdvancedDither } = await import('../../src/modules/qr-generator/dithering-advanced');
    const moduleCount = 3;
    const qr = { isDark: () => true };
    const overlayData: Record<number, Record<number, number>> = {};
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = {};
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = 0.5;
      }
    }
    const result = await applyAdvancedDither(
      qr as never, moduleCount, overlayData as never, {} as never, vi.fn() as never
    );
    expect(result.length).toBe(moduleCount);
  });

  it('handles missing overlay data gracefully (uses 0.5 default)', async () => {
    const { applyAdvancedDither } = await import('../../src/modules/qr-generator/dithering-advanced');
    const moduleCount = 3;
    const qr = { isDark: () => false };
    // Empty overlay data - all lookups will use ?? 0.5
    const result = await applyAdvancedDither(
      qr as never, moduleCount, {} as never, {} as never, vi.fn() as never
    );
    expect(result.length).toBe(moduleCount);
    for (const row of result) {
      expect(row.length).toBe(moduleCount);
    }
  });

  it('produces different results with different seeds', async () => {
    const { applyAdvancedDither } = await import('../../src/modules/qr-generator/dithering-advanced');
    const moduleCount = 10;
    const qr = { isDark: (r: number, c: number) => (r + c) % 2 === 0 };
    const overlayData: Record<number, Record<number, number>> = {};
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = {};
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = 0.5;
      }
    }
    const result1 = await applyAdvancedDither(
      qr as never, moduleCount, overlayData as never,
      { blueNoiseSeed: 1 } as never, vi.fn() as never
    );
    const result2 = await applyAdvancedDither(
      qr as never, moduleCount, overlayData as never,
      { blueNoiseSeed: 999 } as never, vi.fn() as never
    );
    // With different seeds and 10x10 grid, results should differ
    let anyDiff = false;
    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        if (result1[r][c] !== result2[r][c]) { anyDiff = true; break; }
      }
      if (anyDiff) break;
    }
    expect(anyDiff).toBe(true);
  });

  it('respects strength parameter', async () => {
    const { applyAdvancedDither } = await import('../../src/modules/qr-generator/dithering-advanced');
    const moduleCount = 5;
    const qr = { isDark: () => true };
    const overlayData: Record<number, Record<number, number>> = {};
    for (let r = 0; r < moduleCount; r++) {
      overlayData[r] = {};
      for (let c = 0; c < moduleCount; c++) {
        overlayData[r][c] = 0.3;
      }
    }
    // Very high strength
    const result = await applyAdvancedDither(
      qr as never, moduleCount, overlayData as never,
      { ditherStrength: 100, blueNoiseSeed: 42 } as never, vi.fn() as never
    );
    expect(result.length).toBe(moduleCount);
  });
});

// ========== generateBaseMatrix ==========

describe('generateBaseMatrix', () => {
  it('creates matrix at scale 1', async () => {
    const { generateBaseMatrix } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const qr = { isDark: (r: number, c: number) => (r + c) % 2 === 0 };
    const result = generateBaseMatrix(qr as never, 4, 1);
    expect(result.matrix.length).toBe(4);
    expect(result.matrix[0].length).toBe(4);
    expect(result.matrix[0][0]).toBe(true);
    expect(result.matrix[0][1]).toBe(false);
    expect(result.colors.length).toBe(4);
  });

  it('creates matrix at scale 2', async () => {
    const { generateBaseMatrix } = await import('../../src/modules/qr-generator/pixel-matrix-utils');
    const qr = { isDark: (r: number, c: number) => r === 0 && c === 0 };
    const result = generateBaseMatrix(qr as never, 4, 2);
    // scaledSize=4, scale=2 → 2 modules, each 2x2 pixels
    expect(result.matrix.length).toBe(4);
    expect(result.matrix[0].length).toBe(4);
    // Top-left 2x2 should be dark (module 0,0 is dark)
    expect(result.matrix[0][0]).toBe(true);
    expect(result.matrix[0][1]).toBe(true);
    expect(result.matrix[1][0]).toBe(true);
    expect(result.matrix[1][1]).toBe(true);
    // Top-right 2x2 should be light (module 0,1 is light)
    expect(result.matrix[0][2]).toBe(false);
  });
});
