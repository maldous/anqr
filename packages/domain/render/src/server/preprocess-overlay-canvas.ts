import { type Canvas } from "@napi-rs/canvas";
import { OverlayFilterOptions } from "./overlay-filter-options.types";
import { cropOverlayServer } from "./crop-overlay-server";
import { rotateOverlayServer } from "./rotate-overlay-server";
import { flipOverlayServer } from "./flip-overlay-server";
import { applyOverlayFiltersServer } from "./apply-overlay-filters-server";

export function preprocessOverlayCanvas(
  canvas: Canvas,
  cropEnabled: boolean,
  cropX: number,
  cropY: number,
  cropSize: number,
  overlayRotate: number,
  overlayFlipX: boolean,
  overlayFlipY: boolean,
  hasFilters: boolean,
  filterOptions: OverlayFilterOptions,
): Canvas {
  let processed = canvas;
  if (cropEnabled && cropSize < 1) {
    processed = cropOverlayServer(processed, cropX, cropY, cropSize);
  }
  if (overlayRotate !== 0) {
    processed = rotateOverlayServer(processed, overlayRotate);
  }
  if (overlayFlipX || overlayFlipY) {
    processed = flipOverlayServer(processed, overlayFlipX, overlayFlipY);
  }
  if (hasFilters) {
    processed = applyOverlayFiltersServer(processed, filterOptions);
  }
  return processed;
}
