/**
 * AdMob Service
 * Handles AdMob ads for native Android/iOS apps via Capacitor.
 * Supports: Banner ads, Interstitial ads, Rewarded interstitial ads
 * This service is only used when running in a native app context.
 */

import { createLogger } from '../../lib/logger';

const log = createLogger('ADMOB');

// AdMob Capacitor Plugin imports (lazy loaded)
let AdMob: any = null;
let BannerAdSize: any = null;
let BannerAdPosition: any = null;
let BannerAdPluginEvents: any = null;

// Track if AdMob is available and initialized
let adMobAvailable = false;
let adMobInitialized = false;
let adMobInitializedAtMs = 0;

// Generation counter for showing interstitials
let generationCount = 0;

// Track prepared ad inventory per context/type so show calls can self-heal.
const preparedInterstitialKeys = new Set<string>();
const preparedRewardedKeys = new Set<string>();

// Banner height tracking
let currentBannerHeight = 0;
let bannerHeightCallbacks: Array<(height: number) => void> = [];
let currentBannerPosition: 'top' | 'bottom' | null = null;

type MonetizationInterruptionKind = 'interstitial' | 'rewarded' | 'rewardedInterstitial';
type MonetizationViolationReason =
  | 'unsupported_variant'
  | 'startup_cooldown'
  | 'session_limit'
  | 'interruption_cooldown'
  | 'kill_switch';

type MonetizationGuardrailPolicy = {
  maxBannerShowsPerSession: number;
  maxInterstitialShowsPerSession: number;
  maxRewardedShowsPerSession: number;
  maxInterruptionsPerSession: number;
  minMsAfterInitBeforeAnyAd: number;
  minMsBetweenInterruptions: number;
  killSwitchViolationThreshold: number;
};

type MonetizationGuardrailTelemetry = {
  bannerShowAttempts: number;
  bannerShown: number;
  interstitialShown: number;
  rewardedShown: number;
  totalInterruptions: number;
  blockedShows: number;
  blockedByKillSwitch: number;
  violationCount: number;
  trustGuardrailViolations: number;
  retentionRiskEvents: number;
  lastViolationReason: MonetizationViolationReason | null;
  killSwitchActive: boolean;
};

const parsePolicyNumber = (value: string | undefined, fallback: number): number => {
  if (value == null || value.trim() === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed < 0) return fallback;
  return Math.floor(parsed);
};

const GUARDRAIL_POLICY: MonetizationGuardrailPolicy = {
  // Ads load cap per runtime session
  maxBannerShowsPerSession: parsePolicyNumber(import.meta.env.VITE_ADMOB_MAX_BANNER_SHOWS, 3),
  // Interrupting ad cap per runtime session
  maxInterstitialShowsPerSession: parsePolicyNumber(
    import.meta.env.VITE_ADMOB_MAX_INTERSTITIAL_SHOWS,
    6
  ),
  maxRewardedShowsPerSession: parsePolicyNumber(import.meta.env.VITE_ADMOB_MAX_REWARDED_SHOWS, 4),
  // Combined cap across all interruption types
  maxInterruptionsPerSession: parsePolicyNumber(
    import.meta.env.VITE_ADMOB_MAX_INTERRUPTION_SHOWS,
    8
  ),
  // Ensure first ad does not appear during initial load
  minMsAfterInitBeforeAnyAd: parsePolicyNumber(import.meta.env.VITE_ADMOB_MIN_MS_AFTER_INIT, 1500),
  // Avoid consecutive interruption bursts
  minMsBetweenInterruptions: parsePolicyNumber(
    import.meta.env.VITE_ADMOB_MIN_MS_BETWEEN_ADS,
    45000
  ),
  // Session kill-switch threshold for repeated violations
  killSwitchViolationThreshold: parsePolicyNumber(
    import.meta.env.VITE_ADMOB_KILL_SWITCH_THRESHOLD,
    3
  ),
};

const monetizationTelemetry: MonetizationGuardrailTelemetry = {
  bannerShowAttempts: 0,
  bannerShown: 0,
  interstitialShown: 0,
  rewardedShown: 0,
  totalInterruptions: 0,
  blockedShows: 0,
  blockedByKillSwitch: 0,
  violationCount: 0,
  trustGuardrailViolations: 0,
  retentionRiskEvents: 0,
  lastViolationReason: null,
  killSwitchActive: import.meta.env.VITE_ADMOB_KILL_SWITCH === 'true',
};

let lastInterruptionAtMs = 0;

// Test ad unit IDs from Google (for testing before approval)
const TEST_AD_UNIT_IDS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  rewardedInterstitial: 'ca-app-pub-3940256099942544/5354046379',
};

// Production ad unit IDs from environment (set in Makefile)
const PROD_AD_UNIT_IDS = {
  bannerBottom: import.meta.env.VITE_ADMOB_BANNER_BOTTOM || '',
  bannerTop: import.meta.env.VITE_ADMOB_BANNER_TOP || '',
  interstitialExport: import.meta.env.VITE_ADMOB_INTERSTITIAL_EXPORT || '',
  interstitialGallery: import.meta.env.VITE_ADMOB_INTERSTITIAL_GALLERY || '',
  interstitialGeneration: import.meta.env.VITE_ADMOB_INTERSTITIAL_GENERATION || '',
  rewardedPremium: import.meta.env.VITE_ADMOB_REWARDED_PREMIUM || '',
  rewardedExportHd: import.meta.env.VITE_ADMOB_REWARDED_EXPORT_HD || '',
};

// Check if we're in test mode - strictly honor the Makefile env var
const isTestMode = import.meta.env.VITE_ADMOB_TESTING === 'true';

function pickProdAdUnitId(
  type: 'banner' | 'interstitial' | 'rewarded' | 'rewardedInterstitial',
  candidate: string | undefined
): string {
  const trimmed = (candidate ?? '').trim();
  if (trimmed) return trimmed;

  // Native builds without env wiring should still render ads in test mode,
  // otherwise AdMob receives an empty ad ID and never shows.
  log.warn('Missing production ad unit ID; falling back to Google test ID', { type });
  return TEST_AD_UNIT_IDS[type];
}

/**
 * Get the appropriate ad unit ID based on test mode and ad type
 */
function getAdUnitId(
  type: 'banner' | 'interstitial' | 'rewarded' | 'rewardedInterstitial',
  context?: string
): string {
  if (isTestMode) {
    // Test mode: use Google's test ad unit IDs
    return TEST_AD_UNIT_IDS[type];
  }

  // Production mode: use environment-configured ad unit IDs
  switch (type) {
    case 'banner':
      return pickProdAdUnitId(
        type,
        context === 'top' ? PROD_AD_UNIT_IDS.bannerTop : PROD_AD_UNIT_IDS.bannerBottom
      );
    case 'interstitial':
      if (context === 'export') return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialExport);
      if (context === 'gallery')
        return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialGallery);
      return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.interstitialGeneration);
    case 'rewarded':
      return pickProdAdUnitId(
        type,
        context === 'export_hd'
          ? PROD_AD_UNIT_IDS.rewardedExportHd
          : PROD_AD_UNIT_IDS.rewardedPremium
      );
    case 'rewardedInterstitial':
      return pickProdAdUnitId(type, PROD_AD_UNIT_IDS.rewardedPremium);
    default:
      return TEST_AD_UNIT_IDS[type];
  }
}

// Types for interstitial and rewarded ads
// These are flexible string types to allow for different ad contexts
export type InterstitialType =
  | 'interstitial'
  | 'rewardedInterstitial'
  | 'gallery'
  | 'export'
  | string;
export type RewardedType = 'rewarded' | 'rewardedInterstitial' | 'premium' | string;

function interstitialPrepareKey(type: InterstitialType): string {
  return type === 'rewardedInterstitial' ? 'rewardedInterstitial' : `interstitial:${type}`;
}

function rewardedPrepareKey(type: RewardedType): string {
  return type === 'rewardedInterstitial' ? 'rewardedInterstitial' : `rewarded:${type}`;
}

const ALLOWED_INTERSTITIAL_TYPES = new Set([
  'interstitial',
  'rewardedInterstitial',
  'gallery',
  'export',
]);
const ALLOWED_REWARDED_TYPES = new Set(['rewarded', 'rewardedInterstitial', 'premium']);

function trackViolation(
  reason: MonetizationViolationReason,
  details: Record<string, unknown> = {}
): void {
  monetizationTelemetry.violationCount += 1;
  monetizationTelemetry.trustGuardrailViolations += 1;
  monetizationTelemetry.lastViolationReason = reason;
  log.warn('Monetization guardrail violation', {
    reason,
    violationCount: monetizationTelemetry.violationCount,
    ...details,
  });

  if (
    !monetizationTelemetry.killSwitchActive &&
    monetizationTelemetry.violationCount >= GUARDRAIL_POLICY.killSwitchViolationThreshold
  ) {
    monetizationTelemetry.killSwitchActive = true;
    log.error('Monetization kill-switch activated', {
      threshold: GUARDRAIL_POLICY.killSwitchViolationThreshold,
      violationCount: monetizationTelemetry.violationCount,
    });
  }
}

function recordBlocked(reason: MonetizationViolationReason): void {
  monetizationTelemetry.blockedShows += 1;
  monetizationTelemetry.retentionRiskEvents += 1;
  if (reason === 'kill_switch') {
    monetizationTelemetry.blockedByKillSwitch += 1;
  }
  trackViolation(reason);
}

function adInitWarmupElapsed(nowMs: number): boolean {
  if (GUARDRAIL_POLICY.minMsAfterInitBeforeAnyAd <= 0) return true;
  return nowMs - adMobInitializedAtMs >= GUARDRAIL_POLICY.minMsAfterInitBeforeAnyAd;
}

function canShowInterruptingAd(
  kind: MonetizationInterruptionKind
): { allowed: true } | { allowed: false; reason: MonetizationViolationReason } {
  if (monetizationTelemetry.killSwitchActive) {
    return { allowed: false, reason: 'kill_switch' };
  }

  const nowMs = Date.now();
  if (!adInitWarmupElapsed(nowMs)) {
    return { allowed: false, reason: 'startup_cooldown' };
  }

  if (monetizationTelemetry.totalInterruptions >= GUARDRAIL_POLICY.maxInterruptionsPerSession) {
    return { allowed: false, reason: 'session_limit' };
  }

  if (
    kind === 'interstitial' &&
    monetizationTelemetry.interstitialShown >= GUARDRAIL_POLICY.maxInterstitialShowsPerSession
  ) {
    return { allowed: false, reason: 'session_limit' };
  }

  if (
    kind !== 'interstitial' &&
    monetizationTelemetry.rewardedShown >= GUARDRAIL_POLICY.maxRewardedShowsPerSession
  ) {
    return { allowed: false, reason: 'session_limit' };
  }

  if (
    lastInterruptionAtMs > 0 &&
    nowMs - lastInterruptionAtMs < GUARDRAIL_POLICY.minMsBetweenInterruptions
  ) {
    return { allowed: false, reason: 'interruption_cooldown' };
  }

  return { allowed: true };
}

function markInterruptionShown(kind: MonetizationInterruptionKind): void {
  lastInterruptionAtMs = Date.now();
  monetizationTelemetry.totalInterruptions += 1;
  if (kind === 'interstitial') {
    monetizationTelemetry.interstitialShown += 1;
  } else {
    monetizationTelemetry.rewardedShown += 1;
  }
}

export function getMonetizationGuardrailPolicy(): Readonly<MonetizationGuardrailPolicy> {
  return GUARDRAIL_POLICY;
}

export function getMonetizationGuardrailTelemetry(): Readonly<MonetizationGuardrailTelemetry> {
  return { ...monetizationTelemetry };
}

export function resetMonetizationGuardrailTelemetry(): void {
  monetizationTelemetry.bannerShowAttempts = 0;
  monetizationTelemetry.bannerShown = 0;
  monetizationTelemetry.interstitialShown = 0;
  monetizationTelemetry.rewardedShown = 0;
  monetizationTelemetry.totalInterruptions = 0;
  monetizationTelemetry.blockedShows = 0;
  monetizationTelemetry.blockedByKillSwitch = 0;
  monetizationTelemetry.violationCount = 0;
  monetizationTelemetry.trustGuardrailViolations = 0;
  monetizationTelemetry.retentionRiskEvents = 0;
  monetizationTelemetry.lastViolationReason = null;
  monetizationTelemetry.killSwitchActive = import.meta.env.VITE_ADMOB_KILL_SWITCH === 'true';
  lastInterruptionAtMs = 0;
}

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
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: isTestMode,
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
    adMobInitializedAtMs = Date.now();
    preparedInterstitialKeys.clear();
    preparedRewardedKeys.clear();
    resetMonetizationGuardrailTelemetry();
    log.info('Initialized successfully', { mode: isTestMode ? 'TEST' : 'PRODUCTION' });
    return true;
  } catch (_err) {
    log.debug('Not available (web environment or plugin not installed)');
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
  monetizationTelemetry.bannerShowAttempts += 1;
  if (!(adMobAvailable && AdMob)) return false;

  if (monetizationTelemetry.killSwitchActive) {
    recordBlocked('kill_switch');
    return false;
  }
  if (
    GUARDRAIL_POLICY.maxBannerShowsPerSession > 0 &&
    monetizationTelemetry.bannerShown >= GUARDRAIL_POLICY.maxBannerShowsPerSession
  ) {
    recordBlocked('session_limit');
    return false;
  }
  if (!adInitWarmupElapsed(Date.now())) {
    recordBlocked('startup_cooldown');
    return false;
  }

  try {
    const bannerOptions = {
      adId: getAdUnitId('banner', position),
      adSize: BannerAdSize.ADAPTIVE_BANNER,
      position: position === 'top' ? BannerAdPosition.TOP_CENTER : BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    };

    await AdMob.showBanner(bannerOptions);
    currentBannerPosition = position;
    monetizationTelemetry.bannerShown += 1;
    log.info('Banner shown', { position });
    return true;
  } catch (err) {
    log.error('Failed to show banner', { error: err });
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
    log.info('Banner hidden');
  } catch (err) {
    log.error('Failed to hide banner', { error: err });
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
    log.info('Banner removed');
  } catch (err) {
    log.error('Failed to remove banner', { error: err });
  }
}

/**
 * Prepare an interstitial ad for later showing
 */
export async function prepareInterstitial(
  type: InterstitialType = 'interstitial'
): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;
  if (!ALLOWED_INTERSTITIAL_TYPES.has(type)) {
    recordBlocked('unsupported_variant');
    return false;
  }
  if (monetizationTelemetry.killSwitchActive) {
    recordBlocked('kill_switch');
    return false;
  }

  try {
    const key = interstitialPrepareKey(type);
    const adId =
      type === 'rewardedInterstitial'
        ? getAdUnitId('rewardedInterstitial')
        : getAdUnitId('interstitial', type);

    if (type === 'rewardedInterstitial') {
      await AdMob.prepareRewardedInterstitialAd({ adId });
    } else {
      await AdMob.prepareInterstitial({ adId });
    }
    preparedInterstitialKeys.add(key);
    log.info('Ad prepared', { type, mode: isTestMode ? 'TEST' : 'PROD' });
    return true;
  } catch (err) {
    preparedInterstitialKeys.delete(interstitialPrepareKey(type));
    log.error('Failed to prepare ad', { type, error: err });
    return false;
  }
}

/**
 * Show an interstitial ad
 */
export async function showInterstitial(type: InterstitialType = 'interstitial'): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;
  if (!ALLOWED_INTERSTITIAL_TYPES.has(type)) {
    recordBlocked('unsupported_variant');
    return false;
  }

  const key = interstitialPrepareKey(type);
  const gate = canShowInterruptingAd(
    type === 'rewardedInterstitial' ? 'rewardedInterstitial' : 'interstitial'
  );
  if (!gate.allowed) {
    recordBlocked(gate.reason);
    return false;
  }

  try {
    if (!preparedInterstitialKeys.has(key)) {
      const prepared = await prepareInterstitial(type);
      if (!prepared) {
        log.warn('Interstitial not ready and prepare failed', { type });
        return false;
      }
    }

    if (type === 'rewardedInterstitial') {
      const result = await AdMob.showRewardedInterstitialAd();
      log.info('Rewarded interstitial shown', { reward: result });
    } else {
      await AdMob.showInterstitial();
      log.info('Interstitial shown');
    }
    markInterruptionShown(
      type === 'rewardedInterstitial' ? 'rewardedInterstitial' : 'interstitial'
    );
    preparedInterstitialKeys.delete(key);
    void prepareInterstitial(type);
    return true;
  } catch (err) {
    preparedInterstitialKeys.delete(key);
    log.error('Failed to show ad', { type, error: err });
    return false;
  }
}

/**
 * Prepare a rewarded ad for later showing
 */
export async function prepareRewardedAd(type: RewardedType = 'rewarded'): Promise<boolean> {
  if (!(adMobAvailable && AdMob)) return false;
  if (!ALLOWED_REWARDED_TYPES.has(type)) {
    recordBlocked('unsupported_variant');
    return false;
  }
  if (monetizationTelemetry.killSwitchActive) {
    recordBlocked('kill_switch');
    return false;
  }

  try {
    const key = rewardedPrepareKey(type);
    const context =
      type === 'premium' ? 'premium' : type === 'rewardedInterstitial' ? undefined : 'export_hd';
    const adId =
      type === 'rewardedInterstitial'
        ? getAdUnitId('rewardedInterstitial')
        : getAdUnitId('rewarded', context);

    if (type === 'rewardedInterstitial') {
      await AdMob.prepareRewardedInterstitialAd({ adId });
    } else {
      await AdMob.prepareRewardedAd({ adId });
    }
    preparedRewardedKeys.add(key);
    log.info('Rewarded ad prepared', { type, mode: isTestMode ? 'TEST' : 'PROD' });
    return true;
  } catch (err) {
    preparedRewardedKeys.delete(rewardedPrepareKey(type));
    log.error('Failed to prepare rewarded ad', { type, error: err });
    return false;
  }
}

/**
 * Check if a rewarded ad is ready to show
 */
export function isRewardedAdReady(): boolean {
  return adMobAvailable && preparedRewardedKeys.size > 0;
}

/**
 * Show a rewarded ad and return the reward info
 */
export async function showRewardedAd(
  type: RewardedType = 'rewarded'
): Promise<{ rewarded: boolean; amount?: number; type?: string }> {
  if (!(adMobAvailable && AdMob)) return { rewarded: false };
  if (!ALLOWED_REWARDED_TYPES.has(type)) {
    recordBlocked('unsupported_variant');
    return { rewarded: false };
  }

  const interruptionKind: MonetizationInterruptionKind =
    type === 'rewardedInterstitial' ? 'rewardedInterstitial' : 'rewarded';
  const gate = canShowInterruptingAd(interruptionKind);
  if (!gate.allowed) {
    recordBlocked(gate.reason);
    return { rewarded: false };
  }

  const key = rewardedPrepareKey(type);

  try {
    if (!preparedRewardedKeys.has(key)) {
      const prepared = await prepareRewardedAd(type);
      if (!prepared) {
        log.warn('Rewarded ad not ready and prepare failed', { type });
        return { rewarded: false };
      }
    }

    let result: any;
    if (type === 'rewardedInterstitial') {
      result = await AdMob.showRewardedInterstitialAd();
    } else {
      result = await AdMob.showRewardedAd();
    }
    preparedRewardedKeys.delete(key);
    markInterruptionShown(interruptionKind);
    void prepareRewardedAd(type);
    log.info('Rewarded ad shown', { type, reward: result });
    return {
      rewarded: true,
      amount: result?.amount,
      type: result?.type,
    };
  } catch (err) {
    preparedRewardedKeys.delete(key);
    log.error('Failed to show rewarded ad', { type, error: err });
    return { rewarded: false };
  }
}

/**
 * Prepare all ad types for faster showing
 */
export async function prepareAllAds(): Promise<void> {
  if (!adMobAvailable) return;

  await Promise.all([
    prepareInterstitial('export'),
    prepareInterstitial('gallery'),
    prepareInterstitial('interstitial'),
    prepareInterstitial('rewardedInterstitial'),
    prepareRewardedAd('premium'),
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
  resetMonetizationGuardrailTelemetry();
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
