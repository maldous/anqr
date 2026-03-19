export type { QRMatrixCacheEntry, QRCodeObject, OverlayDataMatrix } from "./cache.types";
export { MemoCache } from "./memo-cache";
export { alignmentCache } from "../../../render/src/generator/alignment-cache";
export { overlayDataCache } from "../../../render/src/overlay/overlay-data-cache";
export { qrMatrixCache } from "./qr-matrix-cache";
export { canvasHashCache } from "../../../render/src/overlay/canvas-hash-cache";
export { registerCacheCleanup } from "../../../render/src/generator/register-cache-cleanup";
export { clearQRCaches } from "./clear-qr-caches";
