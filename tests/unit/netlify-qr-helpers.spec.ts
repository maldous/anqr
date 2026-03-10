// @vitest-environment node
import { createCanvas } from '@napi-rs/canvas';
import { describe, expect, it, vi } from 'vitest';

import { __test } from '../../netlify/functions/qr';

vi.mock('@sentry/node', () => ({ init: vi.fn(), captureException: vi.fn() }));

function makeCanvas(w = 16, h = 16) {
  const canvas = createCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, Math.floor(w / 2), Math.floor(h / 2));
  return canvas;
}

describe('netlify qr helpers', () => {
  it('classifies private/reserved IPs', () => {
    expect(__test.isPrivateOrReservedIP('127.0.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('10.1.2.3')).toBe(true);
    expect(__test.isPrivateOrReservedIP('172.20.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('192.168.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('169.254.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('0.1.2.3')).toBe(true);
    expect(__test.isPrivateOrReservedIP('100.64.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('192.0.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('192.0.2.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('198.51.100.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('203.0.113.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('224.0.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('240.0.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('fe80::1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('fd12::1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('::ffff:127.0.0.1')).toBe(true);
    expect(__test.isPrivateOrReservedIP('8.8.8.8')).toBe(false);
  });

  it('applies hostname heuristics for internal domains', async () => {
    await expect(__test._isPrivateHostname('localhost')).resolves.toBe(true);
    await expect(__test._isPrivateHostname('service.internal')).resolves.toBe(true);
    await expect(__test._isPrivateHostname('example.com')).resolves.toBe(false);
  });

  it('builds watermark positions and applies blend modes', () => {
    const positions = __test.getWatermarkPositions('corners', 100, 80, 10, 10, 5);
    expect(positions).toHaveLength(4);
    expect(__test.getWatermarkPositions('edges', 100, 80, 10, 10, 5)).toHaveLength(4);
    expect(__test.getWatermarkPositions('quiet_zone', 100, 80, 10, 10, 5)).toHaveLength(1);
    const ctx = createCanvas(20, 20).getContext('2d');
    __test.applyBlendMode(ctx as never, 'multiply');
    expect(ctx.globalCompositeOperation).toBe('multiply');
    __test.applyBlendMode(ctx as never, 'screen');
    expect(ctx.globalCompositeOperation).toBe('screen');
    __test.applyBlendMode(ctx as never, 'overlay');
    expect(ctx.globalCompositeOperation).toBe('overlay');
    __test.applyBlendMode(ctx as never, 'normal');
    expect(ctx.globalCompositeOperation).toBe('source-over');
  });

  it('creates and applies text watermark', () => {
    const source = makeCanvas(80, 80);
    const marked = __test.applyWatermarkServer(source, {
      enabled: true,
      kind: 'text',
      text: 'ANQR',
      position: 'center',
      opacity: 80,
      blend: 'normal',
    });
    expect(marked.width).toBe(80);
    expect(marked.height).toBe(80);
  });

  it('supports behind watermark layer path', () => {
    const source = makeCanvas(80, 80);
    const marked = __test.applyWatermarkServer(source, {
      enabled: true,
      kind: 'text',
      text: 'BG',
      position: 'behind',
      opacity: 40,
      blend: 'screen',
    });
    expect(marked.width).toBe(80);
  });

  it('returns original source for disabled/empty watermark', () => {
    const source = makeCanvas(24, 24);
    expect(
      __test.applyWatermarkServer(source, {
        enabled: false,
        kind: 'text',
        text: 'x',
        position: 'center',
        opacity: 50,
        blend: 'normal',
      })
    ).toBe(source);
    expect(
      __test.applyWatermarkServer(source, {
        enabled: true,
        kind: 'text',
        text: '',
        position: 'center',
        opacity: 50,
        blend: 'normal',
      })
    ).toBe(source);
  });

  it('handles PNG metadata + CRC helpers', () => {
    const png = makeCanvas(20, 20).toBuffer('image/png');
    const crc = __test.calculateCrc32(new Uint8Array([1, 2, 3]));
    expect(typeof crc).toBe('number');
    const textChunk = __test.createPngTextChunk('Title', 'ANQR');
    expect(textChunk.byteLength).toBeGreaterThan(12);
    const phys = __test.createPngPhysChunk(300);
    expect(phys.byteLength).toBeGreaterThan(12);
    const withMeta = __test.embedPngMetadataAndDpi(png, { title: 'ANQR', author: 'Test' }, 300);
    expect(withMeta.byteLength).toBeGreaterThan(png.byteLength);
    const unchanged = __test.embedPngMetadataAndDpi(png, undefined, 72);
    expect(unchanged.equals(png)).toBe(true);
    const passthrough = __test.embedPngMetadataAndDpi(Buffer.from('abc'), { title: 'x' }, 300);
    expect(passthrough.toString()).toBe('abc');
  });

  it('encodes GIF frames', () => {
    const a = makeCanvas(24, 24);
    const b = makeCanvas(24, 24);
    const single = __test.encodeGif(a, 64, 2);
    expect(single.byteLength).toBeGreaterThan(50);
    const singleAb = single.buffer.slice(single.byteOffset, single.byteOffset + single.byteLength);
    const parsedSingle = __test.parseGifFramesServer(singleAb);
    expect(parsedSingle[0]?.disposalType).toBe(2);
    const multi = __test.encodeAnimatedGif([a, b], 80, 64, 2);
    expect(multi.byteLength).toBeGreaterThan(50);
    const multiAb = multi.buffer.slice(multi.byteOffset, multi.byteOffset + multi.byteLength);
    const parsedMulti = __test.parseGifFramesServer(multiAb);
    expect(parsedMulti[0]?.disposalType).toBe(2);
    expect(() => __test.encodeAnimatedGif([], 80, 64, 2)).toThrow('No frames to encode');
  });

  it('flattens transparent GIF backgrounds for opaque output', () => {
    const canvas = createCanvas(12, 12);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 12, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 4, 4);

    const gif = __test.encodeGif(canvas, 64, 2, '#ffffff', false);
    const ab = gif.buffer.slice(gif.byteOffset, gif.byteOffset + gif.byteLength);
    const frames = __test.parseGifFramesServer(ab);
    expect(frames.length).toBeGreaterThan(0);

    const frameCtx = frames[0].canvas.getContext('2d');
    const bgPixel = frameCtx.getImageData(11, 11, 1, 1).data;
    expect(bgPixel[0]).toBeGreaterThanOrEqual(240);
    expect(bgPixel[1]).toBeGreaterThanOrEqual(240);
    expect(bgPixel[2]).toBeGreaterThanOrEqual(240);
  });

  it('returns detached GIF frame buffers for stable caching', () => {
    const src = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);

    const preserved = __test.prepareGifFramePixels(src, [255, 255, 255], true);
    expect(preserved).not.toBe(src);
    expect(Array.from(preserved)).toEqual(Array.from(src));
    src[0] = 200;
    expect(preserved[0]).toBe(10);

    const opaque = new Uint8ClampedArray([1, 2, 3, 255, 4, 5, 6, 255]);
    const opaquePrepared = __test.prepareGifFramePixels(opaque, [255, 255, 255], false);
    expect(opaquePrepared).not.toBe(opaque);
    opaque[1] = 180;
    expect(opaquePrepared[1]).toBe(2);
  });

  it('generates animation pattern frames', () => {
    const source = makeCanvas(20, 20);
    const frames = __test.generatePatternFramesServer(source, 'pulse', 5, 1, 'linear');
    expect(frames).toHaveLength(5);
    expect(__test.generatePatternFramesServer(source, 'wave', 2, 1, 'linear')).toHaveLength(2);
    expect(__test.generatePatternFramesServer(source, 'scanline', 2, 1, 'linear')).toHaveLength(2);
    expect(__test.generatePatternFramesServer(source, 'shimmer', 2, 1, 'linear')).toHaveLength(2);
    expect(__test.generatePatternFramesServer(source, 'drift', 2, 1, 'linear')).toHaveLength(2);
    expect(__test.generatePatternFramesServer(source, 'color_cycle', 2, 1, 'linear')).toHaveLength(
      2
    );
    const none = __test.generatePatternFramesServer(source, 'none', 5, 1, 'linear');
    expect(none).toHaveLength(1);
  });

  it('runs crop/flip/rotate helpers', () => {
    const source = makeCanvas(30, 20);
    const cropped = __test.cropOverlayServer(source, 0.5, 0.5, 0.5);
    expect(cropped.width).toBe(cropped.height);
    const flipped = __test.flipOverlayServer(cropped, true, false);
    expect(flipped.width).toBe(cropped.width);
    expect(__test.flipOverlayServer(cropped, false, false)).toBe(cropped);
    const rotated = __test.rotateOverlayServer(cropped, 45);
    expect(rotated.width).toBeGreaterThan(0);
    expect(__test.rotateOverlayServer(cropped, 0)).toBe(cropped);
  });

  it('runs grayscale/convolution/edge helpers', () => {
    expect(__test.rgbToGrayServer(255, 255, 255)).toBeGreaterThan(200);
    const source = makeCanvas(20, 20);
    const ctx = source.getContext('2d');
    const d = ctx.getImageData(0, 0, source.width, source.height).data;
    const conv = __test.convolveServer(d, source.width, source.height, [[1]]);
    expect(conv.length).toBe(d.length);
    expect(__test.blurServer(d, source.width, source.height, 0).length).toBe(d.length);
    expect(__test.sharpenServer(d, source.width, source.height, 20).length).toBe(d.length);
    expect(__test.posterizeServer(d, 4).length).toBe(d.length);
    expect(__test.thresholdServer(d, 128).length).toBe(d.length);
    expect(__test.sobelEdgeServer(d, source.width, source.height).length).toBe(d.length);
    expect(__test.cannyEdgeServer(d, source.width, source.height).length).toBe(d.length);
  });

  it('applies overlay filter combinations', () => {
    const source = createCanvas(24, 24);
    const ctx = source.getContext('2d');
    // colorful data to force non-zero saturation path (hue2rgb branch)
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(0, 0, 12, 12);
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(12, 0, 12, 12);
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(0, 12, 12, 12);
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(12, 12, 12, 12);
    const out = __test.applyOverlayFiltersServer(source, {
      brightness: 20,
      contrast: 20,
      gamma: 1.2,
      saturation: 10,
      hue: 15,
      invert: true,
      blur: 1,
      sharpen: 10,
      posterize: 3,
      threshold: 128,
      edge: 'sobel',
    });
    expect(out.width).toBe(source.width);
    const grayscale = createCanvas(8, 8);
    const gctx = grayscale.getContext('2d');
    gctx.fillStyle = '#777777';
    gctx.fillRect(0, 0, 8, 8);
    const out2 = __test.applyOverlayFiltersServer(grayscale, {
      saturation: 0,
      hue: 720,
      edge: 'canny',
    });
    expect(out2.height).toBe(8);
    const out3 = __test.applyOverlayFiltersServer(grayscale, {
      sharpen: 0,
      posterize: 1,
      hue: -720,
    });
    expect(out3.width).toBe(8);
  });

  it('detects GIF signatures and parses frames', () => {
    const gif = __test.encodeGif(makeCanvas(16, 16), 32, 2);
    const ab = gif.buffer.slice(gif.byteOffset, gif.byteOffset + gif.byteLength);
    expect(__test.isGifBuffer(ab)).toBe(true);
    const frames = __test.parseGifFramesServer(ab);
    expect(frames.length).toBeGreaterThan(0);
    expect(__test.isGifBuffer(new Uint8Array([0, 1, 2]).buffer)).toBe(false);
  });

  it('decimates frames to target fps', () => {
    const frames = [10, 20, 30, 40, 50].map((delay) => ({
      canvas: makeCanvas(8, 8),
      delay,
      disposalType: 2,
    }));
    const totalInputDelay = frames.reduce((sum, frame) => sum + frame.delay, 0);
    const out = __test.decimateFramesToMaxFps(frames, 10);
    expect(out.length).toBeGreaterThan(0);
    expect(out.length).toBeLessThanOrEqual(frames.length);
    const totalOutputDelay = out.reduce((sum, frame) => sum + frame.delay, 0);
    expect(totalOutputDelay).toBe(totalInputDelay);
    expect(__test.decimateFramesToMaxFps([frames[0]], 10)).toHaveLength(1);
    expect(__test.decimateFramesToMaxFps(frames, 1000)).toHaveLength(frames.length);
  });

  it('encodes animated gif with per-frame delays', () => {
    const frames = [
      { canvas: makeCanvas(12, 12), delay: 80, disposalType: 2 },
      { canvas: makeCanvas(12, 12), delay: 120, disposalType: 2 },
    ];
    const gif = __test.encodeAnimatedGifWithDelays(frames, 64, 2);
    expect(gif.byteLength).toBeGreaterThan(50);
    expect(() => __test.encodeAnimatedGifWithDelays([], 64, 2)).toThrow('No frames to encode');
  });

  it('parses gradient stops and fallback values', () => {
    const parsed = __test.parseGradientStops('ff0000,0,00ff00,1');
    expect(parsed).toHaveLength(2);
    expect(__test.parseGradientStops('bad,input').length).toBe(2);
  });

  it('rejects invalid overlay URL protocols quickly', async () => {
    await expect(__test.fetchImageWithBuffer('file:///tmp/a.png')).resolves.toBeNull();
    await expect(__test.fetchImageWithBuffer('%%%')).resolves.toBeNull();
  });

  it('fetchImageAsCanvas returns null when fetch fails', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'));
    try {
      await expect(__test.fetchImageAsCanvas('https://anqr.link/test.png')).resolves.toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it('node canvas factory loadImage path works', async () => {
    const canvas = makeCanvas(10, 10);
    const png = canvas.toBuffer('image/png');
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    const img = await __test.nodeCanvasFactory.loadImage(dataUrl);
    expect(img.width).toBe(10);
    expect(img.height).toBe(10);
  });

  it('fetchImageWithBuffer handles timeout/abort path', async () => {
    vi.useFakeTimers();
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(((
      _: RequestInfo | URL,
      init?: RequestInit
    ) => {
      return new Promise((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
      }) as Promise<Response>;
    }) as typeof fetch);
    const promise = __test.fetchImageWithBuffer('https://anqr.link/test.png');
    // Default overlay fetch timeout is 60s (overridable by env).
    await vi.advanceTimersByTimeAsync(61_000);
    await expect(promise).resolves.toBeNull();
    fetchSpy.mockRestore();
    vi.useRealTimers();
  });

  it('fetchImageWithBuffer returns null on non-200 and body/stream errors', async () => {
    const notOkSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('x', { status: 500 }))
      .mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => (name.toLowerCase() === 'content-type' ? 'image/png' : null),
        },
        body: {
          getReader: () => ({
            read: async () => {
              throw new Error('stream error');
            },
            cancel: () => undefined,
          }),
        },
      } as unknown as Response);
    try {
      expect(await __test.fetchImageWithBuffer('https://anqr.link/test.png')).toBeNull();
      const result = await __test.fetchImageWithBuffer('https://anqr.link/test.png');
      expect(result).toBeNull();
    } finally {
      notOkSpy.mockRestore();
    }
  });

  it('blocks redirect-based SSRF to private hosts', async () => {
    const redirectSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, {
        status: 302,
        headers: { Location: 'http://127.0.0.1/internal.png' },
      })
    );
    try {
      await expect(
        __test.fetchImageWithBuffer('https://example.com/image.png')
      ).resolves.toBeNull();
      expect(redirectSpy).toHaveBeenCalledTimes(1);
    } finally {
      redirectSpy.mockRestore();
    }
  });

  it('fetchImageWithBuffer handles streamed PNG/GIF payloads without throwing', async () => {
    const png = makeCanvas(14, 14).toBuffer('image/png');
    const gif = __test.encodeAnimatedGif([makeCanvas(10, 10), makeCanvas(10, 10)], 80, 32, 2);
    const makeStreamResponse = (bytes: Uint8Array, contentType: string) =>
      ({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name.toLowerCase() === 'content-type') return contentType;
            if (name.toLowerCase() === 'content-length') return String(bytes.byteLength);
            return null;
          },
        },
        body: {
          getReader: () => {
            let sent = false;
            return {
              read: async () => {
                if (sent) return { done: true, value: undefined };
                sent = true;
                return { done: false, value: bytes };
              },
              cancel: () => undefined,
            };
          },
        },
      }) as unknown as Response;
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(makeStreamResponse(new Uint8Array(png), 'image/png'))
      .mockResolvedValueOnce(makeStreamResponse(new Uint8Array(gif), 'image/gif'));
    try {
      const img = await __test.fetchImageWithBuffer('https://anqr.link/test.png');
      expect(img === null || !!img.canvas).toBe(true);
      const anim = await __test.fetchImageWithBuffer('https://anqr.link/king.gif');
      expect(anim === null || typeof anim.isAnimatedGif === 'boolean').toBe(true);
    } finally {
      spy.mockRestore();
    }
  });
});
