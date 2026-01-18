/**
 * AdMob Service
 * @deprecated Import from './platform' instead
 *
 * Handles AdMob ads for native Android/iOS apps via Capacitor.
 * Supports: Banner ads, Interstitial ads, Rewarded interstitial ads
 * This service is only used when running in a native app context.
 */

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
} from './platform/admob';
