/**
 * Platform Module
 * Platform-specific adapters for Capacitor plugins (AdMob, MediaStore)
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('PLATFORM');

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
} from './admob';

// Media Store Writer
export {
  MediaStoreWriter,
  type MediaStoreWriterPlugin,
  saveBase64ToDocuments,
} from './media-store';

// Platform UX helpers
export { showNativeToast } from './native-toast';
export { loadWebOnlyBootAssets } from './web-only-assets';
