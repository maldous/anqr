/**
 * AdMob Service Module
 * Re-exports AdMob functionality from platform module
 */

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
} from './platform/';
