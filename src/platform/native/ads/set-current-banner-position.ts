import { currentBannerPosition } from "./banner-state-store";
import type { CurrentBannerPosition } from "./current-banner-position.types";

export function setCurrentBannerPosition(position: CurrentBannerPosition): void {
  currentBannerPosition.value = position;
}
