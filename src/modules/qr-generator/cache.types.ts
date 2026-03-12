import type { OverlayData } from './types';

export interface QRMatrixCacheEntry {
  qr: QRCodeObject;
  moduleCount: number;
}

export interface QRCodeObject {
  isDark(row: number, col: number): boolean;
  getModuleCount(): number;
}

export type OverlayDataMatrix = OverlayData;
