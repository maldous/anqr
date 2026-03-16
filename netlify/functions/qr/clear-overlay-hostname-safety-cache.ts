import { overlayHostnameSafetyCache } from "./overlay-hostname-safety-cache.const";

export function _clearOverlayHostnameSafetyCache(): void {
  overlayHostnameSafetyCache.clear();
}
