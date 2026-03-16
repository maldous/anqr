import { getAdUnitId } from "./admob-config";
import { setCurrentBannerPosition } from "./admob-banner.types";
import type { ShowBannerDeps, ShowBannerPosition } from "./show-banner-deps.types";

export async function showBannerAd(
  deps: ShowBannerDeps,
  position: ShowBannerPosition = "bottom",
): Promise<boolean> {
  if (!(deps.adMobAvailable && deps.AdMob && deps.BannerAdSize && deps.BannerAdPosition)) {
    return false;
  }

  try {
    await deps.AdMob.showBanner({
      adId: getAdUnitId("banner", position),
      adSize: deps.BannerAdSize.ADAPTIVE_BANNER,
      position:
        position === "top" ? deps.BannerAdPosition.TOP_CENTER : deps.BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
    });
    setCurrentBannerPosition(position);
    deps.log.info("Banner shown", { position });
    return true;
  } catch (error) {
    deps.log.error("Failed to show banner", { error });
    return false;
  }
}
