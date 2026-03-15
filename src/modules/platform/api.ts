/**
 * Platform Module - Public API Manifest
 *
 * This file documents all public exports from the platform module.
 * Used by CI to check for API drift against index.ts exports.
 */

import { createLogger } from '../../infra/logging/logger';

const _log = createLogger('PLATFORM');

// AdMob initialization
export const ADMOB_INIT_API = ['initializeAdMob', 'isAdMobAvailable'] as const;

// AdMob banner
export const ADMOB_BANNER_API = [
  'showBannerAd',
  'showTopBanner',
  'showBottomBanner',
  'hideBannerAd',
  'removeBannerAd',
  'getBannerHeight',
  'getCurrentBannerPosition',
  'onBannerHeightChange',
] as const;

// AdMob interstitial
export const ADMOB_INTERSTITIAL_API = ['prepareInterstitial', 'showInterstitial'] as const;

// AdMob rewarded
export const ADMOB_REWARDED_API = [
  'prepareRewardedAd',
  'showRewardedAd',
  'isRewardedAdReady',
] as const;

// AdMob utilities
export const ADMOB_UTILS_API = [
  'prepareAllAds',
  'getGenerationCount',
  'resetGenerationCount',
  'trackGenerationAndShowAd',
] as const;

// MediaStore writer
export const MEDIA_STORE_API = ['MediaStoreWriter', 'saveBase64ToDocuments'] as const;

// Platform UX/runtime helpers
export const PLATFORM_HELPERS_API = ['showNativeToast', 'loadWebOnlyBootAssets'] as const;

// Types
export const TYPES = ['InterstitialType', 'RewardedType', 'MediaStoreWriterPlugin'] as const;

// All public exports
export const PUBLIC_API = [
  ...ADMOB_INIT_API,
  ...ADMOB_BANNER_API,
  ...ADMOB_INTERSTITIAL_API,
  ...ADMOB_REWARDED_API,
  ...ADMOB_UTILS_API,
  ...MEDIA_STORE_API,
  ...PLATFORM_HELPERS_API,
] as const;
