/**
 * Platform Module
 * Platform-specific adapters for Capacitor plugins (AdMob, MediaStore)
 */

// AdMob Service
export {
  initializeAdMob,
  isAdMobAvailable,
  showBannerAd,
  hideBannerAd,
  removeBannerAd,
  showTopBanner,
  showBottomBanner,
  getBannerHeight,
  getCurrentBannerPosition,
  onBannerHeightChange,
  prepareInterstitial,
  showInterstitial,
  prepareRewardedAd,
  showRewardedAd,
  isRewardedAdReady,
  prepareAllAds,
  getGenerationCount,
  resetGenerationCount,
  trackGenerationAndShowAd,
  type InterstitialType,
  type RewardedType,
} from './admob';

// Media Store Writer
export {
  saveBase64ToDocuments,
  MediaStoreWriter,
  type MediaStoreWriterPlugin,
} from './media-store';
