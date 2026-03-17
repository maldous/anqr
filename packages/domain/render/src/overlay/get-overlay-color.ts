import type { OverlayData, RGBWithMeta } from "@/modules/qr-generator/types";
import { unpackOverlayColor } from "./unpack-overlay-color";
import { getOverlayColorPacked } from "./get-overlay-color-packed";

export function getOverlayColor(
  overlayData: OverlayData | null | undefined,
  row: number,
  col: number,
): RGBWithMeta | null {
  return unpackOverlayColor(getOverlayColorPacked(overlayData, row, col));
}
