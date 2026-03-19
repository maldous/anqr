import type { QRCodeObject, RGBWithMeta } from "@/domain/render/qr-generator-shared";

export const baseMatrixCacheState = {
  qr: null as QRCodeObject | null,
  scaledSize: 0,
  scale: 0,
  result: null as { matrix: boolean[][]; colors: (RGBWithMeta | null)[][] } | null,
};
