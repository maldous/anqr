import { beforeEach, describe, expect, it, vi } from 'vitest';

const logger = {
  trace: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

vi.mock('../../src/lib/logger', () => ({
  createLogger: () => logger,
}));

function buildAdMobPlugin(overrides: Record<string, any> = {}) {
  const listeners: Record<string, (payload: any) => void> = {};
  return {
    listeners,
    module: {
      AdMob: {
        initialize: vi.fn().mockResolvedValue(undefined),
        addListener: vi.fn((event: string, cb: (payload: any) => void) => {
          listeners[event] = cb;
        }),
        showBanner: vi.fn().mockResolvedValue(undefined),
        hideBanner: vi.fn().mockResolvedValue(undefined),
        removeBanner: vi.fn().mockResolvedValue(undefined),
        prepareInterstitial: vi.fn().mockResolvedValue(undefined),
        prepareRewardedInterstitialAd: vi.fn().mockResolvedValue(undefined),
        showInterstitial: vi.fn().mockResolvedValue(undefined),
        showRewardedInterstitialAd: vi.fn().mockResolvedValue({ amount: 1, type: 'coin' }),
        prepareRewardedAd: vi.fn().mockResolvedValue(undefined),
        showRewardedAd: vi.fn().mockResolvedValue({ amount: 5, type: 'gem' }),
        ...overrides,
      },
      BannerAdSize: { ADAPTIVE_BANNER: 'ADAPTIVE_BANNER' },
      BannerAdPosition: { TOP_CENTER: 'TOP_CENTER', BOTTOM_CENTER: 'BOTTOM_CENTER' },
      BannerAdPluginEvents: { SizeChanged: 'SizeChanged' },
    },
  };
}

describe('platform admob service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('initializes and manages banner lifecycle and callbacks', async () => {
    const plugin = buildAdMobPlugin();
    vi.doMock('@capacitor-community/admob', () => plugin.module);

    const mod = await import('../../src/modules/platform/admob');
    expect(await mod.initializeAdMob()).toBe(true);
    expect(mod.isAdMobAvailable()).toBe(true);

    const heights: number[] = [];
    const off = mod.onBannerHeightChange((h) => heights.push(h));

    plugin.listeners.SizeChanged({ height: 64 });
    expect(mod.getBannerHeight()).toBe(64);
    expect(heights).toEqual([64]);

    expect(await mod.showTopBanner()).toBe(true);
    expect(mod.getCurrentBannerPosition()).toBe('top');
    expect(plugin.module.AdMob.showBanner).toHaveBeenCalledWith(
      expect.objectContaining({ position: 'TOP_CENTER' })
    );

    await mod.hideBannerAd();
    expect(mod.getBannerHeight()).toBe(0);
    expect(mod.getCurrentBannerPosition()).toBeNull();
    expect(heights.at(-1)).toBe(0);

    await mod.showBottomBanner();
    await mod.removeBannerAd();
    expect(mod.getCurrentBannerPosition()).toBeNull();
    off();
  });

  it('prepares and shows interstitial and rewarded variants including failures', async () => {
    const plugin = buildAdMobPlugin();
    vi.doMock('@capacitor-community/admob', () => plugin.module);
    const mod = await import('../../src/modules/platform/admob');
    await mod.initializeAdMob();

    // showInterstitial should self-prepare when a context was not preloaded
    const prepareBeforeGallery = plugin.module.AdMob.prepareInterstitial.mock.calls.length;
    expect(await mod.showInterstitial('gallery')).toBe(true);
    expect(plugin.module.AdMob.prepareInterstitial.mock.calls.length).toBeGreaterThan(
      prepareBeforeGallery
    );

    expect(await mod.prepareInterstitial('interstitial')).toBe(true);
    expect(await mod.prepareInterstitial('rewardedInterstitial')).toBe(true);
    expect(plugin.module.AdMob.prepareInterstitial).toHaveBeenCalled();
    expect(plugin.module.AdMob.prepareRewardedInterstitialAd).toHaveBeenCalled();

    expect(await mod.showInterstitial('interstitial')).toBe(true);
    expect(await mod.showInterstitial('rewardedInterstitial')).toBe(true);

    expect(await mod.prepareRewardedAd('rewarded')).toBe(true);
    expect(await mod.prepareRewardedAd('rewardedInterstitial')).toBe(true);
    expect(await mod.prepareRewardedAd('premium')).toBe(true);

    expect(mod.isRewardedAdReady()).toBe(true);

    // showRewardedAd should self-prepare when needed
    const prepareBeforePremium = plugin.module.AdMob.prepareRewardedAd.mock.calls.length;
    await expect(mod.showRewardedAd('premium')).resolves.toMatchObject({
      rewarded: true,
      amount: 5,
      type: 'gem',
    });
    expect(plugin.module.AdMob.prepareRewardedAd.mock.calls.length).toBeGreaterThanOrEqual(
      prepareBeforePremium
    );

    await expect(mod.showRewardedAd('rewarded')).resolves.toMatchObject({
      rewarded: true,
      amount: 5,
      type: 'gem',
    });
    await expect(mod.showRewardedAd('rewardedInterstitial')).resolves.toMatchObject({
      rewarded: true,
      amount: 1,
      type: 'coin',
    });

    plugin.module.AdMob.showInterstitial.mockRejectedValueOnce(new Error('x'));
    await expect(mod.showInterstitial('interstitial')).resolves.toBe(false);

    plugin.module.AdMob.prepareRewardedAd.mockRejectedValueOnce(new Error('x'));
    await expect(mod.prepareRewardedAd('rewarded')).resolves.toBe(false);

    plugin.module.AdMob.showRewardedAd.mockRejectedValueOnce(new Error('x'));
    await expect(mod.showRewardedAd('rewarded')).resolves.toEqual({ rewarded: false });
  });

  it('tracks generation intervals and supports not-available fallback', async () => {
    const plugin = buildAdMobPlugin();
    vi.doMock('@capacitor-community/admob', () => plugin.module);
    const mod = await import('../../src/modules/platform/admob');

    await mod.initializeAdMob();
    mod.resetGenerationCount();
    expect(mod.getGenerationCount()).toBe(0);

    expect(await mod.trackGenerationAndShowAd(3, 'interstitial')).toBe(false);
    expect(await mod.trackGenerationAndShowAd(3, 'interstitial')).toBe(false);
    expect(await mod.trackGenerationAndShowAd(3, 'interstitial')).toBe(true);
    expect(mod.getGenerationCount()).toBe(3);

    await mod.prepareAllAds();
    expect(plugin.module.AdMob.prepareInterstitial).toHaveBeenCalled();
    expect(plugin.module.AdMob.prepareRewardedAd).toHaveBeenCalled();

    vi.resetModules();
    vi.doMock('@capacitor-community/admob', () => {
      throw new Error('missing');
    });
    const modUnavailable = await import('../../src/modules/platform/admob');
    expect(await modUnavailable.initializeAdMob()).toBe(false);
    expect(modUnavailable.isAdMobAvailable()).toBe(false);
    expect(await modUnavailable.showBannerAd()).toBe(false);
    expect(await modUnavailable.prepareInterstitial()).toBe(false);
    expect(await modUnavailable.showInterstitial()).toBe(false);
    expect(await modUnavailable.prepareRewardedAd()).toBe(false);
    expect(await modUnavailable.showRewardedAd()).toEqual({ rewarded: false });
    expect(modUnavailable.isRewardedAdReady()).toBe(false);
  });
});
