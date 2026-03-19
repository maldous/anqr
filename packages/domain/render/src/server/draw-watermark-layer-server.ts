import { type Canvas, type SKRSContext2D } from "@napi-rs/canvas";
import type { WatermarkOptions } from "./watermark-options.types";
import { createTextWatermark } from "./create-text-watermark";
import { applyBlendMode } from "./apply-blend-mode";
import { getWatermarkPositions } from "./get-watermark-positions";

export function drawWatermarkLayerServer(
  ctx: SKRSContext2D,
  options: WatermarkOptions,
  canvasWidth: number,
  canvasHeight: number,
): void {
  let watermarkCanvas: Canvas | null = null;

  if (options.kind === "text" && options.text) {
    watermarkCanvas = createTextWatermark(options.text, 14, "sans-serif", "#000000");
  } else if ((options.kind === "image" || options.kind === "pattern") && options.imageCanvas) {
    watermarkCanvas = options.imageCanvas;
  }

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
