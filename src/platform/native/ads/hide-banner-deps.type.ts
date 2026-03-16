import type { BannerLog } from './banner-log.type';

type BannerAdMobApi = {
  hideBanner(): Promise<void>;
  removeBanner(): Promise<void>;
};

export type HideBannerDeps = {
  adMobAvailable: boolean;
  AdMob: BannerAdMobApi | null;
  log: BannerLog;
};
