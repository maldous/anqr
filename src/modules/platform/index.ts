/**
 * Platform Module
 * Capacitor plugin APIs for native Android/iOS functionality
 */

// AdMob
export {
  initializeAdMob,
  isAdMobAvailable,
  getBannerHeight,
  getCurrentBannerPosition,
  onBannerHeightChange,
  showBannerAd,
  showTopBanner,
  showBottomBanner,
  hideBannerAd,
  removeBannerAd,
  prepareInterstitial,
  showInterstitial,
  prepareRewardedAd,
  isRewardedAdReady,
  showRewardedAd,
  prepareAllAds,
  getGenerationCount,
  resetGenerationCount,
  trackGenerationAndShowAd,
  type InterstitialType,
  type RewardedType,
} from './admob';

// Media Store
export {
  MediaStoreWriter,
  saveBase64ToDocuments,
  type MediaStoreWriterPlugin,
} from './media-store';
