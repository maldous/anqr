import { currentBannerPosition } from "./banner-state-store";
import type { CurrentBannerPosition } from "./current-banner-position.type";

export function setCurrentBannerPosition(position: CurrentBannerPosition): void {
  currentBannerPosition.value = position;
}
