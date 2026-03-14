import { showBottomBanner as showBottomBannerInternal } from './admob-banner';
import { getBannerDeps } from './admob-runtime';

export async function showBottomBanner(): Promise<boolean> {
  return showBottomBannerInternal(getBannerDeps());
}
