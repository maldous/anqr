import type { OverlayData } from "../../../modules/qr-generator/types";
import { isPackedOverlayData } from "./is-packed-overlay-data";
import type { LegacyOverlayData } from "./legacy-overlay-data";
import { packOverlayColor } from "./pack-overlay-color";

export function getOverlayColorPacked(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number,
): number {
  if (isPackedOverlayData(overlayData) && overlayData.colorsPacked) {
    const size = overlayData.size;
    if (row >= 0 && col >= 0 && row < size && col < size) {
      return overlayData.colorsPacked[row * size + col];
    }
  }

  const legacy = overlayData as LegacyOverlayData | null | undefined;
  const legacyColor = legacy?.colors?.[row]?.[col];
  if (!legacyColor) return 0;
  return packOverlayColor(legacyColor.r, legacyColor.g, legacyColor.b);
}
