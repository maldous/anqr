import { createLogger } from "../../../infra/logging/logger";
import { isTestMode } from "./admob-config";
import { updateBannerHeight } from "./admob-banner.types";
import { admobRuntime } from "./admob-runtime-state";

const log = createLogger("ADMOB");

export async function initializeAdMob(): Promise<boolean> {
  if (admobRuntime.initialized) return admobRuntime.available;

  try {
    const admobModule = await import("@capacitor-community/admob");
    const adMob = admobModule.AdMob;
    const bannerEvents = admobModule.BannerAdPluginEvents;
    admobRuntime.AdMob = adMob as unknown as typeof admobRuntime.AdMob;
    admobRuntime.BannerAdSize =
      admobModule.BannerAdSize as unknown as typeof admobRuntime.BannerAdSize;
    admobRuntime.BannerAdPosition =
      admobModule.BannerAdPosition as unknown as typeof admobRuntime.BannerAdPosition;
    admobRuntime.BannerAdPluginEvents =
      bannerEvents as unknown as typeof admobRuntime.BannerAdPluginEvents;
    await adMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: [],
      initializeForTesting: isTestMode,
    } as Parameters<typeof adMob.initialize>[0]);
    adMob.addListener(bannerEvents.SizeChanged, (info: { height: number }) =>
      updateBannerHeight(info.height),
    );
    admobRuntime.available = true;
    admobRuntime.initialized = true;
    admobRuntime.preparedInterstitialKeys.clear();
    admobRuntime.preparedRewardedKeys.clear();
    log.info("Initialized successfully", { mode: isTestMode ? "TEST" : "PRODUCTION" });
    return true;
  } catch {
    log.debug("Not available (web environment or plugin not installed)");
    admobRuntime.available = false;
    admobRuntime.initialized = true;
    return false;
  }
}
