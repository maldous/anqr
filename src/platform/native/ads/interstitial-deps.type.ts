type InterstitialAdMobApi = {
  showRewardedInterstitialAd(): Promise<unknown>;
  showInterstitial(): Promise<void>;
  prepareRewardedInterstitialAd(options: { adId: string }): Promise<void>;
  prepareInterstitial(options: { adId: string }): Promise<void>;
};

export type InterstitialDeps = {
  adMobAvailable: boolean;
  AdMob: InterstitialAdMobApi | null;
  preparedInterstitialKeys: Set<string>;
  log: {
    info: (msg: string, data?: Record<string, unknown>) => void;
    error: (msg: string, data?: Record<string, unknown>) => void;
    warn: (msg: string, data?: Record<string, unknown>) => void;
  };
};
