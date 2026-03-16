/**
 * Platform Module
 * Platform-specific adapters for Capacitor plugins (AdMob, MediaStore)
 */

import { createLogger } from "../../infra/logging/logger";

const _log = createLogger("PLATFORM");

// AdMob Service
export {
  getBannerHeight,
  getCurrentBannerPosition,
  getGenerationCount,
  hideBannerAd,
  type InterstitialType,
  initializeAdMob,
  isAdMobAvailable,
  isRewardedAdReady,
  onBannerHeightChange,
  prepareAllAds,
  prepareInterstitial,
  prepareRewardedAd,
  type RewardedType,
  removeBannerAd,
  resetGenerationCount,
  showBannerAd,
  showBottomBanner,
  showInterstitial,
  showRewardedAd,
  showTopBanner,
  trackGenerationAndShowAd,
} from "../../platform/native/ads/admob";

// Media Store Writer
export {
  MediaStoreWriter,
  type MediaStoreWriterPlugin,
  saveBase64ToDocuments,
} from "../../platform/native/media-store/media-store";

// Platform UX helpers
export { showNativeToast } from "../../platform/native/notifications/native-toast";
export { loadWebOnlyBootAssets } from "../../platform/browser/boot/web-only-assets";
