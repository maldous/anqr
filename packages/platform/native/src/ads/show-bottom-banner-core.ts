import { showBannerAd } from "./show-banner-core";
import type { ShowBannerDeps } from "./show-banner-deps.types";

export async function showBottomBanner(deps: ShowBannerDeps): Promise<boolean> {
  return showBannerAd(deps, "bottom");
}
