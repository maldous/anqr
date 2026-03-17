import { setCurrentBannerPosition, updateBannerHeight } from "./admob-banner.types";
import type { HideBannerDeps } from "./hide-banner-deps.types";

export async function removeBannerAd(deps: HideBannerDeps): Promise<void> {
  if (!(deps.adMobAvailable && deps.AdMob)) {
    return;
  }

  try {
    await deps.AdMob.removeBanner();
    updateBannerHeight(0);
    setCurrentBannerPosition(null);
    deps.log.info("Banner removed");
  } catch (error) {
    deps.log.error("Failed to remove banner", { error });
  }
}
