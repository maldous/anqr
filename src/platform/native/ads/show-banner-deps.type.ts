import type { BannerLog } from './banner-log.type';
import type { BannerPosition } from './banner-position.type';
export type { ShowBannerPosition } from './show-banner-position.type';

export type ShowBannerDeps = {
  adMobAvailable: boolean;
  AdMob: any;
  BannerAdSize: any;
  BannerAdPosition: any;
  log: BannerLog;
};
