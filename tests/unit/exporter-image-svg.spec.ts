// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn(() => false);
const downloadUrl = vi.fn();
const embedPngMetadata = vi.fn(async (b: Blob) => b);
const embedPngDpi = vi.fn(async (b: Blob) => b);

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform } }));
vi.mock('../../src/modules/exporter/utils', async () => {
  const actual = await vi.importActual<any>('../../src/modules/exporter/utils');
  return { ...actual, downloadUrl };
});
vi.mock('../../src/modules/exporter/png-metadata', () => ({
  embedPngMetadata,
  embedPngDpi,
}));

function makeCanvas(width = 40, height = 30): HTMLCanvasElement {
  const ctx = {
    fillStyle: '#fff',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    imageSmoothingEnabled: true,
  } as any;
  return {
    width,
    height,
    getContext: vi.fn(() => ctx),
    toBlob: vi.fn((cb: (b: Blob | null) => void) => cb(new Blob(['x'], { type: 'image/png' }))),
    toDataURL: vi.fn(() => 'data:image/png;base64,AAA'),
  } as any;
}

describe('exporter image + svg', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);
  });

  function mockOutputCanvasCreation() {
    const original = document.createElement.bind(document);
    const outputCtx = {
      fillStyle: '#fff',
      fillRect: vi.fn(),
      drawImage: vi.fn(),
      imageSmoothingEnabled: true,
    } as any;
    const outputCanvas = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => outputCtx),
      toBlob: vi.fn((cb: (b: Blob | null) => void) => cb(new Blob(['out'], { type: 'image/png' }))),
    } as any;
    const createSpy = vi.spyOn(document, 'createElement').mockImplementation(((tag: string) => {
      if (tag === 'canvas') return outputCanvas;
      return original(tag as any);
    }) as any);
    return { createSpy, outputCanvas, outputCtx };
  }

  it('exports image, embeds metadata/dpi for png, and downloads on web/native', async () => {
    const mod = await import('../../src/modules/exporter/image-export');
    const { createSpy } = mockOutputCanvasCreation();

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const canvas = makeCanvas();
    const res = await mod.exportImage(
      canvas,
      {
        outputFormat: 'png',
        outputWidth: 100,
        outputHeight: 80,
        bgOverride: '#abcdef',
        filename: 'qr',
      },
      { title: 'Meta' },
      300
    );

    expect(res.filename).toBe('qr.png');
    expect(res.width).toBe(100);
    expect(embedPngMetadata).toHaveBeenCalled();
    expect(embedPngDpi).toHaveBeenCalled();

    await mod.downloadImage(canvas, { filename: 'qr' });
    expect(downloadUrl).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();

    isNativePlatform.mockReturnValue(true);
    await mod.downloadImage(canvas, { filename: 'qr' });
    // no additional revoke on native path
    expect(revokeObjectURL.mock.calls.length).toBe(1);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    createSpy.mockRestore();
  });

  it('handles non-png outputs and missing context/blob failures', async () => {
    const mod = await import('../../src/modules/exporter/image-export');
    const { createSpy, outputCanvas } = mockOutputCanvasCreation();

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');
    const canvas = makeCanvas();

    const jpg = await mod.exportImage(canvas, { outputFormat: 'jpeg', filename: 'pic' }, { title: 'x' }, 300);
    expect(jpg.filename).toBe('pic.jpg');
    expect(embedPngMetadata).not.toHaveBeenCalled();

    (outputCanvas as any).getContext = vi.fn(() => null);
    await expect(mod.exportImage(canvas, {})).rejects.toThrow('Could not get canvas context');

    (outputCanvas as any).getContext = vi.fn(() => ({ drawImage: vi.fn() }));
    (outputCanvas as any).toBlob = vi.fn((cb: (b: Blob | null) => void) => cb(null));
    await expect(mod.exportImage(canvas, {})).rejects.toThrow('Failed to create blob');

    createObjectURL.mockRestore();
    createSpy.mockRestore();
  });

  it('exports and downloads svg with optional metadata escaping', async () => {
    const mod = await import('../../src/modules/exporter/svg-export');

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:svg');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);

    const canvas = makeCanvas();
    const res = await mod.exportSvg(canvas, {
      outputWidth: 256,
      outputHeight: 256,
      includeMetadata: true,
      metadata: { title: 'A&B', description: 'x<y' },
      filename: 'vector',
    });

    expect(res.format).toBe('svg');
    expect(res.filename).toBe('vector.svg');
    expect(res.blob.size).toBeGreaterThan(50);

    await mod.downloadSvg(canvas, { filename: 'vector' });
    expect(downloadUrl).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();

    isNativePlatform.mockReturnValue(true);
    await mod.downloadSvg(canvas, { filename: 'vector' });
    expect(revokeObjectURL.mock.calls.length).toBe(1);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
  });
});
