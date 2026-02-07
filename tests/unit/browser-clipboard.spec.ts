// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));

describe('browser-clipboard', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '';

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: vi.fn(),
        write: vi.fn(),
      },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(),
    });

    class MockClipboardItem {
      data: unknown;
      constructor(v: unknown) {
        this.data = v;
      }
    }
    (globalThis as any).ClipboardItem = MockClipboardItem;
  });

  it('copies text via clipboard API and falls back to execCommand', async () => {
    const mod = await import('../../src/modules/browser-clipboard/copy-text');

    await expect(mod.copyToClipboard('abc')).resolves.toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('abc');

    (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('denied'));
    const execSpy = vi.spyOn(document as any, 'execCommand').mockReturnValue(true);

    await expect(mod.copyToClipboard('fallback')).resolves.toBe(true);
    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).toBeNull();

    execSpy.mockRestore();
  });

  it('returns false when text fallback also fails', async () => {
    const mod = await import('../../src/modules/browser-clipboard/copy-text');
    (navigator.clipboard.writeText as any).mockRejectedValueOnce(new Error('denied'));
    const execSpy = vi.spyOn(document as any, 'execCommand').mockImplementation(() => {
      throw new Error('copy failed');
    });

    await expect(mod.copyToClipboard('x')).resolves.toBe(false);
    execSpy.mockRestore();
  });

  it('copies image to clipboard and handles null blob/errors', async () => {
    const mod = await import('../../src/modules/browser-clipboard/copy-image');

    const canvasOk = document.createElement('canvas');
    (canvasOk as any).toBlob = (cb: (blob: Blob | null) => void) => cb(new Blob(['x'], { type: 'image/png' }));
    await expect(mod.copyImageToClipboard(canvasOk)).resolves.toBe(true);
    expect(navigator.clipboard.write).toHaveBeenCalledTimes(1);

    const canvasNull = document.createElement('canvas');
    (canvasNull as any).toBlob = (cb: (blob: Blob | null) => void) => cb(null);
    await expect(mod.copyImageToClipboard(canvasNull)).resolves.toBe(false);

    (navigator.clipboard.write as any).mockRejectedValueOnce(new Error('no permission'));
    const canvasErr = document.createElement('canvas');
    (canvasErr as any).toBlob = (cb: (blob: Blob | null) => void) => cb(new Blob(['x'], { type: 'image/png' }));
    await expect(mod.copyImageToClipboard(canvasErr)).resolves.toBe(false);
  });
});
