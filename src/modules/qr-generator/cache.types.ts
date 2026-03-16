import type { QRCodeObject } from "./qr-code-object";
export type { QRCodeObject } from "./qr-code-object";
export type { OverlayDataMatrix } from "./overlay-data-matrix";

export interface QRMatrixCacheEntry {
  qr: QRCodeObject;
  moduleCount: number;
}
