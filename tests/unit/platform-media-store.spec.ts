import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerPluginMock = vi.fn();

vi.mock('@capacitor/core', () => ({
  registerPlugin: (...args: unknown[]) => registerPluginMock(...args),
}));

describe('platform media-store adapter', () => {
  beforeEach(() => {
    registerPluginMock.mockReset();
    vi.resetModules();
  });

  it('uses saveBase64ToDocuments when provided by plugin', async () => {
    const saveBase64ToDocumentsMock = vi.fn().mockResolvedValue({ uri: 'content://x' });
    registerPluginMock.mockReturnValue({
      saveBase64ToDocuments: saveBase64ToDocumentsMock,
    });

    const mod = await import('../../src/modules/platform/media-store');
    const result = await mod.saveBase64ToDocuments(
      'file.png',
      'data:image/png;base64,AAAA',
      'image/png',
      'ANQR'
    );

    expect(registerPluginMock).toHaveBeenCalledWith('MediaStoreWriter');
    expect(saveBase64ToDocumentsMock).toHaveBeenCalledWith({
      filename: 'file.png',
      base64Data: 'data:image/png;base64,AAAA',
      mimeType: 'image/png',
      subfolder: 'ANQR',
    });
    expect(result).toEqual({ uri: 'content://x' });
  });

  it('falls back to saveToDocuments for Android plugin compatibility', async () => {
    const saveToDocumentsMock = vi.fn().mockResolvedValue({ path: '/docs/ANQR/file.png' });
    registerPluginMock.mockReturnValue({
      saveToDocuments: saveToDocumentsMock,
    });

    const mod = await import('../../src/modules/platform/media-store');
    const result = await mod.saveBase64ToDocuments('file.png', 'AAAA', 'image/png', 'ANQR');

    expect(saveToDocumentsMock).toHaveBeenCalledWith({
      filename: 'file.png',
      data: 'AAAA',
      mimeType: 'image/png',
      subdir: 'ANQR',
    });
    expect(result).toEqual({ path: '/docs/ANQR/file.png' });
  });
});
