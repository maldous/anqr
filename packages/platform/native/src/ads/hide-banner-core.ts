import { setCurrentBannerPosition, updateBannerHeight } from "./admob-banner.types";
import type { HideBannerDeps } from "./hide-banner-deps.types";

export async function hideBannerAd(deps: HideBannerDeps): Promise<void> {
  if (!(deps.adMobAvailable && deps.AdMob)) {
    return;
  }

  try {
    await deps.AdMob.hideBanner();
    updateBannerHeight(0);
    setCurrentBannerPosition(null);
    deps.log.info("Banner hidden");
  } catch (error) {
    deps.log.error("Failed to hide banner", { error });
  }
}
