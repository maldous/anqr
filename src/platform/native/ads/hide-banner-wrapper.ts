import { hideBannerAd as hideBannerAdCore } from "./hide-banner-core";
import type { HideBannerDeps } from "./hide-banner-deps.types";

export async function hideBannerAd(deps: HideBannerDeps) {
  return hideBannerAdCore(deps);
}
