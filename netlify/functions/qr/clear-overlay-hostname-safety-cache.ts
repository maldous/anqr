import { overlayHostnameSafetyCache } from "./overlay-hostname-safety-cache.const.ts";

export function _clearOverlayHostnameSafetyCache(): void {
  overlayHostnameSafetyCache.clear();
}
