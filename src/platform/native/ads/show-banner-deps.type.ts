import type { BannerLog } from './banner-log.type';
export type { ShowBannerPosition } from './show-banner-position.type';

type ShowBannerAdMobApi = {
  showBanner(options: {
    adId: string;
    adSize: unknown;
    position: unknown;
    margin: number;
  }): Promise<void>;
};

type BannerAdSizeApi = {
  ADAPTIVE_BANNER: unknown;
};

type BannerAdPositionApi = {
  TOP_CENTER: unknown;
  BOTTOM_CENTER: unknown;
};

export type ShowBannerDeps = {
  adMobAvailable: boolean;
  AdMob: ShowBannerAdMobApi | null;
  BannerAdSize: BannerAdSizeApi | null;
  BannerAdPosition: BannerAdPositionApi | null;
  log: BannerLog;
};
