import type { OverlayData } from "../../../modules/qr-generator/types";

export function isPackedOverlayData(
  overlayData: OverlayData | null | undefined,
): overlayData is OverlayData {
  return (
    !!overlayData &&
    overlayData.size > 0 &&
    overlayData.brightness instanceof Float32Array &&
    overlayData.brightness.length >= overlayData.size * overlayData.size
  );
}
