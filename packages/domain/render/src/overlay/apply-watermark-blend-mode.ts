import type { WatermarkBlend } from "./watermark.types";

// ============================================
// BLEND MODES
// ============================================

export function applyWatermarkBlendMode(
  ctx: CanvasRenderingContext2D,
  blend: WatermarkBlend,
): void {
  switch (blend) {
    case "multiply":
      ctx.globalCompositeOperation = "multiply";
      break;
    case "screen":
      ctx.globalCompositeOperation = "screen";
      break;
    case "overlay":
      ctx.globalCompositeOperation = "overlay";
      break;
    case "soft-light":
      ctx.globalCompositeOperation = "soft-light";
      break;
    default:
      ctx.globalCompositeOperation = "source-over";
  }
}
