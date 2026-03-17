import { currentBannerPosition } from "./banner-state-store";
import type { CurrentBannerPosition } from "./current-banner-position.types";

export function getCurrentBannerPosition(): CurrentBannerPosition {
  return currentBannerPosition.value;
}
