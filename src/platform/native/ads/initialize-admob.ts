import { createLogger } from '../../../infra/logging/logger';
import { isTestMode } from './admob-config';
import { updateBannerHeight } from './admob-banner-state';
import { admobRuntime } from './admob-runtime-state';

const log = createLogger('ADMOB');

export async function initializeAdMob(): Promise<boolean> {
  if (admobRuntime.initialized) return admobRuntime.available;

  try {
    const admobModule = await import('@capacitor-community/admob');
    admobRuntime.AdMob = admobModule.AdMob;
    admobRuntime.BannerAdSize = admobModule.BannerAdSize;
    admobRuntime.BannerAdPosition = admobModule.BannerAdPosition;
    admobRuntime.BannerAdPluginEvents = admobModule.BannerAdPluginEvents;
    await admobRuntime.AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: isTestMode,
    });
    admobRuntime.AdMob.addListener(
      admobRuntime.BannerAdPluginEvents.SizeChanged,
      (info: { height: number }) => updateBannerHeight(info.height)
    );
    admobRuntime.available = true;
    admobRuntime.initialized = true;
    admobRuntime.preparedInterstitialKeys.clear();
    admobRuntime.preparedRewardedKeys.clear();
    log.info('Initialized successfully', { mode: isTestMode ? 'TEST' : 'PRODUCTION' });
    return true;
  } catch {
    log.debug('Not available (web environment or plugin not installed)');
    admobRuntime.available = false;
    admobRuntime.initialized = true;
    return false;
  }
}
