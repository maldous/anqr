import { removeBannerAd as removeBannerAdCore } from './remove-banner-core';
import type { HideBannerDeps } from './hide-banner-deps.type';

export async function removeBannerAd(deps: HideBannerDeps) {
  return removeBannerAdCore(deps);
}
