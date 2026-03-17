import { createLogger } from "@/infra/logging/logger";
import { admobRuntime } from "./admob-runtime-state";

const log = createLogger("ADMOB");

export function getInterstitialDeps() {
  return {
    adMobAvailable: admobRuntime.available,
    AdMob: admobRuntime.AdMob,
    preparedInterstitialKeys: admobRuntime.preparedInterstitialKeys,
    log,
  };
}
