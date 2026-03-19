import { createLogger } from "../../../../observability/logging/src";
import { admobRuntime } from "./admob-runtime-state";

const log = createLogger("ADMOB");

export function getBannerDeps() {
  return {
    adMobAvailable: admobRuntime.available,
    AdMob: admobRuntime.AdMob,
    BannerAdSize: admobRuntime.BannerAdSize,
    BannerAdPosition: admobRuntime.BannerAdPosition,
    log,
  };
}
