// Barrel: platform
export {
  prepareInterstitial,
  showInterstitial,
  prepareRewardedAd,
  showRewardedAd,
  isRewardedAdReady,
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
  prepareAllAds,
  getGenerationCount,
  resetGenerationCount,
  trackGenerationAndShowAd,
} from '../modules/platform/index';
export type { InterstitialType, RewardedType } from '../modules/platform/index';
