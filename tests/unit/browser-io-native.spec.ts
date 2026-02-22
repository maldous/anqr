// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const saveBase64ToDocuments = vi.fn();
const showNativeToast = vi.fn();

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));
vi.mock('../../src/modules/platform', () => ({ saveBase64ToDocuments, showNativeToast }));

describe('browser-io native and canvas utils', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('converts canvas to blob/dataurl and handles blob conversion failure', async () => {
    const mod = await import('../../src/modules/browser-io/canvas-utils');

    const okCanvas = document.createElement('canvas');
    (okCanvas as any).toBlob = (cb: (b: Blob | null) => void) =>
      cb(new Blob(['ok'], { type: 'image/png' }));
    (okCanvas as any).toDataURL = vi.fn((mime: string, q: number) => `data:${mime};q=${q}`);

    await expect(mod.canvasToBlob(okCanvas)).resolves.toBeInstanceOf(Blob);
    expect(mod.canvasToDataUrl(okCanvas, 'jpeg', 0.7)).toBe('data:image/jpeg;q=0.7');
    expect(mod.canvasToDataUrl(okCanvas, 'png', 0.8)).toBe('data:image/png;q=0.8');
    expect(mod.canvasToDataUrl(okCanvas, 'gif' as any, 0.6)).toBe('data:image/png;q=0.6');

    const badCanvas = document.createElement('canvas');
    (badCanvas as any).toBlob = (cb: (b: Blob | null) => void) => cb(null);
    await expect(mod.canvasToBlob(badCanvas)).rejects.toThrow('Failed to create blob');
  });

  it('saves file natively and surfaces errors', async () => {
    const mod = await import('../../src/modules/browser-io/native-save');

    class MockFileReaderSuccess {
      public result: string | null = 'data:image/png;base64,AAAA';
      public onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null =
        null;
      public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(_blob: Blob) {
        this.onloadend?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    saveBase64ToDocuments.mockResolvedValue({ uri: 'content://ok' });
    vi.stubGlobal('FileReader', MockFileReaderSuccess as any);

    await expect(
      mod.saveFileNative('test.png', new Blob(['x'], { type: 'image/png' }))
    ).resolves.toBe(true);
    await expect(mod.saveFileNative('fallback.bin', new Blob(['x']))).resolves.toBe(true);
    expect(saveBase64ToDocuments).toHaveBeenCalledWith(
      'test.png',
      'data:image/png;base64,AAAA',
      'image/png',
      'ANQR'
    );
    expect(showNativeToast).toHaveBeenCalledWith('Saved to Documents/ANQR: test.png', 'short');

    class MockFileReaderFail {
      public result: string | null = null;
      public onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null =
        null;
      public onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => unknown) | null = null;
      readAsDataURL(_blob: Blob) {
        this.onerror?.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
      }
    }

    vi.stubGlobal('FileReader', MockFileReaderFail as any);
    await expect(mod.saveFileNative('bad.png', new Blob(['x']))).resolves.toBe(false);
    expect(showNativeToast).toHaveBeenCalledWith('Failed to save file', 'long');
  });
});
