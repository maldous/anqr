import { initializeAdMob, prepareAllAds, showBannerAd } from "@/platform/native";
import type { Logger } from "@/lib/logger";

export async function initAds(log: Logger): Promise<void> {
  try {
    // Delay to ensure Capacitor bridge is fully initialized and WebView has stabilized.
    // Longer delay in dev/test to reduce memory pressure on resource-constrained simulators.
    const initDelay = import.meta.env.DEV ? 3000 : 1000;
    await new Promise((resolve) => setTimeout(resolve, initDelay));
    const initialized = await initializeAdMob();
    if (initialized) {
      await prepareAllAds();
      // Delay before showing the banner ad — the banner spawns a separate
      // WebContent process; give the main view time to finish first paint.
      const bannerDelay = import.meta.env.DEV ? 5000 : 2000;
      await new Promise((resolve) => setTimeout(resolve, bannerDelay));
      await showBannerAd("bottom");
    }
  } catch (error) {
    log.error("AdMob initialization error", { error });
  }
}
