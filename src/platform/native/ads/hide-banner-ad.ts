import { hideBannerAd as hideBannerAdInternal } from './admob-banner';
import { getBannerDeps } from './admob-runtime';

export async function hideBannerAd(): Promise<void> {
  return hideBannerAdInternal(getBannerDeps());
}
