import type { BannerLog } from './banner-log.type';

export type HideBannerDeps = {
  adMobAvailable: boolean;
  AdMob: {
    hideBanner(): Promise<void>;
    removeBanner(): Promise<void>;
  } | null;
  log: BannerLog;
};
