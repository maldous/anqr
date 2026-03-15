import { showBannerAd as showBannerAdCore } from './show-banner-core';
import type { ShowBannerDeps } from './show-banner-deps.type';

export async function showBannerAd(
  deps: ShowBannerDeps,
  position: 'top' | 'bottom' = 'bottom'
): Promise<boolean> {
  return showBannerAdCore(deps, position);
}
