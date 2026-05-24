import { type Canvas, type SKRSContext2D } from "@napi-rs/canvas";
import type { WatermarkOptions } from "./watermark-options.types";
import { applyBlendMode } from "./apply-blend-mode";
import { getWatermarkPositions } from "./get-watermark-positions";

export function drawWatermarkLayerServer(
  ctx: SKRSContext2D,
  options: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number,
): void {
  // options.imageCanvas now holds the pre-rendered watermark for every kind
  // (text rendered once at buildWatermarkOpts time; image/pattern already
  // pre-built). Previously text was re-rendered per frame via
  // createTextWatermark — a font-shape pass per frame on every animated GIF.
  // See review-2026-05-24 A-F3.
  const watermarkCanvas: Canvas | null = options.imageCanvas ?? null;

  if (!watermarkCanvas) return;

  ctx.save();
  applyBlendMode(ctx, options.blend);
  ctx.globalAlpha = options.opacity / 100;

  const positions = getWatermarkPositions(
    options.position,
    canvasWidth,
    canvasHeight,
    watermarkCanvas.width,
    watermarkCanvas.height,
    10,
  );

  for (const pos of positions) {
    ctx.drawImage(watermarkCanvas, pos.x, pos.y);
  }

  ctx.restore();
}
