import { alignmentCache, runRegisteredCacheCleanups } from "@/domain/render/generator";
import { overlayDataCache } from "@/domain/render/overlay";
import { qrMatrixCache } from "./qr-matrix-cache";

export function clearQRCaches(): void {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  runRegisteredCacheCleanups();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
