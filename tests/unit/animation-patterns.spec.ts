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
  getImageData: ReturnType<typeof vi.fn>;
  putImageData: ReturnType<typeof vi.fn>;
  _pixels: Uint8ClampedArray;
};

function makeCanvas(width = 2, height = 2, withCtx = true, pixels?: number[]): HTMLCanvasElement {
  const px = new Uint8ClampedArray(
    pixels ?? [20, 30, 40, 255, 200, 180, 160, 255, 50, 60, 70, 255, 150, 140, 130, 255]
  );
  const ctx: MockCtx = {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(ctx._pixels), width, height })),
    putImageData: vi.fn((img: any) => {
      ctx._pixels = new Uint8ClampedArray(img.data);
    }),
    _pixels: px,
  };
  return {
    width,
    height,
    getContext: vi.fn(() => (withCtx ? ctx : null)),
    _ctx: ctx,
  } as any;
}

describe('animation-patterns', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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

  it('generates single copy for none or frameCount<=1', async () => {
    const mod = await import('../../src/modules/animation/animation-patterns');
    const source = makeCanvas(2, 2);

    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(2, 2) as any;
      return originalCreate(tag as any);
    }) as any);

    const a = mod.generateAnimationPatternFrames(source, 'none', 8);
    expect(a).toHaveLength(1);

    const b = mod.generateAnimationPatternFrames(source, 'pulse', 1);
    expect(b).toHaveLength(1);

    createSpy.mockRestore();
  });

  it('throws if source canvas has no 2d context', async () => {
    const mod = await import('../../src/modules/animation/animation-patterns');
    const source = makeCanvas(2, 2, false);
    expect(() => mod.generateAnimationPatternFrames(source, 'wave', 2)).toThrow(
      'Could not get 2D context from source canvas'
    );
  });

  it('generates patterned frames across all pattern variants', async () => {
    const mod = await import('../../src/modules/animation/animation-patterns');

    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(2, 2) as any;
      return originalCreate(tag as any);
    }) as any);

    const source = makeCanvas(2, 2);
    const patterns: Array<'pulse' | 'wave' | 'scanline' | 'shimmer' | 'drift' | 'color_cycle'> = [
      'pulse',
      'wave',
      'scanline',
      'shimmer',
      'drift',
      'color_cycle',
    ];

    for (const p of patterns) {
      const frames = mod.generateAnimationPatternFrames(source, p, 3, 1.2, 9);
      expect(frames).toHaveLength(3);
      expect((frames[0] as any)._ctx.putImageData).toHaveBeenCalled();
    }

    createSpy.mockRestore();
  });

  it('interpolates frames with linear/ease modes and edge conditions', async () => {
    const mod = await import('../../src/modules/animation/animation-patterns');

    expect(mod.interpolateAnimationFramesWithEasing([], 3)).toEqual([]);

    const one = [makeCanvas(2, 2)];
    expect(mod.interpolateAnimationFramesWithEasing(one, 5)).toHaveLength(1);

    const pair = [makeCanvas(2, 2), makeCanvas(2, 2)];
    expect(mod.interpolateAnimationFramesWithEasing(pair, 1)).toHaveLength(1);

    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(2, 2) as any;
      return originalCreate(tag as any);
    }) as any);

    const frames = [
      makeCanvas(
        2,
        2,
        true,
        [10, 20, 30, 255, 40, 50, 60, 255, 70, 80, 90, 255, 100, 110, 120, 255]
      ),
      makeCanvas(
        2,
        2,
        true,
        [120, 110, 100, 255, 90, 80, 70, 255, 60, 50, 40, 255, 30, 20, 10, 255]
      ),
      makeCanvas(
        2,
        2,
        true,
        [30, 30, 30, 255, 60, 60, 60, 255, 90, 90, 90, 255, 120, 120, 120, 255]
      ),
    ];

    const linear = mod.interpolateAnimationFramesWithEasing(frames as any, 5, 'linear');
    expect(linear).toHaveLength(5);

    const ease = mod.interpolateAnimationFramesWithEasing(frames as any, 5, 'ease');
    const easeIn = mod.interpolateAnimationFramesWithEasing(frames as any, 5, 'ease-in');
    const easeOut = mod.interpolateAnimationFramesWithEasing(frames as any, 5, 'ease-out');
    const easeInOut = mod.interpolateAnimationFramesWithEasing(frames as any, 5, 'ease-in-out');

    expect(ease).toHaveLength(5);
    expect(easeIn).toHaveLength(5);
    expect(easeOut).toHaveLength(5);
    expect(easeInOut).toHaveLength(5);

    // default export smoke check
    expect(mod.default.generateAnimationPatternFrames).toBeTypeOf('function');
    expect(mod.default.interpolateAnimationFramesWithEasing).toBeTypeOf('function');

    createSpy.mockRestore();
  });
});
