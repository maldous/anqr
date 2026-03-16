import type { AdMobPlugin } from "./admob-plugin.type";

export const admobRuntime = {
  AdMob: null as AdMobPlugin | null,
  BannerAdSize: null as { ADAPTIVE_BANNER: unknown } | null,
  BannerAdPosition: null as { TOP_CENTER: unknown; BOTTOM_CENTER: unknown } | null,
  BannerAdPluginEvents: null as { SizeChanged: string } | null,
  available: false,
  initialized: false,
  preparedInterstitialKeys: new Set<string>(),
  preparedRewardedKeys: new Set<string>(),
};
