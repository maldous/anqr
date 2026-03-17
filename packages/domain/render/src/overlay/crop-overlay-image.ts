import type { CropRegion } from "./processor.types";

// ============================================
// IMAGE TRANSFORMATION
// ============================================

export function cropOverlayImage(source: HTMLCanvasElement, region: CropRegion): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = region.width;
  canvas.height = region.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get 2D context");

  ctx.drawImage(
    source,
    region.x,
    region.y,
    region.width,
    region.height,
    0,
    0,
    region.width,
    region.height,
  );

  return canvas;
}
