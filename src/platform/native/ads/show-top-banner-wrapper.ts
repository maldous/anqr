import { showTopBanner as showTopBannerCore } from './show-top-banner-core';
import type { ShowBannerDeps } from './show-banner-deps.type';

export async function showTopBanner(deps: ShowBannerDeps) {
  return showTopBannerCore(deps);
}
