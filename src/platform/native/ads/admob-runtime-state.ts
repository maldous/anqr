export const admobRuntime = {
  AdMob: null as any,
  BannerAdSize: null as any,
  BannerAdPosition: null as any,
  BannerAdPluginEvents: null as any,
  available: false,
  initialized: false,
  preparedInterstitialKeys: new Set<string>(),
  preparedRewardedKeys: new Set<string>(),
};
