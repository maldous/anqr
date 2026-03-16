type AdMobPlugin = {
  initialize(options: {
    requestTrackingAuthorization: boolean;
    testingDevices: string[];
    initializeForTesting: boolean;
  }): Promise<void>;
  addListener(
    event: string,
    callback: (info: { height: number }) => void
  ): unknown;
  showBanner(options: {
    adId: string;
    adSize: unknown;
    position: unknown;
    margin: number;
  }): Promise<void>;
  hideBanner(): Promise<void>;
  removeBanner(): Promise<void>;
  showInterstitial(): Promise<void>;
  prepareInterstitial(options: { adId: string }): Promise<void>;
  showRewardedInterstitialAd(): Promise<unknown>;
  prepareRewardedInterstitialAd(options: { adId: string }): Promise<void>;
  showRewardedAd(): Promise<{ amount?: number; type?: string }>;
};

type BannerAdSizeApi = {
  ADAPTIVE_BANNER: unknown;
};

type BannerAdPositionApi = {
  TOP_CENTER: unknown;
  BOTTOM_CENTER: unknown;
};

type BannerAdPluginEventsApi = {
  SizeChanged: string;
};

export const admobRuntime = {
  AdMob: null as AdMobPlugin | null,
  BannerAdSize: null as BannerAdSizeApi | null,
  BannerAdPosition: null as BannerAdPositionApi | null,
  BannerAdPluginEvents: null as BannerAdPluginEventsApi | null,
  available: false,
  initialized: false,
  preparedInterstitialKeys: new Set<string>(),
  preparedRewardedKeys: new Set<string>(),
};
