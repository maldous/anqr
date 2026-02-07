// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn(() => false);
const saveFileNative = vi.fn();

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => ({ trace: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform } }));
vi.mock('../../src/modules/browser-io/native-save', () => ({ saveFileNative }));

describe('browser-io download', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('downloads blobs and urls on web, and delegates to native save on native platforms', async () => {
    const mod = await import('../../src/modules/browser-io/download');

    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockImplementation(() => 'blob:url');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    mod.downloadBlob(new Blob(['x']), 'file.bin');
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url');

    isNativePlatform.mockReturnValue(false);
    mod.downloadUrl('https://example.com/file', 'x.bin');
    expect(clickSpy).toHaveBeenCalled();
    expect(saveFileNative).not.toHaveBeenCalled();

    isNativePlatform.mockReturnValue(true);
    const blob = new Blob(['x']);
    mod.downloadUrl('https://example.com/file', 'x.bin', blob);
    expect(saveFileNative).toHaveBeenCalledWith('x.bin', blob);

    createObjectURL.mockRestore();
    revokeObjectURL.mockRestore();
    clickSpy.mockRestore();
  });
});
