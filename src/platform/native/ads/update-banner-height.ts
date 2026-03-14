import { bannerHeightCallbacks, currentBannerHeight } from './banner-state-store';

export function updateBannerHeight(height: number): void {
  currentBannerHeight.value = height;

  for (const callback of bannerHeightCallbacks.value) {
    callback(height);
  }
}
