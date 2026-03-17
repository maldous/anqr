import { roundRect } from "./drawing-primitives";
import type { QRGeneratorConfig } from "@/modules/qr-generator/types";

/**
 * Draw frame background (sticker style)
 */
export function drawFrameBackground(
  ctx: CanvasRenderingContext2D,
  size: number,
  _moduleSize: number,
  _margin: number,
  config: QRGeneratorConfig,
): void {
  if (!config.frameStyle || config.frameStyle === "none") return;

  const frameColor = config.frameColor || config.bgColor;

  // Determine border radius based on frame style
  let defaultRadius: number;
  if (config.frameStyle === "sticker") defaultRadius = 12;
  else if (config.frameStyle === "tag") defaultRadius = 4;
  else defaultRadius = 0;
  const borderRadius = config.frameBorderRadius ?? defaultRadius;

  ctx.fillStyle = frameColor;

  if (borderRadius > 0) {
    const radius = (borderRadius / 100) * (size / 4);
    roundRect(ctx, 0, 0, size, size, radius);
  } else {
    ctx.fillRect(0, 0, size, size);
  }
}
