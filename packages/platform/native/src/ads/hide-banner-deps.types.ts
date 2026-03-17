import type { BannerLog } from "./banner-log.types";

export type HideBannerDeps = {
  adMobAvailable: boolean;
  AdMob: {
    hideBanner(): Promise<void>;
    removeBanner(): Promise<void>;
  } | null;
  log: BannerLog;
};
