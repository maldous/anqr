import { createLogger } from "@/infra/logging/logger";
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
