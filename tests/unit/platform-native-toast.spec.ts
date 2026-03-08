import { beforeEach, describe, expect, it, vi } from 'vitest';

let isNativeMock = vi.fn(() => false);

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativeMock() },
}));

describe('platform native-toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativeMock = vi.fn(() => false);

    // Clean up any toast nodes from previous tests
    const existing = document.getElementById('anqr-native-toast');
    if (existing) existing.remove();

    // Clean up globalThis.Capacitor
    delete (globalThis as Record<string, unknown>).Capacitor;
  });

  it('returns early for empty or whitespace-only messages', async () => {
    const { showNativeToast } = await import('../../src/modules/platform/native-toast');

    await showNativeToast('');
    await showNativeToast('   ');
    await showNativeToast('' as string);

    expect(document.getElementById('anqr-native-toast')).toBeNull();
  });

  it('uses native Toast plugin when on native platform', async () => {
    isNativeMock = vi.fn(() => true);
    const showMock = vi.fn().mockResolvedValue(undefined);
    (globalThis as Record<string, unknown>).Capacitor = {
      Plugins: { Toast: { show: showMock } },
    };

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('Saved!', 'long');

    expect(showMock).toHaveBeenCalledWith({
      text: 'Saved!',
      duration: 'long',
      position: 'bottom',
    });
    // Should NOT create a DOM toast when native succeeds
    expect(document.getElementById('anqr-native-toast')).toBeNull();
  });

  it('falls through to DOM toast when native plugin throws', async () => {
    isNativeMock = vi.fn(() => true);
    const showMock = vi.fn().mockRejectedValue(new Error('plugin error'));
    (globalThis as Record<string, unknown>).Capacitor = {
      Plugins: { Toast: { show: showMock } },
    };

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('Fallback toast');

    expect(showMock).toHaveBeenCalled();
    const node = document.getElementById('anqr-native-toast');
    expect(node).not.toBeNull();
    expect(node!.textContent).toBe('Fallback toast');
  });

  it('shows DOM toast on web platform', async () => {
    isNativeMock = vi.fn(() => false);

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('Hello web');

    const node = document.getElementById('anqr-native-toast');
    expect(node).not.toBeNull();
    expect(node!.textContent).toBe('Hello web');
    expect(node!.style.opacity).toBe('1');
    expect(node!.getAttribute('role')).toBe('status');
    expect(node!.getAttribute('aria-live')).toBe('polite');
  });

  it('reuses existing DOM toast node on subsequent calls', async () => {
    isNativeMock = vi.fn(() => false);

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('First');
    await showNativeToast('Second');

    const nodes = document.querySelectorAll('#anqr-native-toast');
    expect(nodes.length).toBe(1);
    expect(nodes[0].textContent).toBe('Second');
  });

  it('trims message whitespace', async () => {
    isNativeMock = vi.fn(() => false);

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('  padded message  ');

    const node = document.getElementById('anqr-native-toast');
    expect(node!.textContent).toBe('padded message');
  });

  it('skips native plugin when plugin.show is not available', async () => {
    isNativeMock = vi.fn(() => true);
    // Native platform but no Toast plugin
    (globalThis as Record<string, unknown>).Capacitor = { Plugins: {} };

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('No plugin');

    const node = document.getElementById('anqr-native-toast');
    expect(node).not.toBeNull();
    expect(node!.textContent).toBe('No plugin');
  });

  it('defaults to short duration', async () => {
    isNativeMock = vi.fn(() => true);
    const showMock = vi.fn().mockResolvedValue(undefined);
    (globalThis as Record<string, unknown>).Capacitor = {
      Plugins: { Toast: { show: showMock } },
    };

    const { showNativeToast } = await import('../../src/modules/platform/native-toast');
    await showNativeToast('Default duration');

    expect(showMock).toHaveBeenCalledWith(expect.objectContaining({ duration: 'short' }));
  });
});
