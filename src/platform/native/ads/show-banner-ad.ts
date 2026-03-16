import { showBannerAd as showBannerAdInternal } from "./admob-banner";
import type { BannerPosition } from "./banner-position.type";
import { getBannerDeps } from "./admob-runtime";

export async function showBannerAd(position: BannerPosition = "bottom"): Promise<boolean> {
  return showBannerAdInternal(getBannerDeps(), position);
}
