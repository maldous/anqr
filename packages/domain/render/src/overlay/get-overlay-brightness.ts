import type { OverlayData } from "@/modules/qr-generator/types";
import { isPackedOverlayData } from "./is-packed-overlay-data";
import type { LegacyOverlayData } from "./legacy-overlay-data";

export function getOverlayBrightness(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number,
  fallback: number = 0.5,
): number {
  if (isPackedOverlayData(overlayData)) {
    const size = overlayData.size;
    if (row >= 0 && col >= 0 && row < size && col < size) {
      const value = overlayData.brightness[row * size + col];
      return Number.isFinite(value) ? value : fallback;
    }
  }

  const legacy = overlayData as LegacyOverlayData | null | undefined;
  const legacyValue = legacy?.[row]?.[col];
  return typeof legacyValue === "number" && Number.isFinite(legacyValue) ? legacyValue : fallback;
}
