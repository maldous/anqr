/**
 * AdMob public surface.
 */

export { getBannerHeight, getCurrentBannerPosition, onBannerHeightChange } from './admob-banner';
export { getGenerationCount, resetGenerationCount } from './admob-generation';
export type { InterstitialType, RewardedType } from './admob-config';
export { initializeAdMob, isAdMobAvailable } from './admob-runtime';
export {
  showBannerAd,
  showTopBanner,
  showBottomBanner,
  hideBannerAd,
  removeBannerAd,
} from './admob-banner-api';
export { prepareInterstitial, showInterstitial } from './admob-interstitial-api';
export { prepareRewardedAd, isRewardedAdReady } from './admob-rewarded-api';
export { showRewardedAd } from './show-rewarded-ad';
export { prepareAllAds, trackGenerationAndShowAd } from './admob-batch-api';
