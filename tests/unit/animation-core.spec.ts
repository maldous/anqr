// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

type MockCtx = {
  drawImage: ReturnType<typeof vi.fn>;
  fillRect: ReturnType<typeof vi.fn>;
  clearRect: ReturnType<typeof vi.fn>;
  getImageData: ReturnType<typeof vi.fn>;
  putImageData: ReturnType<typeof vi.fn>;
  createImageData: ReturnType<typeof vi.fn>;
  globalAlpha: number;
  fillStyle: string;
  _pixels: Uint8ClampedArray;
};

function makeMockCanvas(width = 2, height = 2, seedPixels?: number[]): HTMLCanvasElement {
  const pixels = new Uint8ClampedArray(
    seedPixels ?? [10, 20, 30, 255, 220, 210, 200, 255, 30, 30, 30, 255, 240, 240, 240, 255]
  );

  const ctx: MockCtx = {
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(ctx._pixels), width, height })),
    putImageData: vi.fn((img: ImageData | { data: Uint8ClampedArray }) => {
      const d = (img as any).data as Uint8ClampedArray;
      ctx._pixels = new Uint8ClampedArray(d);
    }),
    createImageData: vi.fn((w: number, h: number) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    globalAlpha: 1,
    fillStyle: '#000',
    _pixels: pixels,
  };

  return {
    width,
    height,
    getContext: vi.fn(() => ctx),
    _ctx: ctx,
  } as any;
}

function makeWebPBuffer(animatedChunk = false): ArrayBuffer {
  const bytes = new Uint8Array(32);
  bytes.set([82, 73, 70, 70], 0); // RIFF
  bytes.set([87, 69, 66, 80], 8); // WEBP
  if (animatedChunk) {
    bytes.set([65, 78, 73, 77], 12); // ANIM
    bytes[16] = 4; // chunk size
  }
  return bytes.buffer;
}

describe('animation core modules', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('detects GIF/WEBP and animated WEBP chunks', async () => {
    const mod = await import('../../src/modules/animation/format-detection');

    const gif = new Uint8Array([71, 73, 70, 56, 57, 97, 0, 0, 0, 0, 0, 0]).buffer;
    expect(mod.detectImageFormat(gif)).toBe('gif');

    const webp = makeWebPBuffer(false);
    expect(mod.detectImageFormat(webp)).toBe('webp');
    expect(mod.isAnimatedWebP(webp)).toBe(false);

    const animated = makeWebPBuffer(true);
    expect(mod.isAnimatedWebP(animated)).toBe(true);

    const tiny = new Uint8Array([1, 2, 3]).buffer;
    expect(mod.detectImageFormat(tiny)).toBe('unknown');
    expect(mod.isAnimatedWebP(tiny)).toBe(false);
  });

  it('advances animation state with loop/bounce/edge handling', async () => {
    const mod = await import('../../src/modules/animation/state');
    const frames = [{ canvas: makeMockCanvas(), delay: 10, disposalType: 0 }] as any[];

    const state = mod.createAnimationState(frames as any);
    expect(state.currentFrame).toBe(0);
    expect(state.direction).toBe(1);

    const manyFrames = [0, 1, 2].map(() => ({
      canvas: makeMockCanvas(),
      delay: 10,
      disposalType: 0,
    })) as any;
    const s1 = { ...state, frames: manyFrames, currentFrame: 2, direction: 1 as const };
    expect(mod.getNextFrame(s1, { loop: true, bounce: false, frameStep: 1 } as any)).toEqual({
      frameIndex: 0,
      direction: 1,
    });
    expect(mod.getNextFrame(s1, { loop: false, bounce: true, frameStep: 1 } as any)).toEqual({
      frameIndex: 1,
      direction: -1,
    });

    const s2 = { ...state, frames: manyFrames, currentFrame: 0, direction: -1 as const };
    expect(mod.getNextFrame(s2, { loop: true, bounce: false, frameStep: 1 } as any)).toEqual({
      frameIndex: 2,
      direction: -1,
    });
    expect(mod.getNextFrame(s2, { loop: false, bounce: false, frameStep: 1 } as any)).toEqual({
      frameIndex: 0,
      direction: -1,
    });

    const nowSpy = vi.spyOn(performance, 'now').mockReturnValue(1234);
    const advanced = mod.advanceAnimation(
      { ...s2, direction: 1 } as any,
      { loop: true, bounce: false, frameStep: 1 } as any
    );
    expect(advanced.currentFrame).toBe(1);
    expect(advanced.lastFrameTime).toBe(1234);
    nowSpy.mockRestore();
  });

  it('computes source/compositor fps and decimation indices', async () => {
    const mod = await import('../../src/modules/animation/decimation');

    expect(mod.calculateSourceFps([])).toBe(10);
    expect(mod.calculateSourceFps([{ delay: 50 }, { delay: 150 }] as any)).toBe(10);

    const compositor = {
      frameCount: 4,
      delayMs: (i: number) => [50, 50, 50, 50][i],
    } as any;
    expect(mod.calculateCompositorFps(compositor)).toBe(20);
    expect(mod.calculateCompositorFps({ frameCount: 0, delayMs: () => 0 } as any)).toBe(10);

    expect(mod.decimateCompositorFrames(compositor, 0)).toEqual([0, 1, 2, 3]);
    expect(mod.decimateCompositorFrames(compositor, 30)).toEqual([0, 1, 2, 3]);

    const keep = mod.decimateCompositorFrames(compositor, 8);
    expect(keep[0]).toBe(0);
    expect(keep[keep.length - 1]).toBe(3);

    expect(
      mod.decimateFramesToFps([{ delay: 50 }, { delay: 50 }, { delay: 50 }] as any, 0)
    ).toEqual([0, 1, 2]);
    expect(mod.decimateFramesToFps([{ delay: 300 }, { delay: 300 }] as any, 10)).toEqual([0, 1]);
  });

  it('applies pattern pixel transforms and easing variants', async () => {
    const mod = await import('../../src/modules/animation/shared-patterns');

    expect(mod.applyAnimationEasing(0.25, 'linear')).toBe(0.25);
    expect(mod.applyAnimationEasing(0.5, 'ease_in')).toBe(0.25);
    expect(mod.applyAnimationEasing(0.5, 'ease_out')).toBeCloseTo(0.75, 6);
    expect(mod.applyAnimationEasing(0.25, 'ease_in_out')).toBeCloseTo(0.125, 6);
    expect(mod.applyAnimationEasing(0.25, 'bounce')).toBeCloseTo(0.03125, 6);

    const base = new Uint8ClampedArray([
      20, 20, 20, 255, 240, 240, 240, 255, 30, 30, 30, 255, 200, 200, 200, 255,
    ]);

    const pulse = new Uint8ClampedArray(base);
    mod.applyAnimationPulse(pulse, 0.2, 3);
    expect(Array.from(pulse)).not.toEqual(Array.from(base));

    const wave = new Uint8ClampedArray(base);
    mod.applyAnimationWave(wave, 0.5, 2, 2, 5);
    expect(Array.from(wave)).not.toEqual(Array.from(base));

    const scanH = new Uint8ClampedArray(base);
    mod.applyAnimationScanline(scanH, 0.5, 2, 2, 2);
    expect(Array.from(scanH)).not.toEqual(Array.from(base));

    const scanV = new Uint8ClampedArray(base);
    mod.applyAnimationScanline(scanV, 0.5, 2, 2, 3);
    expect(Array.from(scanV)).not.toEqual(Array.from(base));

    const shimmer = new Uint8ClampedArray(10 * 10 * 4);
    for (let i = 0; i < shimmer.length; i += 4) {
      const v = (i / 4) % 2 === 0 ? 40 : 220;
      shimmer[i] = v;
      shimmer[i + 1] = v;
      shimmer[i + 2] = v;
      shimmer[i + 3] = 255;
    }
    const shimmerBefore = Array.from(shimmer);
    mod.applyAnimationShimmer(shimmer, 0.3, 10, 10, 7);
    expect(Array.from(shimmer)).not.toEqual(shimmerBefore);

    const drift = new Uint8ClampedArray(base);
    mod.applyAnimationDrift(drift, 0.7, 2, 2, 11);
    expect(Array.from(drift)).not.toEqual(Array.from(base));

    const cycle = new Uint8ClampedArray(base);
    mod.applyAnimationColorCycle(cycle, 0.4, 13);
    expect(Array.from(cycle)).not.toEqual(Array.from(base));
  });

  it('applies frame pattern effects for each pattern', async () => {
    const mod = await import('../../src/modules/animation/apply-animation-pattern');
    const source = makeMockCanvas(2, 2);

    expect(mod.applyAnimationPattern(source, 0, 4, 'none')).toBe(source);

    const originalCreate = document.createElement.bind(document);
    const canvases: HTMLCanvasElement[] = [];
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const c = makeMockCanvas(2, 2) as any;
        canvases.push(c);
        return c;
      }
      return originalCreate(tag as any);
    }) as any);

    const patterns: Array<'pulse' | 'wave' | 'scanline' | 'shimmer' | 'drift'> = [
      'pulse',
      'wave',
      'scanline',
      'shimmer',
      'drift',
    ];
    for (const p of patterns) {
      const out = mod.applyAnimationPattern(source, 1, 5, p, { seed: 9 } as any);
      expect(out).not.toBe(source);
    }

    // unknown pattern hits default draw path
    const fallback = mod.applyAnimationPattern(source, 1, 5, 'unknown' as any, { seed: 1 } as any);
    expect(fallback).toBe(canvases[canvases.length - 1]);

    createSpy.mockRestore();
  });

  it('applies color cycle and interpolate modes including fallbacks', async () => {
    const cycleMod = await import('../../src/modules/animation/color-cycle');
    const interpMod = await import('../../src/modules/animation/interpolate-frames');

    const source = makeMockCanvas(2, 2);

    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeMockCanvas(2, 2) as any;
      return originalCreate(tag as any);
    }) as any);

    const cycled = cycleMod.applyColorCycle(source, 1, 5);
    expect(cycled).not.toBe(source);

    const none = interpMod.interpolateFrames(source, makeMockCanvas(2, 2), 0, 'none');
    expect(none).toBe(source);

    const t1 = interpMod.interpolateFrames(source, makeMockCanvas(2, 2), 1, 'crossfade');
    expect(t1.width).toBe(2);

    const cross = interpMod.interpolateFrames(source, makeMockCanvas(2, 2), 0.4, 'crossfade');
    expect(cross.width).toBe(2);

    const morph = interpMod.interpolateFrames(source, makeMockCanvas(2, 2), 0.5, 'morph');
    expect(morph.width).toBe(2);

    const bad = makeMockCanvas(2, 2);
    (bad as any).getContext = vi.fn(() => null);
    const fallbackMorph = interpMod.interpolateFrames(bad, makeMockCanvas(2, 2), 0.5, 'morph');
    expect(fallbackMorph.width).toBe(2);

    createSpy.mockRestore();
  });

  it('keeps animation API manifest aligned with module exports', async () => {
    const api = await import('../../src/modules/animation/api');
    const index = await import('../../src/modules/animation');

    const declared = new Set(api.PUBLIC_API as readonly string[]);
    for (const name of declared) {
      expect(index).toHaveProperty(name);
    }

    expect(api.TYPES).toContain('AnimationFrame');
    expect(api.FORMAT_DETECTION_API).toEqual(['detectImageFormat', 'isAnimatedWebP']);
  });
});
