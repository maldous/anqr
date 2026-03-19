import { alignmentCache } from "../../../render/src/generator/alignment-cache";
import { registeredCleanups } from "../../../render/src/generator/registered-cleanups";
import { overlayDataCache } from "../../../render/src/overlay/overlay-data-cache";
import { qrMatrixCache } from "./qr-matrix-cache";

export function clearQRCaches(): void {
  alignmentCache.clear();
  overlayDataCache.clear();
  qrMatrixCache.clear();
  for (const fn of registeredCleanups) fn();
  // Note: canvasHashCache is a WeakMap, no need to clear - GC handles it
}
