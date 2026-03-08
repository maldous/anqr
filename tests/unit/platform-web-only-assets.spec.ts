import { beforeEach, describe, expect, it, vi } from 'vitest';

let isNativeMock = vi.fn(() => false);

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativeMock() },
}));

type WebWindow = Window & { __anqrWebAssetsLoaded?: boolean; _iub?: unknown };

describe('platform web-only-assets', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    isNativeMock = vi.fn(() => false);

    // Clean up any elements added by previous tests
    for (const el of document.querySelectorAll('[id^="anqr-"]')) {
      el.remove();
    }
    (window as WebWindow).__anqrWebAssetsLoaded = undefined;
    (window as WebWindow)._iub = undefined;
  });

  it('skips loading on native platform', async () => {
    isNativeMock = vi.fn(() => true);

    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    expect(document.querySelectorAll('[id^="anqr-"]').length).toBe(0);
    expect((window as WebWindow).__anqrWebAssetsLoaded).toBeUndefined();
  });

  it('loads preconnect links on web', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    expect(document.getElementById('anqr-preconnect-fonts-googleapis')).not.toBeNull();
    expect(document.getElementById('anqr-preconnect-fonts-gstatic')).not.toBeNull();
    expect(document.getElementById('anqr-preconnect-pagead2')).not.toBeNull();
    expect(document.getElementById('anqr-preconnect-iubenda-cdn')).not.toBeNull();
    expect(document.getElementById('anqr-dns-cs-iubenda')).not.toBeNull();
    expect(document.getElementById('anqr-dns-embeds-iubenda')).not.toBeNull();
  });

  it('loads font stylesheet on web', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    const fontLink = document.getElementById('anqr-font-noto-sans') as HTMLLinkElement;
    expect(fontLink).not.toBeNull();
    expect(fontLink.rel).toBe('stylesheet');
    expect(fontLink.href).toContain('fonts.googleapis.com');
  });

  it('loads iubenda and adsense scripts on web', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    expect(document.getElementById('anqr-iubenda-autoblocking')).not.toBeNull();
    expect(document.getElementById('anqr-iubenda-gpp-stub')).not.toBeNull();
    expect(document.getElementById('anqr-iubenda-cs')).not.toBeNull();
    expect(document.getElementById('anqr-iubenda-widget')).not.toBeNull();
    expect(document.getElementById('anqr-adsense')).not.toBeNull();
  });

  it('sets iubenda csConfiguration on window', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    const iub = (window as WebWindow)._iub as { csConfiguration?: Record<string, unknown> };
    expect(iub).toBeDefined();
    expect(iub.csConfiguration).toBeDefined();
    expect(iub.csConfiguration!.siteId).toBe(4407480);
    expect(iub.csConfiguration!.cookiePolicyId).toBe(70266922);
  });

  it('is idempotent — second call does not duplicate elements', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    const firstCount = document.querySelectorAll('[id^="anqr-"]').length;
    expect(firstCount).toBeGreaterThan(0);

    loadWebOnlyBootAssets();

    const secondCount = document.querySelectorAll('[id^="anqr-"]').length;
    expect(secondCount).toBe(firstCount);
  });

  it('sets __anqrWebAssetsLoaded flag after first load', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');

    expect((window as WebWindow).__anqrWebAssetsLoaded).toBeUndefined();
    loadWebOnlyBootAssets();
    expect((window as WebWindow).__anqrWebAssetsLoaded).toBe(true);
  });

  it('preconnect links have correct attributes', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    const gstatic = document.getElementById('anqr-preconnect-fonts-gstatic') as HTMLLinkElement;
    expect(gstatic.rel).toBe('preconnect');
    expect(gstatic.crossOrigin).toBe('anonymous');

    const dns = document.getElementById('anqr-dns-cs-iubenda') as HTMLLinkElement;
    expect(dns.rel).toBe('dns-prefetch');
  });

  it('scripts are loaded with async attribute by default', async () => {
    const { loadWebOnlyBootAssets } = await import('../../src/modules/platform/web-only-assets');
    loadWebOnlyBootAssets();

    const adsense = document.getElementById('anqr-adsense') as HTMLScriptElement;
    expect(adsense.async).toBe(true);
  });
});
