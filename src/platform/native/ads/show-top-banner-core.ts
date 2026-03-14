import { showBannerAd } from './show-banner-core';
import type { ShowBannerDeps } from './show-banner-deps.type';

export async function showTopBanner(deps: ShowBannerDeps): Promise<boolean> {
  return showBannerAd(deps, 'top');
}
