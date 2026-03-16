import { showBottomBanner as showBottomBannerCore } from "./show-bottom-banner-core";
import type { ShowBannerDeps } from "./show-banner-deps.types";

export async function showBottomBanner(deps: ShowBannerDeps) {
  return showBottomBannerCore(deps);
}
