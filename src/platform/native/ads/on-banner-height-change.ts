import { bannerHeightCallbacks, currentBannerHeight } from './banner-state-store';
import type { BannerHeightCallback } from './banner-height-callback.type';

export function onBannerHeightChange(callback: BannerHeightCallback): () => void {
  bannerHeightCallbacks.value.push(callback);
  if (currentBannerHeight.value > 0) {
    callback(currentBannerHeight.value);
  }

  return () => {
    bannerHeightCallbacks.value = bannerHeightCallbacks.value.filter((cb) => cb !== callback);
  };
}
