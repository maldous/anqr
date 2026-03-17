import { removeBannerAd as removeBannerAdInternal } from "./admob-banner";
import { getBannerDeps } from "./admob-runtime";

export async function removeBannerAd(): Promise<void> {
  return removeBannerAdInternal(getBannerDeps());
}
