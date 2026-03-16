import { type Canvas } from "@napi-rs/canvas";
import { OverlayFilterOptions } from "./overlay-filter-options.types.ts";
import { cropOverlayServer } from "./crop-overlay-server.ts";
import { rotateOverlayServer } from "./rotate-overlay-server.ts";
import { flipOverlayServer } from "./flip-overlay-server.ts";
import { applyOverlayFiltersServer } from "./apply-overlay-filters-server.ts";

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
