// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const parseGIF = vi.fn();
const decompressFrames = vi.fn();

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('gifuct-js', () => ({
  parseGIF,
  decompressFrames,
}));

type MockCtx = {
  clearRect: ReturnType<typeof vi.fn>;
  getImageData: ReturnType<typeof vi.fn>;
  putImageData: ReturnType<typeof vi.fn>;
  drawImage: ReturnType<typeof vi.fn>;
};

function makeCanvas(width = 2, height = 2, withCtx = true): HTMLCanvasElement {
  const ctx: MockCtx = {
    clearRect: vi.fn(),
    getImageData: vi.fn((x = 0, y = 0, w = width, h = height) => ({
      data: new Uint8ClampedArray(w * h * 4),
      width: w,
      height: h,
    })),
    putImageData: vi.fn(),
    drawImage: vi.fn(),
  };

  return {
    width,
    height,
    getContext: vi.fn(() => (withCtx ? ctx : null)),
    _ctx: ctx,
  } as any;
}

function gifBuffer(): ArrayBuffer {
  return new Uint8Array([71, 73, 70, 56, 57, 97, 0, 0, 0, 0, 0, 0]).buffer;
}

function webpBuffer(animated = false): ArrayBuffer {
  const bytes = new Uint8Array(32);
  bytes.set([82, 73, 70, 70], 0); // RIFF
  bytes.set([87, 69, 66, 80], 8); // WEBP
  if (animated) {
    bytes.set([65, 78, 73, 77], 12); // ANIM
    bytes[16] = 4;
  }
  return bytes.buffer;
}

describe('animation gif-compositor + parsing + loop', () => {
  let currentGifFrames: any[] = [];
  let createSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();

    currentGifFrames = [
      {
        dims: { left: 0, top: 0, width: 2, height: 2 },
        patch: new Uint8Array(16),
        disposalType: 2,
        delay: 50, // gifuct-js returns ms (gce.delay=5 → (5||10)*10 = 50)
      },
      {
        dims: { left: 0, top: 0, width: 2, height: 2 },
        patch: new Uint8Array(16),
        disposalType: 3,
        delay: 100, // gifuct-js returns ms (gce.delay=0 → (0||10)*10 = 100)
      },
    ];

    parseGIF.mockImplementation(() => ({ lsd: { width: 2, height: 2 } }));
    decompressFrames.mockImplementation(() => currentGifFrames);

    const originalCreate = document.createElement.bind(document);
    createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(2, 2);
      return originalCreate(tag as any);
    }) as any);

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    class MockImage {
      naturalWidth = 3;
      naturalHeight = 4;
      onload: null | (() => void) = null;
      onerror: null | (() => void) = null;
      set src(value: string) {
        if (value.includes('fail')) {
          this.onerror?.();
        } else {
          this.onload?.();
        }
      }
    }
    (globalThis as any).Image = MockImage;
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

    (globalThis as any).fetch = vi.fn(async () => ({
      arrayBuffer: async () => gifBuffer(),
    }));
  });

  it('creates compositor and handles apply/dispose/reset/snapshot paths', async () => {
    const mod = await import('../../src/modules/animation/gif-compositor');
    const compositor = mod.createGifCompositor(gifBuffer());

    expect(compositor.frameCount).toBe(2);
    expect(compositor.width).toBe(2);
    expect(compositor.height).toBe(2);
    expect(compositor.delayMs(0)).toBe(50);
    expect(compositor.delayMs(1)).toBe(100);

    // New: disposalType getter exposes source disposal per frame
    expect(compositor.disposalType(0)).toBe(2);
    expect(compositor.disposalType(1)).toBe(3);
    expect(compositor.disposalType(-1)).toBe(0); // out of bounds fallback
    expect(compositor.disposalType(99)).toBe(0); // out of bounds fallback

    // New: frameDims getter exposes patch dimensions per frame
    expect(compositor.frameDims(0)).toEqual({ left: 0, top: 0, width: 2, height: 2 });
    expect(compositor.frameDims(1)).toEqual({ left: 0, top: 0, width: 2, height: 2 });
    expect(compositor.frameDims(-1)).toEqual({ left: 0, top: 0, width: 0, height: 0 }); // out of bounds fallback

    compositor.apply(-1);
    compositor.dispose(-1);

    compositor.apply(0);
    compositor.dispose(0);

    compositor.apply(1);
    compositor.dispose(1);

    compositor.reset();
    const snap = compositor.getSnapshot();
    expect(snap.width).toBe(2);
    expect(snap.height).toBe(2);

    // validate context calls happened for disposal types 2 and 3
    const baseCanvas = compositor.canvas as any;
    const baseCtx = baseCanvas._ctx as MockCtx;
    expect(baseCtx.clearRect).toHaveBeenCalled();
    expect(baseCtx.putImageData).toHaveBeenCalled();
  });

  it('throws when compositor base canvas lacks context', async () => {
    createSpy.mockRestore();
    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return makeCanvas(2, 2, false);
      return originalCreate(tag as any);
    }) as any);

    const mod = await import('../../src/modules/animation/gif-compositor');
    expect(() => mod.createGifCompositor(gifBuffer())).toThrow('Failed to get 2D context');
  });

  it('parses gif frames and delays, including string-source fetch and empty-frame error', async () => {
    const mod = await import('../../src/modules/animation/parsing');

    const frames = await mod.parseGifFrames(gifBuffer());
    expect(frames).toHaveLength(2);
    expect(frames[0].delay).toBe(50);
    expect(frames[1].disposalType).toBe(3);

    const delays = await mod.getGifDelays('https://example.com/a.gif');
    expect(delays).toEqual([50, 100]);
    expect(fetch).toHaveBeenCalled();

    currentGifFrames = [];
    await expect(mod.parseGifFrames(gifBuffer())).rejects.toThrow('No frames found in GIF');
  });

  it('parses animated image by format: gif, static webp, static fallback', async () => {
    const mod = await import('../../src/modules/animation/parsing');

    const gifFrames = await mod.parseAnimatedImage(gifBuffer());
    expect(gifFrames).toHaveLength(2);
    expect(gifFrames[0].delay).toBe(50);
    // Source disposal types are preserved from compositor
    expect(gifFrames[0].disposalType).toBe(2);
    expect(gifFrames[1].disposalType).toBe(3);

    // With 'simplify' mode, disposal type 3 is converted to 2
    const simplifiedFrames = await mod.parseAnimatedImage(gifBuffer(), 'simplify');
    expect(simplifiedFrames[0].disposalType).toBe(2);
    expect(simplifiedFrames[1].disposalType).toBe(2); // 3 → 2

    const webpStaticFrames = await mod.parseAnimatedImage(webpBuffer(false));
    expect(webpStaticFrames).toHaveLength(1);
    expect(webpStaticFrames[0].canvas.width).toBe(3);

    const unknownFrames = await mod.parseAnimatedImage(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]).buffer
    );
    expect(unknownFrames).toHaveLength(1);
    expect(unknownFrames[0].delay).toBe(100);
  });

  it('parses webp with ImageDecoder success/failure and fallback errors', async () => {
    const mod = await import('../../src/modules/animation/parsing');

    // no ImageDecoder -> fallback single-frame load
    (globalThis as any).ImageDecoder = undefined;
    const noDecoder = await mod.parseWebPFrames(webpBuffer(false));
    expect(noDecoder).toHaveLength(1);

    // successful decoder path
    class DecoderOk {
      completed = Promise.resolve();
      tracks = { selectedTrack: { frameCount: 2 } };
      async decode({ frameIndex }: { frameIndex: number }) {
        return {
          image: {
            displayWidth: 2,
            displayHeight: 2,
            close: vi.fn(),
          },
          duration: frameIndex === 0 ? 2500 : 0,
        };
      }
      close() {}
    }
    (globalThis as any).ImageDecoder = DecoderOk;

    const decoded = await mod.parseWebPFrames(webpBuffer(true));
    expect(decoded).toHaveLength(2);
    expect(decoded[0].delay).toBe(2.5);
    expect(decoded[1].delay).toBe(100);

    // decoder error -> fallback
    class DecoderFail {
      completed = Promise.reject(new Error('bad decoder'));
      tracks = { selectedTrack: { frameCount: 1 } };
      async decode() {
        throw new Error('decode fail');
      }
      close() {}
    }
    (globalThis as any).ImageDecoder = DecoderFail;
    const fallback = await mod.parseWebPFrames(webpBuffer(true));
    expect(fallback).toHaveLength(1);

    // fallback image load failure
    vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:fail');
    await expect(mod.parseWebPFrames(webpBuffer(false))).rejects.toThrow(
      'Failed to load WebP image'
    );
  });

  it('runs animation loop start/stop/setFrames and frame callback timing', async () => {
    const mod = await import('../../src/modules/animation/animation-loop');

    let rafCb: FrameRequestCallback | null = null;
    const rafSpy = vi
      .spyOn(globalThis, 'requestAnimationFrame')
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCb = cb;
        return 11;
      });
    const cancelSpy = vi
      .spyOn(globalThis, 'cancelAnimationFrame')
      .mockImplementation(() => undefined);

    let now = 1000;
    vi.spyOn(performance, 'now').mockImplementation(() => now);

    const onFrame = vi.fn();
    const loop = mod.createAnimationLoop(onFrame, {
      speedMs: 100,
      loop: true,
      bounce: false,
      startFrame: 0,
      maxFrames: 10,
      frameStep: 1,
      interpolate: 'none',
      pattern: 'none',
      moduleJitterPx: 0,
      colorCycle: false,
      temporalDither: 'off',
      seed: 0,
    });

    // start before setFrames should do nothing
    loop.start();
    expect(rafSpy).not.toHaveBeenCalled();

    loop.setFrames([
      { canvas: makeCanvas(), delay: 50, disposalType: 0 },
      { canvas: makeCanvas(), delay: 50, disposalType: 0 },
    ] as any);

    loop.start();
    expect(rafSpy).toHaveBeenCalled();

    now = 1010;
    rafCb?.(now);
    expect(onFrame).not.toHaveBeenCalled();

    now = 1100;
    rafCb?.(now);
    expect(onFrame).toHaveBeenCalled();

    loop.stop();
    expect(cancelSpy).toHaveBeenCalledWith(11);

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
  });
});
