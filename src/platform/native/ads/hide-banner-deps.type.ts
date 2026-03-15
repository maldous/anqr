import type { BannerLog } from './banner-log.type';

export type HideBannerDeps = {
  adMobAvailable: boolean;
  AdMob: any;
  log: BannerLog;
};
