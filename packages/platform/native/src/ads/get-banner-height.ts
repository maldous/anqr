import { currentBannerHeight } from "./banner-state-store";

export function getBannerHeight(): number {
  return currentBannerHeight.value;
}
