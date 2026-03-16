import type { BannerLog } from './banner-log.type';
export type { ShowBannerPosition } from './show-banner-position.type';

export type ShowBannerDeps = {
  adMobAvailable: boolean;
  AdMob: {
    showBanner(options: {
      adId: string;
      adSize: unknown;
      position: unknown;
      margin: number;
    }): Promise<void>;
  } | null;
  BannerAdSize: { ADAPTIVE_BANNER: unknown } | null;
  BannerAdPosition: { TOP_CENTER: unknown; BOTTOM_CENTER: unknown } | null;
  log: BannerLog;
};
