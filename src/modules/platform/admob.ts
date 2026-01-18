/**
 * AdMob Service
 * Handles AdMob ads for native Android/iOS apps via Capacitor.
 * Supports: Banner ads, Interstitial ads, Rewarded interstitial ads
 * This service is only used when running in a native app context.
 */

// AdMob Capacitor Plugin imports (lazy loaded)
let AdMob: any = null;
let BannerAdSize: any = null;
let BannerAdPosition: any = null;
let BannerAdPluginEvents: any = null;

// Track if AdMob is available and initialized
let adMobAvailable = false;
let adMobInitialized = false;

// Generation counter for showing interstitials
let generationCount = 0;

// Banner height tracking
let currentBannerHeight = 0;
let bannerHeightCallbacks: Array<(height: number) => void> = [];
let currentBannerPosition: 'top' | 'bottom' | null = null;

// Ad unit IDs - these would typically come from environment/config
const AD_UNIT_IDS = {
  // Test IDs for development
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
};

// Types for interstitial and rewarded ads
// These are flexible string types to allow for different ad contexts
export type InterstitialType =
  | 'interstitial'
  | 'rewardedInterstitial'
  | 'gallery'
  | 'export'
  | string;
export type RewardedType = 'rewarded' | 'rewardedInterstitial' | 'premium' | string;

/**
 * Initialize AdMob - call this early in app startup
 */
export async function initializeAdMob(): Promise<boolean> {
  if (adMobInitialized) return adMobAvailable;

  try {
    // Dynamically import the AdMob plugin
    const admobModule = await import('@capacitor-community/admob');
    AdMob = admobModule.AdMob;
    BannerAdSize = admobModule.BannerAdSize;
    BannerAdPosition = admobModule.BannerAdPosition;
    BannerAdPluginEvents = admobModule.BannerAdPluginEvents;

    // Initialize AdMob
    await AdMob.initialize({
      // Request tracking authorization on iOS
      requestTrackingAuthorization: true,
      // Test device IDs for development
      testingDevices: [],
      // Initialize even without consent (GDPR handled separately)
      initializeForTesting: false,
    });

    // Listen for banner size changes
    AdMob.addListener(BannerAdPluginEvents.SizeChanged, (info: { height: number }) => {
      currentBannerHeight = info.height;
      for (const cb of bannerHeightCallbacks) {
        cb(info.height);
      }
    });

    adMobAvailable = true;
    adMobInitialized = true;
    // biome-ignore lint/suspicious/noConsole: AdMob initialization logging
    console.log('[AdMob] Initialized successfully');
    return true;
  } catch (_err) {
    // biome-ignore lint/suspicious/noConsole: AdMob availability logging
    console.log('[AdMob] Not available (web environment or plugin not installed)');
    adMobAvailable = false;
    adMobInitialized = true;
    return false;
  }
}

/**
 * Check if AdMob is available (native app context)
 */
export function isAdMobAvailable(): boolean {
  return adMobAvailable;
}

/**
 * Get current banner height
 */
export function getBannerHeight(): number {
  return currentBannerHeight;
}

/**
 * Get current banner position
 */
export function getCurrentBannerPosition(): 'top' | 'bottom' | null {
  return currentBannerPosition;
}

/**
 * Subscribe to banner height changes
 */
export function onBannerHeightChange(callback: (height: number) => void): () => void {
  bannerHeightCallbacks.push(callback);
  // Immediately call with current height if banner is showing
  if (currentBannerHeight > 0) {
    callback(currentBannerHeight);
  }
  // Return unsubscribe function
  return () => {
    bannerHeightCallbacks = bannerHeightCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Show a banner ad
 */
export async function showBannerAd(position: 'top' | 'bottom' = 'bottom'): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;

  try {
    const bannerOptions = {
      adId: AD_UNIT_IDS.banner,
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };

    await AdMob.showBanner(bannerOptions);
    currentBannerPosition = position;
    // biome-ignore lint/suspicious/noConsole: AdMob banner logging
    console.log(`[AdMob] Banner shown at ${position}`);
    return true;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error('[AdMob] Failed to show banner:', err);
    return false;
  }
}

/**
 * Show banner at top of screen
 */
export async function showTopBanner(): Promise<boolean> {
  return showBannerAd('top');
}

/**
 * Show banner at bottom of screen
 */
export async function showBottomBanner(): Promise<boolean> {
  return showBannerAd('bottom');
}

/**
 * Hide the banner ad
 */
export async function hideBannerAd(): Promise<void> {
  if (!(adMobAvailable && AdMob)) return;

  try {
    await AdMob.hideBanner();
    currentBannerHeight = 0;
    currentBannerPosition = null;
    for (const cb of bannerHeightCallbacks) {
      cb(0);
    }
    // biome-ignore lint/suspicious/noConsole: AdMob banner logging
    console.log('[AdMob] Banner hidden');
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error('[AdMob] Failed to hide banner:', err);
  }
}

/**
 * Remove the banner ad completely
 */
export async function removeBannerAd(): Promise<void> {
  if (!(adMobAvailable && AdMob)) return;

  try {
    await AdMob.removeBanner();
    currentBannerHeight = 0;
    currentBannerPosition = null;
    for (const cb of bannerHeightCallbacks) {
      cb(0);
    }
    // biome-ignore lint/suspicious/noConsole: AdMob banner logging
    console.log('[AdMob] Banner removed');
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error('[AdMob] Failed to remove banner:', err);
  }
}

/**
 * Prepare an interstitial ad for later showing
 */
export async function prepareInterstitial(
  type: InterstitialType = 'interstitial'
): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;

  try {
    const adId =
      type === 'rewardedInterstitial' ? AD_UNIT_IDS.rewardedInterstitial : AD_UNIT_IDS.interstitial;

    if (type === 'rewardedInterstitial') {
      await AdMob.prepareRewardedInterstitialAd({ adId });
    } else {
      await AdMob.prepareInterstitial({ adId });
    }
    // biome-ignore lint/suspicious/noConsole: AdMob interstitial logging
    console.log(`[AdMob] ${type} prepared`);
    return true;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error(`[AdMob] Failed to prepare ${type}:`, err);
    return false;
  }
}

/**
 * Show an interstitial ad
 */
export async function showInterstitial(type: InterstitialType = 'interstitial'): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;

  try {
    if (type === 'rewardedInterstitial') {
      const result = await AdMob.showRewardedInterstitialAd();
      // biome-ignore lint/suspicious/noConsole: AdMob reward logging
      console.log('[AdMob] Rewarded interstitial shown, reward:', result);
    } else {
      await AdMob.showInterstitial();
      // biome-ignore lint/suspicious/noConsole: AdMob interstitial logging
      console.log('[AdMob] Interstitial shown');
    }
    return true;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error(`[AdMob] Failed to show ${type}:`, err);
    return false;
  }
}

/**
 * Prepare a rewarded ad for later showing
 */
export async function prepareRewardedAd(type: RewardedType = 'rewarded'): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;

  try {
    const adId =
      type === 'rewardedInterstitial' ? AD_UNIT_IDS.rewardedInterstitial : AD_UNIT_IDS.rewarded;

    if (type === 'rewardedInterstitial') {
      await AdMob.prepareRewardedInterstitialAd({ adId });
    } else {
      await AdMob.prepareRewardedAd({ adId });
    }
    // biome-ignore lint/suspicious/noConsole: AdMob ad logging
    console.log(`[AdMob] ${type} ad prepared`);
    return true;
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error(`[AdMob] Failed to prepare ${type} ad:`, err);
    return false;
  }
}

/**
 * Check if a rewarded ad is ready to show
 */
export function isRewardedAdReady(): boolean {
  // In a real implementation, track the prepared state
  return adMobAvailable;
}

/**
 * Show a rewarded ad and return the reward info
 */
export async function showRewardedAd(
  type: RewardedType = 'rewarded'
): Promise<{ rewarded: boolean; amount?: number; type?: string }> {
  if (!(adMobAvailable && AdMob)) return { rewarded: false };

  try {
    let result: any;
    if (type === 'rewardedInterstitial') {
      result = await AdMob.showRewardedInterstitialAd();
    } else {
      result = await AdMob.showRewardedAd();
    }
    // biome-ignore lint/suspicious/noConsole: AdMob reward logging
    console.log(`[AdMob] ${type} ad shown, reward:`, result);
    return {
      rewarded: true,
      amount: result?.amount,
      type: result?.type,
    };
  } catch (err) {
    // biome-ignore lint/suspicious/noConsole: AdMob error logging
    console.error(`[AdMob] Failed to show ${type} ad:`, err);
    return { rewarded: false };
  }
}

/**
 * Prepare all ad types for faster showing
 */
export async function prepareAllAds(): Promise<void> {
  if (!adMobAvailable) return;

  await Promise.all([
    prepareInterstitial('interstitial'),
    prepareInterstitial('rewardedInterstitial'),
    prepareRewardedAd('rewarded'),
  ]);
}

/**
 * Get current generation count
 */
export function getGenerationCount(): number {
  return generationCount;
}

/**
 * Reset generation count
 */
export function resetGenerationCount(): void {
  generationCount = 0;
}

/**
 * Track a generation and potentially show an interstitial
 * Returns true if an ad was shown
 */
export async function trackGenerationAndShowAd(
  interval: number = 5,
  type: InterstitialType = 'interstitial'
): Promise<boolean> {
  generationCount++;

  if (generationCount % interval === 0) {
    const shown = await showInterstitial(type);
    if (shown) {
      // Prepare the next one
      prepareInterstitial(type);
    }
    return shown;
  }

  return false;
}
