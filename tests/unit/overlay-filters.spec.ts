import { beforeEach, describe, expect, it, vi } from 'vitest';

const trace = vi.fn();
vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace, debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('../../src/infra/logging/logger', () => ({
  createLogger: () => ({ trace, debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

function mkImageData(px: number[], width = 2, height = 2): ImageData {
  return new (globalThis as any).ImageData(new Uint8ClampedArray(px), width, height);
}

describe('overlay filters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as any).ImageData = class {
      data: Uint8ClampedArray;
      width: number;
      height: number;
      constructor(data: Uint8ClampedArray, width: number, height: number) {
        this.data = data;
        this.width = width;
        this.height = height;
      }
    };
  });

  it('runs basic pixel filters and copy helper', async () => {
    const mod = await import('../../src/modules/overlay/overlay-filters');

    const base = mkImageData([
      10, 20, 30, 255, 220, 210, 200, 255, 40, 60, 80, 255, 120, 140, 160, 255,
    ]);

    const copy = mod.copyImageData(base);
    expect(copy).not.toBe(base);
    expect(Array.from(copy.data)).toEqual(Array.from(base.data));

    expect(mod.brightness(mod.copyImageData(base), 20).data[0]).toBeGreaterThan(base.data[0]);
    expect(mod.contrast(mod.copyImageData(base), 100).data[0]).not.toBe(base.data[0]);
    expect(mod.saturation(mod.copyImageData(base), 0).data[0]).toBeLessThanOrEqual(255);
    expect(mod.hueRotate(mod.copyImageData(base), -45).data[0]).toBeLessThanOrEqual(255);
    expect(mod.gamma(mod.copyImageData(base), 2).data[0]).toBeLessThanOrEqual(255);

    const inv = mod.invert(mod.copyImageData(base));
    expect(inv.data[0]).toBe(245);

    const gray = mod.grayscale(mod.copyImageData(base));
    expect(gray.data[0]).toBe(gray.data[1]);

    const th = mod.threshold(mod.copyImageData(base), 100);
    expect([0, 255]).toContain(th.data[0]);

    const post = mod.posterize(mod.copyImageData(base), 3);
    expect(post.data[0] % Math.round(255 / 2)).toBeLessThanOrEqual(1);

    const duo = mod.duotone(
      mod.copyImageData(base),
      { r: 255, g: 200, b: 100 },
      { r: 0, g: 10, b: 20 }
    );
    expect(duo.data[0]).toBeGreaterThanOrEqual(0);
  });

  it('runs convolution-based filters and edge detection', async () => {
    const mod = await import('../../src/modules/overlay/overlay-filters');

    const img3 = mkImageData(
      [
        0, 0, 0, 255, 20, 20, 20, 255, 40, 40, 40, 255, 60, 60, 60, 255, 80, 80, 80, 255, 100, 100,
        100, 255, 120, 120, 120, 255, 180, 180, 180, 255, 255, 255, 255, 255,
      ],
      3,
      3
    );

    const conv = mod.convolve(mod.copyImageData(img3), [
      [-1, 0, 1],
      [-1, 0, 1],
      [-1, 0, 1],
    ]);
    expect(conv.data[0]).toBeLessThanOrEqual(255);

    expect(mod.sharpen(mod.copyImageData(img3), 1).data[0]).toBeLessThanOrEqual(255);
    expect(mod.blur(mod.copyImageData(img3), 1).data[0]).toBeLessThanOrEqual(255);
    expect(mod.gaussianBlur(mod.copyImageData(img3), 2).data[0]).toBeLessThanOrEqual(255);
    expect(mod.emboss(mod.copyImageData(img3)).data[0]).toBeLessThanOrEqual(255);

    const sobel = mod.sobelEdge(mod.copyImageData(img3));
    expect(sobel.data[4 * 4]).toBeGreaterThanOrEqual(0);

    const canny = mod.cannyEdge(mod.copyImageData(img3), 10, 30);
    expect([0, 128, 255]).toContain(canny.data[4 * 4]);
  });

  it('builds maps, applies color modes, and runs filter pipeline options', async () => {
    const mod = await import('../../src/modules/overlay/overlay-filters');

    const base = mkImageData([
      10, 50, 200, 255, 250, 240, 230, 255, 30, 60, 90, 255, 100, 130, 160, 255,
    ]);

    const bmap = mod.getBrightnessMap(base);
    expect(bmap.length).toBe(4);
    expect(bmap[0]).toBeGreaterThanOrEqual(0);

    const rgb = mod.getRGBMap(base);
    expect(rgb.r.length).toBe(4);
    expect(rgb.g[1]).toBeLessThanOrEqual(1);

    const color = mod.applyColorMode(mod.copyImageData(base), 'color');
    expect(Array.from(color.data)).toEqual(Array.from(base.data));

    const bw = mod.applyColorMode(mod.copyImageData(base), 'bw');
    expect([0, 255]).toContain(bw.data[0]);

    const gs = mod.applyColorMode(mod.copyImageData(base), 'grayscale');
    expect(gs.data[0]).toBe(gs.data[1]);

    const piped = mod.applyFilters(base, {
      brightness: 10,
      contrast: 20,
      saturation: 80,
      hue: 30,
      gamma: 1.2,
      invert: true,
      grayscale: true,
      threshold: 120,
      posterize: 4,
      sharpen: 1,
      blur: 1,
      duotone: { light: { r: 255, g: 255, b: 255 }, dark: { r: 0, g: 0, b: 0 } },
      colorMode: 'bw',
    });

    expect(piped.data.length).toBe(base.data.length);
    expect(trace).toHaveBeenCalled();

    const unchanged = mod.applyFilters(base, {
      brightness: 0,
      contrast: 0,
      saturation: 100,
      hue: 0,
      gamma: 1,
      posterize: 0,
      sharpen: 0,
      blur: 0,
    });
    expect(unchanged.data.length).toBe(base.data.length);
  });
});
