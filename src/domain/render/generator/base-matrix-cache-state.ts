import type { QRCodeObject } from '../../../modules/qr-generator/cache';
import type { RGBWithMeta } from '../../../modules/qr-generator/types';

export const baseMatrixCacheState = {
  qr: null as QRCodeObject | null,
  scaledSize: 0,
  scale: 0,
  result: null as { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } | null,
};
