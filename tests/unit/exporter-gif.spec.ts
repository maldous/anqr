// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn(() => false);
const downloadUrl = vi.fn();

const quantize = vi.fn(() => [[0, 0, 0], [255, 255, 255]] as number[][]);
const applyPalette = vi.fn(() => new Uint8Array([0, 1, 0, 1]));
const writeFrame = vi.fn();
const finish = vi.fn();
const bytes = vi.fn(() => new Uint8Array([71, 73, 70]));
const GIFEncoder = vi.fn(() => ({ writeFrame, finish, bytes }));

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform } }));
vi.mock('gifenc', () => ({ quantize, applyPalette, GIFEncoder }));
vi.mock('../../src/modules/exporter/utils', async () => {
  const actual = await vi.importActual<any>('../../src/modules/exporter/utils');
  return { ...actual, downloadUrl };
});

function makeFrame(width = 2, height = 2): HTMLCanvasElement {
  return {
    width,
    height,
  } as any;
}

describe('exporter gif', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);

    const outputPixels = new Uint8ClampedArray([
      0, 0, 0, 255,
      255, 255, 255, 255,
      10, 20, 30, 255,
      40, 50, 60, 255,
    ]);

    const originalCreate = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        const ctx = {
          clearRect: vi.fn(),
          fillStyle: '#fff',
          fillRect: vi.fn(),
          imageSmoothingEnabled: true,
          drawImage: vi.fn(),
          getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(outputPixels) })),
        } as any;

        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ctx),
          _ctx: ctx,
        } as any;
      }
      return originalCreate(tag as any);
    }) as any);

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:gif');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  });

  it('exports gif using global palette sampling and frame delays', async () => {
    const mod = await import('../../src/modules/exporter/gif-export');
    const frames = [makeFrame(2, 2), makeFrame(2, 2), makeFrame(2, 2)];

    const result = await mod.exportGif(
      frames,
      {
        outputWidth: 2,
        outputHeight: 2,
        filename: 'anim',
        animationSpeed: 80,
        loopAnimation: false,
        bgOverride: '#112233',
        gifDisposal: 'keep',
        gifPaletteSize: 99,
      } as any,
      [10, 20, 33]
    );

    expect(result.filename).toBe('anim.gif');
    expect(result.format).toBe('gif');
    expect(result.url).toBe('blob:gif');
    expect(result.width).toBe(2);
    expect(result.height).toBe(2);

    expect(GIFEncoder).toHaveBeenCalled();
    expect(quantize).toHaveBeenCalled();
    expect(applyPalette).toHaveBeenCalledTimes(3);
    expect(writeFrame).toHaveBeenCalledTimes(3);

    // first frame carries repeat flag and disposal for "keep"
    const firstOpts = writeFrame.mock.calls[0][3];
    expect(firstOpts.repeat).toBe(-1);
    expect(firstOpts.disposal).toBe(1);
    expect(firstOpts.delay).toBe(2); // min 2cs

    const thirdOpts = writeFrame.mock.calls[2][3];
    expect(thirdOpts.delay).toBe(3); // 33ms -> 3cs
    expect(thirdOpts.repeat).toBeUndefined();

    expect(finish).toHaveBeenCalled();
    expect(bytes).toHaveBeenCalled();
  });

  it('falls back to per-frame quantize and default options', async () => {
    const mod = await import('../../src/modules/exporter/gif-export');

    await mod.exportGif([], {});
    expect(quantize).not.toHaveBeenCalled();

    vi.clearAllMocks();

    const frames = [makeFrame(3, 3)];
    await mod.exportGif(frames, { gifDisposal: 'unknown' } as any);

    expect(quantize).toHaveBeenCalled();
    const opts = writeFrame.mock.calls[0][3];
    expect(opts.disposal).toBe(2); // fallback
    expect(opts.repeat).toBe(0); // default loopAnimation true
  });

  it('throws on missing canvas context and handles download web/native cleanup', async () => {
    const mod = await import('../../src/modules/exporter/gif-export');

    const originalCreate = document.createElement.bind(document);
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return { width: 0, height: 0, getContext: vi.fn(() => null) } as any;
      return originalCreate(tag as any);
    }) as any);

    await expect(mod.exportGif([makeFrame(2, 2)], {})).rejects.toThrow('Could not get canvas context');
    createSpy.mockRestore();

    const originalCreate2 = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') {
        return {
          width: 0,
          height: 0,
          getContext: vi.fn(() => ({
            clearRect: vi.fn(),
            fillRect: vi.fn(),
            drawImage: vi.fn(),
            getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(16) })),
          })),
        } as any;
      }
      return originalCreate2(tag as any);
    }) as any);

    await mod.downloadGif([makeFrame(2, 2)], { filename: 'd1' });
    expect(downloadUrl).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();

    isNativePlatform.mockReturnValue(true);
    await mod.downloadGif([makeFrame(2, 2)], { filename: 'd2' });
    // no extra revoke on native
    expect((URL.revokeObjectURL as any).mock.calls.length).toBe(1);
  });
});
