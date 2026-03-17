import { showTopBanner as showTopBannerInternal } from "./admob-banner";
import { getBannerDeps } from "./admob-runtime";

export async function showTopBanner(): Promise<boolean> {
  return showTopBannerInternal(getBannerDeps());
}
